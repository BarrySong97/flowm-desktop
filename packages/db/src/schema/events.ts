import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_events_date").on(t.date),
    typeIdx: index("idx_events_type").on(t.type),
  }),
)

export type EventRow = typeof events.$inferSelect
export type EventInsert = typeof events.$inferInsert
