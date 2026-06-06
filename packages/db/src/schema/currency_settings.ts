import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const currencySettings = sqliteTable("currency_settings", {
  id: text("id").primaryKey(),
  displayCurrency: text("display_currency").notNull().default("CNY"),
  fxProvider: text("fx_provider").notNull().default("frankfurter"),
  fxRequestPolicy: text("fx_request_policy").notNull().default("on_demand_foreign_currency_only"),
  updatedAt: text("updated_at").notNull(),
  meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
})

export type CurrencySettingsRow = typeof currencySettings.$inferSelect
export type CurrencySettingsInsert = typeof currencySettings.$inferInsert
