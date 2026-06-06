import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { links } from "./links"
import { transactions } from "./transactions"

export const transactionLinks = sqliteTable(
  "transaction_links",
  {
    txnId: integer("txn_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    link: text("link")
      .notNull()
      .references(() => links.link, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.txnId, t.link] }),
  }),
)

export type TransactionLinkRow = typeof transactionLinks.$inferSelect
export type TransactionLinkInsert = typeof transactionLinks.$inferInsert
