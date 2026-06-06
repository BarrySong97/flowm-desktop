import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { commodities } from "./commodities"

export const investmentInstruments = sqliteTable(
  "investment_instruments",
  {
    symbol: text("symbol").primaryKey(),
    commodityCurrency: text("commodity_currency")
      .notNull()
      .references(() => commodities.currency),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["stock", "fund", "crypto", "bond", "other"] })
      .notNull()
      .default("stock"),
    quoteCurrency: text("quote_currency").notNull(),
    assetAccount: text("asset_account").notNull(),
    dividendAccount: text("dividend_account").notNull(),
    capitalGainsAccount: text("capital_gains_account").notNull(),
    feeAccount: text("fee_account").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    kindIdx: index("idx_investment_instruments_kind").on(t.kind),
    quoteCurrencyIdx: index("idx_investment_instruments_quote").on(t.quoteCurrency),
  }),
)

export type InvestmentInstrumentRow = typeof investmentInstruments.$inferSelect
export type InvestmentInstrumentInsert = typeof investmentInstruments.$inferInsert
