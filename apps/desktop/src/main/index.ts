import { app, BrowserWindow, ipcMain, shell } from "electron"
import { electronApp, is, optimizer } from "@electron-toolkit/utils"
import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { AsyncLocalStorage } from "node:async_hooks"
import { performance } from "node:perf_hooks"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { createFlowmApi, type FlowmApi } from "@flowm/api"
import { type SqlRow, type SqlStatement, type SqlStatementResult, schema } from "@flowm/db"
import { appRouter } from "./trpc/router"

type SqlValue = string | number | boolean | null
type SqlBindValue = string | number | null


let db: Database.Database | null = null
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>
let drizzleDb: DrizzleDb | null = null
let api: FlowmApi | null = null

type TRPCRequest = {
  type: "query" | "mutation" | "subscription"
  path: string
  input: unknown
}

type SqlProfileSample = {
  durationMs: number
  rows: number
  rowsAffected: number
  paramsCount: number
  sql: string
}

type TRPCProfileContext = {
  requestId: string
  type: string
  path: string
  sqlCount: number
  sqlMs: number
  slowSql: SqlProfileSample[]
}

const trpcProfileStore = new AsyncLocalStorage<TRPCProfileContext>()
let trpcRequestSeq = 0

function configureUserDataPath(): void {
  app.setName("Flowm")
  app.setPath("userData", join(app.getPath("appData"), "com.flowm.desktop"))
}

function getDatabasePath(): string {
  return join(app.getPath("userData"), "flowm.sqlite3")
}

function getDatabase(): Database.Database {
  if (db != null) return db

  mkdirSync(app.getPath("userData"), { recursive: true })
  const database = new Database(getDatabasePath())
  database.pragma("foreign_keys = ON")
  db = database
  return database
}

function isQuery(sql: string): boolean {
  const lower = sql.trimStart().toLowerCase()
  return (
    lower.startsWith("select") ||
    lower.startsWith("with") ||
    lower.startsWith("explain") ||
    (lower.startsWith("pragma") && !lower.includes("="))
  )
}

function normalizeValue(value: unknown): SqlValue {
  if (value == null) {
    return null
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  if (typeof value === "bigint") {
    return Number(value)
  }

  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString("utf8")
  }

  return String(value)
}

function normalizeParam(value: SqlValue): SqlBindValue {
  return typeof value === "boolean" ? (value ? 1 : 0) : value
}

function normalizeRow(row: Record<string, unknown>): SqlRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]),
  )
}

function normalizeInsertId(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value
}

function normalizeChanges(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value
}

function roundMs(value: number): number {
  return Math.round(value * 10) / 10
}

function compactSql(sql: string): string {
  const compacted = sql.replace(/\s+/g, " ").trim()
  return compacted.length > 240 ? `${compacted.slice(0, 240)}...` : compacted
}

function recordSqlProfile(statement: SqlStatement, result: SqlStatementResult, durationMs: number): void {
  const profile = trpcProfileStore.getStore()
  if (profile == null) return

  profile.sqlCount += 1
  profile.sqlMs += durationMs
  profile.slowSql.push({
    durationMs: roundMs(durationMs),
    rows: result.rows.length,
    rowsAffected: result.rowsAffected,
    paramsCount: statement.params?.length ?? 0,
    sql: compactSql(statement.sql),
  })
  profile.slowSql.sort((a, b) => b.durationMs - a.durationMs)
  profile.slowSql.splice(8)
}

function finishTRPCProfile(profile: TRPCProfileContext, startedAt: number) {
  return {
    requestId: profile.requestId,
    type: profile.type,
    path: profile.path,
    mainMs: roundMs(performance.now() - startedAt),
    sqlCount: profile.sqlCount,
    sqlMs: roundMs(profile.sqlMs),
    slowSql: profile.slowSql,
  }
}

function executeSingleSql(statement: SqlStatement): SqlStatementResult {
  const startedAt = performance.now()
  const database = getDatabase()
  const params = (statement.params ?? []).map(normalizeParam)
  const prepared = database.prepare(statement.sql)
  let result: SqlStatementResult

  if (isQuery(statement.sql)) {
    result = {
      rows: prepared.all(...params).map((row) => normalizeRow(row as Record<string, unknown>)),
      rowsAffected: 0,
      lastInsertId: null,
    }
    recordSqlProfile(statement, result, performance.now() - startedAt)
    return result
  }

  const runResult = prepared.run(...params)
  result = {
    rows: [],
    rowsAffected: normalizeChanges(runResult.changes),
    lastInsertId: normalizeInsertId(runResult.lastInsertRowid),
  }
  recordSqlProfile(statement, result, performance.now() - startedAt)
  return result
}

