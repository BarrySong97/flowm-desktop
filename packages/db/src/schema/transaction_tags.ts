import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { tags } from "./tags"
import { transactions } from "./transactions"

export const transactionTags = sqliteTable(
  "transaction_tags",
  {
    txnId: integer("txn_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    tag: text("tag")
      .notNull()
      .references(() => tags.tag, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.txnId, t.tag] }),
  }),
)

export type TransactionTagRow = typeof transactionTags.$inferSelect
export type TransactionTagInsert = typeof transactionTags.$inferInsert
