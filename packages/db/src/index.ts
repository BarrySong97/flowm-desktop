import type { drizzle } from "drizzle-orm/better-sqlite3"
import * as _schema from "./schema/clean"

// Typed Drizzle database instance — the single DB type used throughout the app
// Uses ReturnType<typeof drizzle<...>> so that $client is included in the type
export type Database = ReturnType<typeof drizzle<typeof _schema>>

// Schema tables, types, and helpers
export * as schema from "./schema/clean"
export {
  assetItems,
  assetSnapshots,
  budgetItemScopes,
  budgetItems,
  budgetPeriods,
  budgetSets,
  cashflowEventTags,
  cashflowEvents,
  categories,
  currencySettings,
  exchangeRates,
  loanPaymentOccurrences,
  loans,
  objectLinks,
  statementImports,
  statementLines,
  subscriptionOccurrences,
  subscriptions,
  tags,
  type AssetItemInsert,
  type AssetItemRow,
  type AssetSnapshotInsert,
  type AssetSnapshotRow,
  type BudgetItemInsert,
  type BudgetItemRow,
  type BudgetItemScopeInsert,
  type BudgetItemScopeRow,
  type BudgetPeriodInsert,
  type BudgetPeriodRow,
  type BudgetSetInsert,
  type BudgetSetRow,
  type CashflowEventInsert,
  type CashflowEventRow,
  type CashflowEventTagInsert,
  type CashflowEventTagRow,
  type CategoryInsert,
  type CategoryRow,
  type CurrencySettingsInsert,
  type CurrencySettingsRow,
  type ExchangeRateInsert,
  type ExchangeRateRow,
  type LoanInsert,
  type LoanPaymentOccurrenceInsert,
  type LoanPaymentOccurrenceRow,
  type LoanRow,
  type ObjectLinkInsert,
  type ObjectLinkRow,
  type StatementImportInsert,
  type StatementImportRow,
  type StatementLineInsert,
  type StatementLineRow,
  type SubscriptionInsert,
  type SubscriptionOccurrenceInsert,
  type SubscriptionOccurrenceRow,
  type SubscriptionRow,
  type TagInsert,
  type TagRow,
} from "./schema/clean"

// IPC protocol types — used by the preload and main process SQL bridge
export type SqlParam = string | number | boolean | null
export type SqlRow = Record<string, string | number | boolean | null>
export interface SqlStatement {
  sql: string
  params?: SqlParam[]
}
export interface SqlStatementResult {
  rows: SqlRow[]
  rowsAffected: number
  lastInsertId: number | null
}
