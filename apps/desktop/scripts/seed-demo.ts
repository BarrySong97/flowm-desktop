import { existsSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import BetterSqlite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { seedDemoData, type DemoSeedOptions } from "@flowm/api/demo-seed"
import { schema, type Database } from "@flowm/db"

type CliOptions = DemoSeedOptions & {
  dbPath: string
  force: boolean
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_DB_PATH = join(homedir(), "Library", "Application Support", "com.flowm.desktop", "flowm.sqlite3")
const migrationsFolder = resolve(__dirname, "../../../packages/db/migrations")

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dbPath: DEFAULT_DB_PATH,
    force: false,
    dryRun: false,
    validate: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
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

function openDrizzleDb(options: CliOptions): { db: Database; close: () => void } {
  const willWrite = options.force && !options.dryRun
  if (willWrite) {
    mkdirSync(dirname(options.dbPath), { recursive: true })
  }

  const client = new BetterSqlite3(willWrite ? options.dbPath : ":memory:")
  client.pragma("foreign_keys = ON")
  const db = drizzle(client, { schema })

  if (willWrite) {
    migrate(db, { migrationsFolder })
  }

  return { db, close: () => client.close() }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const willWrite = options.force && !options.dryRun
  const dbExists = existsSync(options.dbPath)
  const { db, close } = openDrizzleDb(options)

  try {
    const report = await seedDemoData(db, options)
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
  } finally {
    close()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
