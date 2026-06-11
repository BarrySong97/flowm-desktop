import { app, BrowserWindow, ipcMain, shell } from "electron"
import { electronApp, is, optimizer } from "@electron-toolkit/utils"
import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import type { SqlRow, SqlStatement, SqlStatementResult } from "@flowm/db"

type SqlValue = string | number | boolean | null

let db: Database.Database | null = null

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

function executeSingleSql(statement: SqlStatement): SqlStatementResult {
  const database = getDatabase()
  const params = statement.params ?? []
  const prepared = database.prepare(statement.sql)

  if (isQuery(statement.sql)) {
    return {
      rows: prepared.all(...params).map((row) => normalizeRow(row as Record<string, unknown>)),
      rowsAffected: 0,
      lastInsertId: null,
    }
  }

  const result = prepared.run(...params)
  return {
    rows: [],
    rowsAffected: normalizeChanges(result.changes),
    lastInsertId: normalizeInsertId(result.lastInsertRowid),
  }
}

function executeBatchSql(statements: SqlStatement[]): SqlStatementResult[] {
  return statements.map((statement) => executeSingleSql(statement))
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.flowm.desktop")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerSqlHandlers()
  createWindow()
})

app.on("window-all-closed", () => {
  db?.close()
  db = null

  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