function executeBatchSql(statements: SqlStatement[]): SqlStatementResult[] {
  if (statements.some((statement) => /^pragma\s+foreign_keys\s*=/i.test(statement.sql.trim()))) {
    return statements.map((statement) => executeSingleSql(statement))
  }
  const database = getDatabase()
  const execute = database.transaction((batch: SqlStatement[]) =>
    batch.map((statement) => executeSingleSql(statement)),
  )
  return execute(statements)
}

function getFlowmApiForMain(): FlowmApi {
  api ??= createFlowmApi(getDrizzleDb())
  return api
}

function getMigrationsFolder(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, "migrations")
  }
  // In dev, resolve from the monorepo packages/db directory
  return join(app.getAppPath(), "../../packages/db/migrations")
}

function getDrizzleDb(): DrizzleDb {
  if (drizzleDb != null) return drizzleDb
  drizzleDb = drizzle(getDatabase(), { schema })
  return drizzleDb
}

function runMigrations(): void {
  migrate(getDrizzleDb(), { migrationsFolder: getMigrationsFolder() })
}

function getCallerProcedure(caller: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((target, segment) => {
    if (target && (typeof target === "object" || typeof target === "function")) {
      return (target as Record<string, unknown>)[segment]
    }
    return undefined
  }, caller)
}

function serializeError(error: unknown): { message: string } {
  return { message: error instanceof Error ? error.message : String(error) }
}

function registerSqlHandlers(): void {
  ipcMain.handle("flowm-sql:execute-single", (_event, statement: SqlStatement) =>
    executeSingleSql(statement),
  )
  ipcMain.handle("flowm-sql:execute-batch", (_event, statements: SqlStatement[]) =>
    executeBatchSql(statements),
  )
  ipcMain.handle("flowm:get-database-path", () => getDatabasePath())
  ipcMain.handle("flowm:database-exists", () => existsSync(getDatabasePath()))
}

function registerTrpcHandler(): void {
  ipcMain.handle("trpc:request", async (_event, request: TRPCRequest) => {
    if (request.type === "subscription") {
      return {
        ok: false,
        error: { message: "Subscriptions are not supported over this IPC link" },
      }
    }

    let caller: ReturnType<typeof appRouter.createCaller>
    try {
      caller = appRouter.createCaller({ api: getFlowmApiForMain() })
    } catch (error) {
      return { ok: false, error: serializeError(error) }
    }

    const procedure = getCallerProcedure(caller, request.path)
    if (typeof procedure !== "function") {
      return {
        ok: false,
        error: { message: `Unknown tRPC procedure: ${request.path}` },
      }
    }

    const startedAt = performance.now()
    const profile: TRPCProfileContext = {
      requestId: `main-${++trpcRequestSeq}`,
      type: request.type,
      path: request.path,
      sqlCount: 0,
      sqlMs: 0,
      slowSql: [],
    }

    try {
      const data = await trpcProfileStore.run(profile, () => procedure(request.input))
      return { ok: true, data, profile: finishTRPCProfile(profile, startedAt) }
    } catch (error) {
      return { ok: false, error: serializeError(error), profile: finishTRPCProfile(profile, startedAt) }
    }
  })
}

function createWindow(): BrowserWindow {
  const macWindowOptions =
    process.platform === "darwin"
      ? ({
          backgroundColor: "#00000000",
          trafficLightPosition: { x: 12, y: 8 },
          transparent: true,
          vibrancy: "sidebar",
          visualEffectState: "active",
        } as const)
      : {}

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 860,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    title: "Flowm",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    ...macWindowOptions,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      contextIsolation: true,
    },
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: "detach" })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    const indexUrl = pathToFileURL(join(__dirname, "../renderer/index.html")).toString()
    mainWindow.loadURL(`${indexUrl}#/`)
  }

  return mainWindow
}

configureUserDataPath()

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.flowm.desktop")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerSqlHandlers()
  try {
    runMigrations()
  } catch (err) {
    console.error("[flowm] Migration failed — running without migration:", err)
  }
  registerTrpcHandler()
  createWindow()
})

app.on("window-all-closed", () => {
  db?.close()
  db = null
  drizzleDb = null
  api = null

  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
