import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

import type { SqlStatement, SqlStatementResult } from "@flowm/db"

const flowmSql = {
  executeSingleSql: (statement: SqlStatement) =>
    ipcRenderer.invoke("flowm-sql:execute-single", statement) as Promise<SqlStatementResult>,
  executeBatchSql: (statements: SqlStatement[]) =>
    ipcRenderer.invoke("flowm-sql:execute-batch", statements) as Promise<SqlStatementResult[]>,
}

const flowm = {
  platform: {
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
    name: process.platform,
  },
  getDatabasePath: () => ipcRenderer.invoke("flowm:get-database-path") as Promise<string>,
  databaseExists: () => ipcRenderer.invoke("flowm:database-exists") as Promise<boolean>,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("flowm", flowm)
    contextBridge.exposeInMainWorld("flowmSql", flowmSql)
  } catch (error) {
    console.error(error)
  }
} else {
  const globalWindow = window as typeof window & {
    electron: typeof electronAPI
    flowm: typeof flowm
    flowmSql: typeof flowmSql
  }

  globalWindow.electron = electronAPI
  globalWindow.flowm = flowm
  globalWindow.flowmSql = flowmSql
}
