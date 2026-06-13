import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

const flowm = {
  platform: {
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
    name: process.platform,
  },
  getDatabasePath: () => ipcRenderer.invoke("flowm:get-database-path") as Promise<string>,
  databaseExists: () => ipcRenderer.invoke("flowm:database-exists") as Promise<boolean>,
  trpcRequest: (request: { type: string; path: string; input: unknown }) =>
    ipcRenderer.invoke("trpc:request", request) as Promise<unknown>,
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
