/**
 * @purpose Configure Drizzle migration generation for the Flowm SQLite schema.
 * @role    Database tooling entry point for schema-to-migration workflows.
 * @deps    drizzle-kit and packages/db schema/migrations paths.
 * @gotcha  Review generated migrations before shipping because they affect user data.
 */

import { defineConfig } from "drizzle-kit"

// Keep generated SQL in this package so migrations can be reviewed without
// depending on desktop packaging details.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  verbose: true,
  strict: true,
  casing: "snake_case",
})
