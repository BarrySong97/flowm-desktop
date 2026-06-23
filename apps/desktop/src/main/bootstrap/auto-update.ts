/**
 * @purpose Wire electron-updater to a GitHub Releases feed and relay update lifecycle to the renderer.
 * @role    Main-process auto-update controller: launch check, manual check, download, and quit-to-install.
 * @deps    electron-updater autoUpdater, Electron ipcMain/BrowserWindow, and shared UpdateStatusEvent.
 * @gotcha  No-ops in dev (no GitHub feed); macOS auto-install requires a signed + notarized build and a zip artifact.
 */

import { ipcMain, type BrowserWindow } from "electron"
import electronUpdater from "electron-updater"
import type { UpdateStatusEvent } from "@flowm/shared/ipc"

import { isDevRuntime } from "./runtime-env"

// electron-updater ships as CommonJS; the named autoUpdater export is on default.
const { autoUpdater } = electronUpdater

const UPDATE_STATUS_CHANNEL = "flowm:updater:status"

type GetWindow = () => BrowserWindow | null

let initialized = false
let installing = false

function emit(getWindow: GetWindow, event: UpdateStatusEvent): void {
  const window = getWindow()
  if (window && !window.isDestroyed()) {
    window.webContents.send(UPDATE_STATUS_CHANNEL, event)
  }
}

function registerHandlers(): void {
  // Manual check from the settings page and the launch check share this path.
  ipcMain.handle("flowm:updater:check", async () => {
    await autoUpdater.checkForUpdates()
  })
  // Triggered when the user clicks the bottom-right update popup.
  ipcMain.handle("flowm:updater:download", async () => {
    await autoUpdater.downloadUpdate()
  })
}

/**
 * Initialise auto-update once the main window exists. Safe to call exactly once
 * from app.whenReady(); subsequent calls are ignored.
 */
export function initAutoUpdate(getWindow: GetWindow): void {
  if (initialized) return
  initialized = true

  // Dev runs must never hit the GitHub release feed (an unpackaged app has no
  // update metadata, so autoUpdater would throw). Expose inert handlers so the
  // renderer's check/download calls still resolve, and report "not-available".
  if (isDevRuntime()) {
    ipcMain.handle("flowm:updater:check", () => emit(getWindow, { state: "not-available" }))
    ipcMain.handle("flowm:updater:download", () => {})
    return
  }

  autoUpdater.logger = console
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on("checking-for-update", () => emit(getWindow, { state: "checking" }))
  autoUpdater.on("update-available", (info) =>
    emit(getWindow, { state: "available", version: info.version }),
  )
  autoUpdater.on("update-not-available", (info) =>
    emit(getWindow, { state: "not-available", version: info.version }),
  )
  autoUpdater.on("download-progress", (progress) =>
    emit(getWindow, { state: "downloading", percent: Math.round(progress.percent) }),
  )
  autoUpdater.on("update-downloaded", (info) => {
    emit(getWindow, { state: "downloaded", version: info.version })
    if (installing) return
    installing = true
    // Restart and apply — the "更新完之后重新打开自动完成" behaviour.
    autoUpdater.quitAndInstall()
  })
  autoUpdater.on("error", (error) =>
    emit(getWindow, {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    }),
  )

  registerHandlers()

  // One silent check on launch; failures surface through the "error" event.
  void autoUpdater.checkForUpdates().catch(() => {})
}
