export type SqlParam = string | number | boolean | null
export type SqlRow = Record<string, string | number | boolean | null>

export interface SqlStatement {
  sql: string
  params?: SqlParam[]
}

export interface SqlStatementResult {
  rows: SqlRow[]
  rowsAffected: number
  lastInsertId: number | null
}

export interface SqlExecutor {
  executeSingleSql(statement: SqlStatement): Promise<SqlStatementResult>
  executeBatchSql(statements: SqlStatement[]): Promise<SqlStatementResult[]>
}

function getElectronSqlBridge() {
  const runtimeWindow = typeof window === "undefined"
    ? null
    : window as Window & { flowmSql?: SqlExecutor }

  if (runtimeWindow?.flowmSql == null) {
    throw new Error("Flowm API requires the Electron SQLite runtime")
  }

  return runtimeWindow.flowmSql
}

export class ElectronSqlExecutor implements SqlExecutor {
  async executeSingleSql(statement: SqlStatement): Promise<SqlStatementResult> {
    return getElectronSqlBridge().executeSingleSql({
      sql: statement.sql,
      params: statement.params ?? [],
    })
  }

  async executeBatchSql(
    statements: SqlStatement[],
  ): Promise<SqlStatementResult[]> {
    return getElectronSqlBridge().executeBatchSql(
      statements.map((statement) => ({
        sql: statement.sql,
        params: statement.params ?? [],
      })),
    )
  }
}
