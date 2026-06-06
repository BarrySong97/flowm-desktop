import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"

export const documents = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    filename: text("filename").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_documents_date").on(t.date),
    accountIdx: index("idx_documents_account").on(t.accountId),
  }),
)

export type DocumentRow = typeof documents.$inferSelect
export type DocumentInsert = typeof documents.$inferInsert
