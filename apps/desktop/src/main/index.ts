/**
 * @purpose Bootstrap the Electron app, set the Flowm data location, run migrations, and open the desktop window.
 * @role    Main-process composition root for native modules, SQLite, BrowserWindow, and IPC.
 * @deps    Electron, better-sqlite3, Drizzle migrations, @flowm/api, and @flowm/db.
 * @gotcha  Keep userData at com.flowm.desktop and keep SQLite ownership in the main process.
 */

import { app, BrowserWindow, ipcMain, shell } from "electron"
import { electronApp, is, optimizer } from "@electron-toolkit/utils"
import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { performance } from "node:perf_hooks"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { createFlowmApi, type FlowmApi } from "@flowm/api"
import { schema } from "@flowm/db"
import { appRouter } from "./trpc/router"

let db: Database.Database | null = null
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>
let drizzleDb: DrizzleDb | null = null
let api: FlowmApi | null = null

type TRPCRequest = {
  type: "query" | "mutation" | "subscription"
  path: string
  input: unknown
}

type TRPCProfile = {
  requestId: string
  type: string
  path: string
  mainMs: number
}

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

function roundMs(value: number): number {
  return Math.round(value * 10) / 10
}

function finishTRPCProfile(request: TRPCRequest, startedAt: number): TRPCProfile {
  return {
    requestId: `main-${++trpcRequestSeq}`,
    type: request.type,
    path: request.path,
    mainMs: roundMs(performance.now() - startedAt),
  }
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

function registerAppHandlers(): void {
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
    try {
      const data = await procedure(request.input)
      return { ok: true, data, profile: finishTRPCProfile(request, startedAt) }
    } catch (error) {
      return { ok: false, error: serializeError(error), profile: finishTRPCProfile(request, startedAt) }
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

  registerAppHandlers()
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
