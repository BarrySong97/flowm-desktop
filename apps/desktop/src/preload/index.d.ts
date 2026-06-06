import type { ElectronAPI } from "@electron-toolkit/preload"
import type { SqlStatement, SqlStatementResult } from "@flowm/db"

declare global {
  interface Window {
    electron: ElectronAPI
    flowm: {
      platform: {
        isMac: boolean
        isWindows: boolean
        isLinux: boolean
        name: NodeJS.Platform
      }
      getDatabasePath: () => Promise<string>
      databaseExists: () => Promise<boolean>
    }
    flowmSql: {
      executeSingleSql: (statement: SqlStatement) => Promise<SqlStatementResult>
      executeBatchSql: (statements: SqlStatement[]) => Promise<SqlStatementResult[]>
    }
  }
}

export {}
