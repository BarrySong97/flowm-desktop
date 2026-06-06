import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"

export const notes = sqliteTable(
  "notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    comment: text("comment").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_notes_date").on(t.date),
    accountIdx: index("idx_notes_account").on(t.accountId),
  }),
)

export type NoteRow = typeof notes.$inferSelect
export type NoteInsert = typeof notes.$inferInsert
