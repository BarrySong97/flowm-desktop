import { defineConfig } from "drizzle-kit"

// Keep generated SQL in this package so migrations can be reviewed without
// depending on desktop packaging details.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema",
  out: "./migrations",
  verbose: true,
  strict: true,
  casing: "snake_case",
})
