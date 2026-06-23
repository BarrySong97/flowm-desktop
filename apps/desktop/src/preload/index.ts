/**
 * @purpose Expose the typed Flowm bridge from Electron preload to the renderer.
 * @role    Secure IPC adapter that keeps renderer code away from Node and SQLite.
 * @deps    Electron contextBridge/ipcRenderer and platform metadata.
 * @gotcha  Only expose narrow, typed APIs; avoid leaking raw Electron or filesystem access.
 */

import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import type { LedgerChangeEvent, UpdateStatusEvent } from "@flowm/shared/ipc"

type RendererLedgerChangeEvent = LedgerChangeEvent & { receivedAt: string }

const flowm = {
  platform: {
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
    name: process.platform,
  },
  getDatabasePath: () => ipcRenderer.invoke("flowm:get-database-path") as Promise<string | null>,
  databaseExists: () => ipcRenderer.invoke("flowm:database-exists") as Promise<boolean>,
  trpcRequest: (request: { type: string; path: string; input: unknown }) =>
    ipcRenderer.invoke("trpc:request", request) as Promise<unknown>,
  onLedgerChanged: (callback: (event: RendererLedgerChangeEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: RendererLedgerChangeEvent) => {
      callback(payload)
    }
    ipcRenderer.on("flowm:ledger-changed", listener)
    return () => {
      ipcRenderer.removeListener("flowm:ledger-changed", listener)
    }
  },
  getAppVersion: () => ipcRenderer.invoke("flowm:app-version") as Promise<string>,
  updater: {
    check: () => ipcRenderer.invoke("flowm:updater:check") as Promise<void>,
    download: () => ipcRenderer.invoke("flowm:updater:download") as Promise<void>,
    onStatus: (callback: (event: UpdateStatusEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: UpdateStatusEvent) => {
        callback(payload)
      }
      ipcRenderer.on("flowm:updater:status", listener)
      return () => {
        ipcRenderer.removeListener("flowm:updater:status", listener)
      }
    },
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("flowm", flowm)
  } catch (error) {
    console.error(error)
  }
} else {
  const globalWindow = window as typeof window & {
    electron: typeof electronAPI
    flowm: typeof flowm
  }

  globalWindow.electron = electronAPI
  globalWindow.flowm = flowm
}
