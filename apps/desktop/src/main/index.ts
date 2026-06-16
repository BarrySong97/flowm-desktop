/**
 * @purpose Bootstrap the Electron app, set the Flowm data location, run migrations, and open the desktop window.
 * @role    Main-process composition root for native modules, SQLite, BrowserWindow, and IPC.
 * @deps    Electron, better-sqlite3, Drizzle migrations, @flowm/api, and @flowm/db.
 * @gotcha  Keep userData at com.flowm.desktop and keep SQLite ownership in the main process.
 */

import { app, BrowserWindow, ipcMain, nativeImage, shell } from "electron"
import { electronApp, is, optimizer } from "@electron-toolkit/utils"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { performance } from "node:perf_hooks"

import { appRouter } from "./trpc/router"
import { LedgerStore } from "./ledgers"

const ledgerStore = new LedgerStore()

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

function getDevIconPath(): string {
  return join(__dirname, "../../resources/icons/flowm.iconset/icon_512x512@2x.png")
}

function getDevIcon() {
  const icon = nativeImage.createFromPath(getDevIconPath())
  return icon.isEmpty() ? undefined : icon
}

function configureDevDockIcon(): void {
  if (!is.dev || process.platform !== "darwin" || !app.dock) {
    return
  }

  const icon = getDevIcon()
  if (icon) {
    app.dock.setIcon(icon)
  }
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
  ipcMain.handle("flowm:get-database-path", () => ledgerStore.getActiveFilePath())
  ipcMain.handle("flowm:database-exists", () => {
    const path = ledgerStore.getActiveFilePath()
    return path != null && existsSync(path)
  })
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
      caller = appRouter.createCaller({ api: ledgerStore.getApi(), ledgers: ledgerStore })
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
      return {
        ok: false,
        error: serializeError(error),
        profile: finishTRPCProfile(request, startedAt),
      }
    }
  })
}

function createWindow(): BrowserWindow {
  const devIcon = is.dev ? getDevIcon() : undefined
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
    icon: devIcon,
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
    configureDevDockIcon()
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
  configureDevDockIcon()

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAppHandlers()
  try {
    await ledgerStore.init()
  } catch (err) {
    console.error("[flowm] Ledger init failed:", err)
  }
  registerTrpcHandler()
  createWindow()
})

app.on("window-all-closed", () => {
  ledgerStore.close()

  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
