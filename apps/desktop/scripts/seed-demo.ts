import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { seedDemoData, type DemoSeedOptions } from "@flowm/api/demo-seed"
import type { SqlExecutor, SqlParam, SqlRow, SqlStatement, SqlStatementResult } from "@flowm/db"

type CliOptions = DemoSeedOptions & {
  dbPath: string
  force: boolean
}

type SqlValue = string | number | boolean | null

const DEFAULT_DB_PATH = join(homedir(), "Library", "Application Support", "com.flowm.desktop", "flowm.sqlite3")

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dbPath: DEFAULT_DB_PATH,
    force: false,
    dryRun: false,
    validate: false,
  }

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === "--") {
      continue
    } else if (arg === "--force") {
      options.force = true
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--validate") {
      options.validate = true
    } else if (arg === "--db") {
      const value = argv[++index]
      if (!value) throw new Error("--db requires a path")
      options.dbPath = resolve(value)
    } else if (arg === "--anchor") {
      const value = argv[++index]
      if (!value) throw new Error("--anchor requires YYYY-MM-DD")
      options.anchorDate = value
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!options.force) {
    options.dryRun = true
  }

  return options
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

function quoteSqlParam(param: SqlParam): string {
  if (param == null) return "NULL"
  if (typeof param === "number") return String(param)
  if (typeof param === "boolean") return param ? "1" : "0"
  return `'${param.replace(/'/g, "''")}'`
}

function bindSql(sql: string, params: SqlParam[] = []): string {
  let index = 0
  const bound = sql.replace(/\?/g, () => quoteSqlParam(params[index++]))
  if (index !== params.length) throw new Error(`SQL parameter mismatch for ${sql}`)
  return bound
}

function normalizeValue(value: unknown): SqlValue {
  if (value == null) return null
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value
  if (typeof value === "bigint") return Number(value)
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString("utf8")
  }
  return String(value)
}

function normalizeRow(row: Record<string, unknown>): SqlRow {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]))
}

function parseRows(output: string): SqlRow[] {
  const trimmed = output.trim()
  return trimmed.length === 0 ? [] : JSON.parse(trimmed) as SqlRow[]
}

function canWrapInTransaction(statements: SqlStatement[]): boolean {
  return !statements.some((statement) => /^pragma\s+foreign_keys\s*=/i.test(statement.sql.trim()))
}

function statementSql(sql: string): string {
  return `${sql.trim().replace(/;+\s*$/, "")};`
}

class SqliteCliExecutor implements SqlExecutor {
  constructor(private readonly dbPath: string) {}

  async executeSingleSql(statement: SqlStatement): Promise<SqlStatementResult> {
    const sql = bindSql(statement.sql, statement.params)
    if (isQuery(sql)) {
      const output = execFileSync("sqlite3", ["-json", this.dbPath, sql], { encoding: "utf8" })
      return {
        rows: parseRows(output).map((row) => normalizeRow(row)),
        rowsAffected: 0,
        lastInsertId: null,
      }
    }
    const output = execFileSync(
      "sqlite3",
      ["-json", this.dbPath, `${sql}; select changes() as rowsAffected, last_insert_rowid() as lastInsertId;`],
      { encoding: "utf8" },
    )
    const [metadata] = parseRows(output) as Array<{ rowsAffected?: number; lastInsertId?: number }>
    return {
      rows: [],
      rowsAffected: metadata?.rowsAffected ?? 0,
      lastInsertId: metadata?.lastInsertId ?? null,
    }
  }

  async executeBatchSql(statements: SqlStatement[]): Promise<SqlStatementResult[]> {
    if (statements.some((statement) => isQuery(statement.sql))) {
      const results: SqlStatementResult[] = []
      for (const statement of statements) results.push(await this.executeSingleSql(statement))
      return results
    }
    const body = statements
      .map((statement) => statementSql(bindSql(statement.sql, statement.params)))
      .join("\n")
    const script = canWrapInTransaction(statements) ? `BEGIN;\n${body}\nCOMMIT;` : body
    execFileSync("sqlite3", ["-batch", "-bail", this.dbPath, script], { encoding: "utf8" })
    return statements.map(() => ({ rows: [], rowsAffected: 0, lastInsertId: null }))
  }
}

class DryRunExecutor implements SqlExecutor {
  async executeSingleSql(): Promise<SqlStatementResult> {
    throw new Error("Dry-run executor cannot execute SQL")
  }

  async executeBatchSql(): Promise<SqlStatementResult[]> {
    throw new Error("Dry-run executor cannot execute SQL")
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const willWrite = options.force && !options.dryRun
  const dbExists = existsSync(options.dbPath)

  const executor = willWrite
    ? (() => {
        mkdirSync(dirname(options.dbPath), { recursive: true })
        return new SqliteCliExecutor(options.dbPath)
      })()
    : new DryRunExecutor()

  const report = await seedDemoData(executor, options)
  console.log(JSON.stringify({
    target: options.dbPath,
    databaseExistedBeforeRun: dbExists,
    force: options.force,
    dryRun: report.dryRun,
    message: willWrite
      ? "Demo data written. Only demo_ rows were deleted and rebuilt."
      : "Dry run only. Pass --force to write the target database.",
    report,
  }, null, 2))

  if (report.validation && !report.validation.ok) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
