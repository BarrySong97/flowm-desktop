import { sqliteTable, text, integer, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { ACCOUNT_TYPES, BOOKING_METHODS } from "@flowm/shared"

// One row per `open` directive. `closed_at` is filled in when a matching `close`
// directive is seen. We enforce beancount semantics elsewhere: an account must be
// opened before any posting references it.
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // "Assets:Bank:Checking"
  type: text("type", { enum: [...ACCOUNT_TYPES] }).notNull(),
  openedAt: text("opened_at").notNull(), // ISO date
  closedAt: text("closed_at"), // ISO date, NULL while open
  booking: text("booking", { enum: [...BOOKING_METHODS] })
    .notNull()
    .default("STRICT"),
  // Self-FK so we can walk the colon hierarchy in SQL. Maintained by the writer
  // from the parsed account name; `name` remains the source of truth.
  parentId: integer("parent_id").references(
    (): AnySQLiteColumn => accounts.id,
  ),
  meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
})

export type AccountRow = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert
