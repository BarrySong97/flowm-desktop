import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"

// One row per parsed `txn` directive. Field semantics follow beancount/core/data.py:Transaction.
// `narration` is never null in beancount — we represent the absent case as the empty string.
// `origin` distinguishes user-authored entries from those synthesized by pad/summarize/etc.
export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(), // ISO date
    flag: text("flag").notNull().default("*"), // *,!,P,S,T,C,M or user-defined char
    payee: text("payee"),
    narration: text("narration").notNull().default(""),
    origin: text("origin", { enum: ["user", "auto"] })
      .notNull()
      .default("user"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_txn_date").on(t.date),
  }),
)

export type TransactionRow = typeof transactions.$inferSelect
export type TransactionInsert = typeof transactions.$inferInsert
