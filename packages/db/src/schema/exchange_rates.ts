import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const exchangeRates = sqliteTable(
  "exchange_rates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fromCurrency: text("from_currency").notNull(),
    toCurrency: text("to_currency").notNull(),
    rateDate: text("rate_date").notNull(),
    rate: text("rate").notNull(),
    provider: text("provider").notNull(),
    fetchedAt: text("fetched_at").notNull(),
    sourceDate: text("source_date"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    pairDateProviderUnique: uniqueIndex("exchange_rates_pair_date_provider_unique").on(
      t.fromCurrency,
      t.toCurrency,
      t.rateDate,
      t.provider,
    ),
    pairDateIdx: index("idx_exchange_rates_pair_date").on(t.fromCurrency, t.toCurrency, t.rateDate),
    providerIdx: index("idx_exchange_rates_provider").on(t.provider),
  }),
)

export type ExchangeRateRow = typeof exchangeRates.$inferSelect
export type ExchangeRateInsert = typeof exchangeRates.$inferInsert
