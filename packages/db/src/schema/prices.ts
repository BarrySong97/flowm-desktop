import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { commodities } from "./commodities"

export const prices = sqliteTable(
  "prices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    currency: text("currency")
      .notNull()
      .references(() => commodities.currency),
    amountNumber: text("amount_number").notNull(),
    amountCurrency: text("amount_currency")
      .notNull()
      .references(() => commodities.currency),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    dateIdx: index("idx_prices_date").on(t.date),
    quoteIdx: index("idx_prices_quote").on(t.amountCurrency),
  }),
)

export type PriceRow = typeof prices.$inferSelect
export type PriceInsert = typeof prices.$inferInsert
