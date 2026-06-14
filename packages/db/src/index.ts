/**
 * @purpose Export the typed Drizzle database handle and schema from @flowm/db.
 * @role    Database package public surface for API and desktop main process.
 * @deps    Drizzle better-sqlite3 types and local schema exports.
 * @gotcha  Product code should consume this typed handle rather than raw SQLite clients.
 */

import type { drizzle } from "drizzle-orm/better-sqlite3"
import * as _schema from "./schema"

// Typed Drizzle database instance — the single DB type used throughout the app
// Uses ReturnType<typeof drizzle<...>> so that $client is included in the type
export type Database = ReturnType<typeof drizzle<typeof _schema>>

// Schema tables, types, and helpers
export * as schema from "./schema"
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
} from "./schema"
