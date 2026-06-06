import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const queries = sqliteTable(
  "queries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    name: text("name").notNull(),
    queryString: text("query_string").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_queries_date").on(t.date),
    nameIdx: index("idx_queries_name").on(t.name),
  }),
)

export type QueryRow = typeof queries.$inferSelect
export type QueryInsert = typeof queries.$inferInsert
