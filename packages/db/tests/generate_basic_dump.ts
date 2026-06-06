import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  dumpBeancount,
  SqliteStorageAdapter,
  type SqlExecutor,
  type SqlParam,
  type SqlRow,
  type SqlStatement,
  type SqlStatementResult,
} from "../src"

function quoteSqlParam(param: SqlParam): string {
  if (param == null) return "NULL"
  if (typeof param === "number") return String(param)
  if (typeof param === "boolean") return param ? "1" : "0"
  return `'${param.replace(/'/g, "''")}'`
}

function bindSql(sql: string, params: SqlParam[] = []): string {
  let index = 0
  const bound = sql.replace(/\?/g, () => {
    if (index >= params.length) {
      throw new Error(`Missing SQL parameter for statement: ${sql}`)
    }
    const value = quoteSqlParam(params[index])
    index += 1
    return value
  })
  if (index !== params.length) {
    throw new Error(`Too many SQL parameters for statement: ${sql}`)
  }
  return bound
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

function parseRows(output: string): SqlRow[] {
  const trimmed = output.trim()
  if (trimmed.length === 0) return []
  return JSON.parse(trimmed) as SqlRow[]
}

class SqliteCliExecutor implements SqlExecutor {
  constructor(private readonly dbPath: string) {}

  async executeSingleSql(
    statement: SqlStatement,
  ): Promise<SqlStatementResult> {
    const sql = bindSql(statement.sql, statement.params)
    if (isQuery(sql)) {
      const output = execFileSync("sqlite3", ["-json", this.dbPath, sql], {
        encoding: "utf8",
      })
      return { rows: parseRows(output), rowsAffected: 0, lastInsertId: null }
    }

    const output = execFileSync(
      "sqlite3",
      [
        "-json",
        this.dbPath,
        `${sql}; select changes() as rowsAffected, last_insert_rowid() as lastInsertId;`,
      ],
      { encoding: "utf8" },
    )
    const [metadata] = parseRows(output) as Array<{
      rowsAffected?: number
      lastInsertId?: number
    }>
    return {
      rows: [],
      rowsAffected: metadata?.rowsAffected ?? 0,
      lastInsertId: metadata?.lastInsertId ?? null,
    }
  }

  async executeBatchSql(
    statements: SqlStatement[],
  ): Promise<SqlStatementResult[]> {
    const results: SqlStatementResult[] = []
    for (const statement of statements) {
      results.push(await this.executeSingleSql(statement))
    }
    return results
  }
}

function expectSuccess<T>(result: { success: true; data: T } | { success: false; error: string }): T {
  if (result.success) return result.data
  throw new Error(result.error)
}

const outputPath = resolve(
  process.argv[2] ?? "../../../.context/parity/basic.dump.beancount",
)
const dbPath = resolve(
  process.argv[3] ?? `${dirname(outputPath)}/basic.sqlite3`,
)
mkdirSync(dirname(outputPath), { recursive: true })
mkdirSync(dirname(dbPath), { recursive: true })
rmSync(dbPath, { force: true })

const adapter = new SqliteStorageAdapter(new SqliteCliExecutor(dbPath))
expectSuccess(await adapter.initialize())
expectSuccess(
  await adapter.openAccount({
    name: "Assets:Bank:Checking",
    openedAt: "2024-01-01",
    allowedCurrencies: ["USD"],
  }),
)
expectSuccess(
  await adapter.openAccount({
    name: "Expenses:Food",
    openedAt: "2024-01-01",
    allowedCurrencies: ["USD"],
  }),
)
expectSuccess(
  await adapter.createTransaction({
    date: "2024-01-02",
    flag: "*",
    payee: "Cafe",
    narration: "Lunch",
    postings: [
      {
        account: "Assets:Bank:Checking",
        units: { number: "-12.50", currency: "USD" },
      },
      {
        account: "Expenses:Food",
        units: { number: "12.50", currency: "USD" },
      },
    ],
  }),
)

writeFileSync(outputPath, await dumpBeancount(adapter))
console.log(outputPath)
