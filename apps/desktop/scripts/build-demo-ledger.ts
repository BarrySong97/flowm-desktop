/**
 * @purpose Build the packaged demo ledger SQLite file used by the desktop app.
 * @role    Release/development script for generating demo resources.
 * @deps    better-sqlite3, Drizzle migrations, @flowm/api seed helpers, and desktop resources.
 * @gotcha  The output is an app resource, not the user ledger.
 */

import { mkdirSync, rmSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import BetterSqlite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { seedDemoData } from "@flowm/api/demo-seed"
import { seedDefaultCategories } from "@flowm/api/default-seed"
import { schema } from "@flowm/db"

// Regenerate the bundled sample ledger. The artifact is committed and shipped via
// electron-builder extraResources, then copied into userData on first run.
//
// Re-run with `pnpm -F desktop build:demo` whenever the schema, migrations, default
// categories, or demo data change.

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEMO_ANCHOR = "2026-06-12"
const migrationsFolder = resolve(__dirname, "../../../packages/db/migrations")
const outputPath = resolve(__dirname, "../resources/flowm-demo.sqlite3")

async function main() {
  mkdirSync(dirname(outputPath), { recursive: true })
  rmSync(outputPath, { force: true })
  rmSync(`${outputPath}-wal`, { force: true })
  rmSync(`${outputPath}-shm`, { force: true })

  const client = new BetterSqlite3(outputPath)
  client.pragma("foreign_keys = ON")
  const db = drizzle(client, { schema })

  try {
    migrate(db, { migrationsFolder })
    await seedDefaultCategories(db)
    const report = await seedDemoData(db, { anchorDate: DEMO_ANCHOR, validate: true })
    console.log(JSON.stringify({
      output: outputPath,
      anchorDate: DEMO_ANCHOR,
      validationOk: report.validation?.ok ?? null,
      tableCounts: report.tableCounts,
    }, null, 2))
    if (report.validation && !report.validation.ok) {
      console.error("Demo validation failed:", report.validation.issues)
      process.exitCode = 1
    }
  } finally {
    client.close()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
