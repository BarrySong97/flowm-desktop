import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"
import { commodities } from "./commodities"

export const balanceAsserts = sqliteTable(
  "balance_asserts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    amountNumber: text("amount_number").notNull(),
    amountCurrency: text("amount_currency")
      .notNull()
      .references(() => commodities.currency),
    toleranceNumber: text("tolerance_number"),
    diffNumber: text("diff_number"),
    diffCurrency: text("diff_currency").references(() => commodities.currency),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_balance_asserts_date").on(t.date),
    accountIdx: index("idx_balance_asserts_account").on(t.accountId),
  }),
)

export type BalanceAssertRow = typeof balanceAsserts.$inferSelect
export type BalanceAssertInsert = typeof balanceAsserts.$inferInsert
