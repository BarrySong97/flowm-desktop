import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const customs = sqliteTable(
  "customs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    type: text("type").notNull(),
    values: text("values", { mode: "json" })
      .$type<unknown[]>()
      .notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_customs_date").on(t.date),
    typeIdx: index("idx_customs_type").on(t.type),
  }),
)

export type CustomRow = typeof customs.$inferSelect
export type CustomInsert = typeof customs.$inferInsert
