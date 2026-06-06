import { sqliteTable, text } from "drizzle-orm/sqlite-core"

// Beancount allows commodities to be used implicitly. A row appears here either:
//   - because a `commodity` directive was parsed (declared_at = directive date), or
//   - because the currency was first encountered in a posting/balance/price (declared_at = NULL).
export const commodities = sqliteTable("commodities", {
  currency: text("currency").primaryKey(), // "USD", "AAPL", "BTC", ...
  declaredAt: text("declared_at"), // ISO date; NULL = implicit
  meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
})

export type CommodityRow = typeof commodities.$inferSelect
export type CommodityInsert = typeof commodities.$inferInsert
