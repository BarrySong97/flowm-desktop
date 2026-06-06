import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"
import { commodities } from "./commodities"

// `open Assets:US:BofA:Checking  USD,CAD` — restricts the account to these currencies.
// Absence of rows for an account = no restriction (matches beancount's nullable list).
export const accountCurrencies = sqliteTable(
  "account_currencies",
  {
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    currency: text("currency")
      .notNull()
      .references(() => commodities.currency),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.accountId, t.currency] }),
  }),
)

export type AccountCurrencyRow = typeof accountCurrencies.$inferSelect
export type AccountCurrencyInsert = typeof accountCurrencies.$inferInsert
