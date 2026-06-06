import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"

export const pads = sqliteTable(
  "pads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    sourceAccountId: integer("source_account_id")
      .notNull()
      .references(() => accounts.id),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_pads_date").on(t.date),
    accountIdx: index("idx_pads_account").on(t.accountId),
  }),
)

export type PadRow = typeof pads.$inferSelect
export type PadInsert = typeof pads.$inferInsert
