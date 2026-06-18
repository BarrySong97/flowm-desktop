/**
 * @purpose Export the Flowm product facade consumed by the Electron main router.
 * @role    Public API surface for cashflow, assets, budgets, imports, subscriptions, loans, and dashboard data.
 * @deps    @flowm/db schema, sqlite service modules, and seed helpers.
 * @gotcha  Preserve the asymmetric finance model across all facade methods.
 */

import { type Database } from "@flowm/db"
import { type Result } from "@flowm/shared"
import type {
  ActiveStatus,
  AddAssetSnapshotInput,
  AssetChangeInput,
  AssetChangeSummary,
  AssetItemSummary,
  AssetSnapshotSummary,
  AssetSparklinePoint,
  CashflowKind,
  CreateAssetItemInput,
  Direction,
  FlowmId,
  ListAssetItemsInput,
  ListAssetSnapshotsInput,
  ListAssetSparklinesInput,
  MoneyAmount,
  NetWorthInput,
  NetWorthSnapshot,
  UpdateAssetItemInput,
  UpdateAssetSnapshotInput,
  UpsertAssetSnapshotInput,
} from "@flowm/shared/contracts"
import { FlowmSqliteApi } from "./use-cases/dashboard/dashboard-api"

export type {
  ActiveStatus,
  AddAssetSnapshotInput,
  AssetChangeInput,
  AssetChangeSummary,
  AssetItemSummary,
  AssetSnapshotSummary,
  AssetSnapshotType,
  AssetSparklinePoint,
  AssetType,
  CashflowKind,
  CreateAssetItemInput,
  Direction,
  FlowmId,
  ListAssetItemsInput,
  ListAssetSnapshotsInput,
  ListAssetSparklinesInput,
  MoneyAmount,
  NetWorthInput,
  NetWorthSnapshot,
  UpdateAssetItemInput,
  UpdateAssetSnapshotInput,
  UpsertAssetSnapshotInput,
} from "@flowm/shared/contracts"

export interface FlowmApi {
  /** Wipe all user data. */
  resetAllData(): Promise<Result<void>>

  getCurrencySettings(): Promise<Result<CurrencySettingsSummary>>
  updateCurrencySettings(
    input: UpdateCurrencySettingsInput,
  ): Promise<Result<CurrencySettingsSummary>>
  listExchangeRates(input?: ListExchangeRatesInput): Promise<Result<ExchangeRateSummary[]>>
  refreshExchangeRates(
    input?: RefreshExchangeRatesInput,
  ): Promise<Result<RefreshExchangeRatesResult>>

  listCategories(input?: ListCategoriesInput): Promise<Result<CategorySummary[]>>
  createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>>
  updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>>
  archiveCategory(input: { id: FlowmId }): Promise<Result<void>>

  importStatement(input: ImportStatementInput): Promise<Result<ImportedBatchResult>>
  importNormalizedStatementEntries(
    input: ImportNormalizedStatementEntriesInput,
  ): Promise<Result<ImportedBatchResult>>
  listStatementImports(input?: ListStatementImportsInput): Promise<Result<StatementImportSummary[]>>
  listStatementLines(input?: ListStatementLinesInput): Promise<Result<StatementLineSummary[]>>
  listImportedEntries(input?: ListImportedEntriesInput): Promise<Result<ImportedEntrySummary[]>>
  convertStatementLinesToCashflowEvents(
    input?: ConvertStatementLinesInput,
  ): Promise<Result<{ created: number; skipped: number }>>

  listCashflowEvents(input?: ListCashflowEventsInput): Promise<Result<CashflowEventSummary[]>>
  getCashflowEvent(id: FlowmId): Promise<Result<CashflowEventSummary | null>>
  createCashflowEvent(input: CreateCashflowEventInput): Promise<Result<CashflowEventSummary>>
  updateCashflowEvent(input: UpdateCashflowEventInput): Promise<Result<CashflowEventSummary>>
  ignoreCashflowEvent(input: { id: FlowmId }): Promise<Result<void>>
  deleteCashflowEvent(input: { id: FlowmId }): Promise<Result<void>>
  setCashflowEventCategory(input: {
    id: FlowmId
    categoryId: FlowmId | null
  }): Promise<Result<CashflowEventSummary>>
  setCashflowEventTags(input: { id: FlowmId; tagIds: FlowmId[] }): Promise<Result<void>>
  setCashflowEventAnalyticsIncluded(input: {
    id: FlowmId
    includeInAnalytics: boolean
  }): Promise<Result<CashflowEventSummary>>
  applyAgentLedgerPatch(input: AgentLedgerPatchInput): Promise<Result<AgentLedgerPatchResult>>
  getCashflowSummary(input?: CashflowSummaryInput): Promise<Result<CashflowSummary>>
  getCashflowBreakdown(input?: CashflowBreakdownInput): Promise<Result<CashflowBreakdownRow[]>>
  getMonthlyCashflowTrend(
    input?: MonthlyCashflowTrendInput,
  ): Promise<Result<MonthlyCashflowTrendRow[]>>

  listAssetItems(input?: ListAssetItemsInput): Promise<Result<AssetItemSummary[]>>
  createAssetItem(input: CreateAssetItemInput): Promise<Result<AssetItemSummary>>
  updateAssetItem(input: UpdateAssetItemInput): Promise<Result<AssetItemSummary>>
  archiveAssetItem(input: { id: FlowmId }): Promise<Result<void>>
  listAssetSnapshots(input?: ListAssetSnapshotsInput): Promise<Result<AssetSnapshotSummary[]>>
  listAssetSparklines(input?: ListAssetSparklinesInput): Promise<Result<AssetSparklinePoint[]>>
  addAssetSnapshot(input: AddAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>>
  updateAssetSnapshot(input: UpdateAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>>
  deleteAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>>
  getNetWorthSnapshot(input?: NetWorthInput): Promise<Result<NetWorthSnapshot>>
  getAssetChange(input: AssetChangeInput): Promise<Result<AssetChangeSummary | null>>

  listSubscriptions(input?: ListSubscriptionsInput): Promise<Result<SubscriptionSummary[]>>
  createSubscription(input: CreateSubscriptionInput): Promise<Result<SubscriptionSummary>>
  updateSubscription(input: UpdateSubscriptionInput): Promise<Result<SubscriptionSummary>>
  archiveSubscription(input: { id: FlowmId }): Promise<Result<void>>
  generateSubscriptionOccurrences(
    input: GenerateOccurrenceInput,
  ): Promise<Result<{ generated: number }>>
  listSubscriptionOccurrences(
    input?: ListSubscriptionOccurrencesInput,
  ): Promise<Result<SubscriptionOccurrenceSummary[]>>

  listLoans(input?: ListLoansInput): Promise<Result<LoanSummary[]>>
  getLoan(input: { id: FlowmId }): Promise<Result<LoanSummary | null>>
  createLoan(input: CreateLoanInput): Promise<Result<LoanSummary>>
  updateLoan(input: UpdateLoanInput): Promise<Result<LoanSummary>>
  archiveLoan(input: { id: FlowmId }): Promise<Result<void>>
  generateLoanPaymentOccurrences(
    input: GenerateOccurrenceInput,
  ): Promise<Result<{ generated: number }>>
  listLoanPaymentOccurrences(
    input?: ListLoanPaymentOccurrencesInput,
  ): Promise<Result<LoanPaymentOccurrenceSummary[]>>
  getFutureFixedPressure(input?: FuturePressureInput): Promise<Result<FuturePressureSummary>>

  listBudgetSets(): Promise<Result<BudgetSetSummary[]>>
  createBudgetSet(input: CreateBudgetSetInput): Promise<Result<BudgetSetSummary>>
  listBudgetPeriods(input?: ListBudgetPeriodsInput): Promise<Result<BudgetPeriodSummary[]>>
  createBudgetPeriod(input: CreateBudgetPeriodInput): Promise<Result<BudgetPeriodSummary>>
  listBudgetItems(input?: ListBudgetItemsInput): Promise<Result<BudgetItemSummary[]>>
  createBudgetItem(input: CreateBudgetItemInput): Promise<Result<BudgetItemSummary>>
  updateBudgetItem(input: UpdateBudgetItemInput): Promise<Result<BudgetItemSummary>>
  archiveBudgetItem(input: { id: FlowmId }): Promise<Result<void>>
  getBudgetReferenceProgress(
    input: BudgetReferenceProgressInput,
  ): Promise<Result<BudgetReferenceProgressRow[]>>

  listObjectLinks(input?: ListObjectLinksInput): Promise<Result<ObjectLinkSummary[]>>
  createObjectLink(input: CreateObjectLinkInput): Promise<Result<ObjectLinkSummary>>
  confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>>
  removeObjectLink(input: { id: FlowmId }): Promise<Result<void>>

  // Renderer dashboard shell. These methods are backed by the current clean schema.
  getDashboardSnapshot(): Promise<Result<DashboardSnapshot>>
  listAssetSnapshots(input?: ListAssetSnapshotsInput): Promise<Result<AssetSnapshotSummary[]>>
  upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>>
  removeAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>>
  listDashboardViews(): Promise<Result<DashboardView[]>>
  createDashboardView(input: CreateDashboardViewInput): Promise<Result<DashboardView>>
  updateDashboardView(input: UpdateDashboardViewInput): Promise<Result<DashboardView>>
  removeDashboardView(input: { id: string }): Promise<Result<void>>
  saveDashboardViewOrder(input: { ids: string[] }): Promise<Result<DashboardView[]>>
  listDashboardCards(input?: ListDashboardCardsInput): Promise<Result<DashboardCard[]>>
  listDashboardLayouts(input?: ListDashboardLayoutsInput): Promise<Result<DashboardLayoutEntry[]>>
  addDashboardCard(input: AddDashboardCardInput): Promise<Result<DashboardCard>>
  updateDashboardCard(input: UpdateDashboardCardInput): Promise<Result<DashboardCard>>
  removeDashboardCard(input: { id: string }): Promise<Result<void>>
  saveDashboardLayouts(input: SaveDashboardLayoutsInput): Promise<Result<void>>
  resetDashboardLayout(): Promise<Result<void>>
}

export interface DashboardSnapshot {
  metrics: {
    netWorth: MoneyAmount
    cash: MoneyAmount
    incomeMtd: MoneyAmount
    expenseMtd: MoneyAmount
    savingsMtd: MoneyAmount
  }
  pnlStrip: Array<{ label: string; value: string; delta: string; up: boolean }>
  dayFlow: DayFlowRow[]
  cashflowEvents: Record<string, unknown>[]
  holdings: HoldingRow[]
  accounts: Record<string, unknown>[]
  generatedAt: string
}

export interface DayFlowRow {
  id: FlowmId
  time: string
  symbol: string
  category: string
  account: string
  amountNumber: string
  currency: string
  kind: "income" | "expense" | "transfer"
}

export interface HoldingRow {
  account: string
  symbol: string
  name: string
  type: string
  balanceNumber: string
  currency: string
}

export interface FlowmApiOptions {
  fxProvider?: FxRateProvider
}

export interface FxRateProvider {
  id: string
  fetchRate(input: FxRateFetchInput): Promise<FxRateFetchResult | null>
}

export interface FxRateFetchInput {
  fromCurrency: string
  toCurrency: string
  date: string
}

export interface FxRateFetchResult {
  fromCurrency: string
  toCurrency: string
  rateDate: string
  rate: string
  provider: string
  sourceDate?: string | null
  meta?: Record<string, unknown> | null
}

export interface CurrencySettingsSummary {
  displayCurrency: string
  fxProvider: string
  fxRequestPolicy: string
  updatedAt: string
  meta: Record<string, unknown> | null
}

export interface UpdateCurrencySettingsInput {
  displayCurrency?: string
  fxProvider?: string
  fxRequestPolicy?: string
  meta?: Record<string, unknown> | null
}

export interface ExchangeRateSummary {
  id: FlowmId
  fromCurrency: string
  toCurrency: string
  rateDate: string
  rate: string
  provider: string
  fetchedAt: string
  sourceDate: string | null
  meta: Record<string, unknown> | null
}

export interface ListExchangeRatesInput {
  fromCurrency?: string
  toCurrency?: string
  provider?: string
  limit?: number
}

export interface RefreshExchangeRatesInput {
  force?: boolean
}

export interface RefreshExchangeRatesResult {
  requested: number
  fetched: number
  skipped: number
  failed: number
  unsupported: number
}

export interface CategorySummary {
  id: FlowmId
  name: string
  parentId?: FlowmId | null
  categoryKind: string
  kind: string
  color?: string | null
  icon?: string | null
  sortOrder: number
  displayOrder: number
  archived: boolean
  archivedAt?: string | null
}

export interface ListCategoriesInput {
  includeArchived?: boolean
  categoryKind?: string
}

export interface CreateCategoryInput {
  name: string
  parentId?: FlowmId | null
  categoryKind?: string
  kind?: string
  color?: string | null
  icon?: string | null
  sortOrder?: number
  displayOrder?: number
}

export interface UpdateCategoryInput {
  id: FlowmId
  name?: string
  parentId?: FlowmId | null
  categoryKind?: string
  kind?: string
  color?: string | null
  icon?: string | null
  sortOrder?: number
  displayOrder?: number
}

export interface TagSummary {
  id: FlowmId
  name: string
  color?: string | null
  archived: boolean
}

export interface ImportStatementInput {
  sourceName: string
  importedAt?: string
  fileName?: string | null
  fileHash?: string | null
  lines: StatementLineInput[]
  rawSummary?: Record<string, unknown> | null
}

export interface StatementLineInput {
  externalId?: string | null
  occurredAt?: string | null
  eventDate: string
  counterparty?: string | null
  description?: string | null
  amount: string
  currency?: string
  direction: Direction | "income" | "expense"
  paymentMethod?: string | null
  accountHint?: string | null
  rawPayload?: Record<string, unknown> | null
}

export interface ImportNormalizedStatementEntriesInput {
  sourceName: string
  importedAt: string
  fileName?: string | null
  fileHash?: string | null
  entries: NormalizedStatementEntry[]
  summary?: unknown
}

export interface NormalizedStatementEntry {
  externalId?: string | null
  merchantOrderId?: string | null
  occurredAt?: string | null
  date: string
  counterparty?: string | null
  description?: string | null
  amountNumber: string
  currency: string
  sourceAccountName: string
  sourceSubAccountLabel?: string | null
  paymentMethod?: string | null
  direction?: "income" | "expense" | "in" | "out" | "neutral" | null
  classification?: string | null
  confidence?: number | null
  source?: string | null
  type?: string | null
  status?: string | null
  note?: string | null
  raw?: Record<string, unknown> | null
}

export interface ImportedBatchResult {
  batchId: FlowmId
  inserted: number
  skipped: number
}

export interface ListStatementImportsInput {
  sourceName?: string
  status?: string
}

export interface StatementImportSummary {
  id: FlowmId
  sourceName: string
  fileName: string | null
  fileHash: string | null
  importedAt: string
  status: string
}

export interface ListStatementLinesInput {
  importId?: FlowmId
  status?: string
  limit?: number
}

export interface StatementLineSummary {
  id: FlowmId
  importId: FlowmId
  externalId: string | null
  eventDate: string
  occurredAt: string | null
  counterparty: string | null
  description: string | null
  amount: string
  currency: string
  direction: string
  status: string
}

export interface ListImportedEntriesInput extends ListStatementLinesInput {
  sourceName?: string
  classification?: string
}

export interface ImportedEntrySummary {
  id: FlowmId
  batchId: FlowmId
  sourceName: string
  fileName: string | null
  externalId: string | null
  merchantOrderId: string | null
  occurredAt: string | null
  date: string
  payee: string | null
  narration: string | null
  amountNumber: string
  currency: string
  accountName: string
  sourceSubAccountLabel: string | null
  counterpartyAccount: string | null
  paymentMethod: string | null
  direction: string | null
  classification: string | null
  confidence: number | null
  status: "pending" | "matched" | "confirmed" | "ignored" | "reviewed"
  raw: Record<string, unknown> | null
}

export interface ConvertStatementLinesInput {
  importId?: FlowmId
}

export interface CashflowEventSummary {
  id: FlowmId
  statementLineId?: FlowmId | null
  eventDate: string
  date: string
  occurredAt?: string | null
  title?: string | null
  counterparty?: string | null
  description?: string | null
  userNote?: string | null
  amount: string
  currency: string
  direction: Direction
  flowKind: string
  categoryId?: FlowmId | null
  categoryName?: string | null
  sourceKind: string
  sourceName?: string | null
  sourceExternalId?: string | null
  sourceFileHash?: string | null
  importedAt?: string | null
  source?: string | null
  includeInAnalytics: boolean
  status: ActiveStatus
  classificationSource: string
  tags: TagSummary[]
  createdAt: string
}

export interface ListCashflowEventsInput {
  dateFrom?: string
  dateTo?: string
  flowKind?: string | string[]
  direction?: Direction
  categoryId?: FlowmId
  tagId?: FlowmId
  sourceName?: string
  sourceExternalId?: string
  source?: string
  status?: ActiveStatus
  includeInAnalytics?: boolean
  keyword?: string
  limit?: number
  offset?: number
}

export interface CreateCashflowEventInput {
  eventDate: string
  occurredAt?: string | null
  title?: string | null
  counterparty?: string | null
  description?: string | null
  userNote?: string | null
  amount: string
  currency?: string
  direction: Direction
  flowKind: CashflowKind
  categoryId?: FlowmId | null
  sourceKind?: "manual" | "import" | "system"
  sourceName?: string | null
  sourceExternalId?: string | null
  sourceFileHash?: string | null
  importedAt?: string | null
  paymentMethod?: string | null
  accountHint?: string | null
  includeInAnalytics?: boolean
  classificationSource?: "manual" | "rule" | "system" | "imported"
  tagIds?: FlowmId[]
}

export interface UpdateCashflowEventInput {
  id: FlowmId
  eventDate?: string
  title?: string | null
  counterparty?: string | null
  description?: string | null
  userNote?: string | null
  amount?: string
  currency?: string
  direction?: Direction
  flowKind?: CashflowKind
  categoryId?: FlowmId | null
  includeInAnalytics?: boolean
  status?: ActiveStatus
}

export type AgentLedgerOperation =
  | AgentEnsureCategoryOperation
  | AgentCreateCashflowOperation
  | AgentClassifyCashflowOperation

export interface AgentLedgerPatchInput {
  dryRun?: boolean
  operations: AgentLedgerOperation[]
}

export interface AgentEnsureCategoryOperation {
  op: "category.ensure"
  name: string
  categoryKind?: string
  color?: string | null
  icon?: string | null
  displayOrder?: number
}

export interface AgentCreateCashflowOperation {
  op: "cashflow.create"
  sourceKind?: "manual" | "import" | "system"
  sourceName?: string | null
  sourceExternalId?: string | null
  sourceFileHash?: string | null
  importedAt?: string | null
  eventDate: string
  occurredAt?: string | null
  title?: string | null
  counterparty?: string | null
  description?: string | null
  userNote?: string | null
  amount: string
  currency?: string
  direction: Direction
  flowKind: CashflowKind
  categoryId?: FlowmId | null
  categoryName?: string | null
  categoryKind?: string
  paymentMethod?: string | null
  accountHint?: string | null
  includeInAnalytics?: boolean
  classificationSource?: "manual" | "rule" | "system" | "imported"
  tagIds?: FlowmId[]
}

export interface AgentClassifyCashflowOperation {
  op: "cashflow.classify"
  id?: FlowmId
  sourceName?: string | null
  sourceExternalId?: string | null
  categoryId?: FlowmId | null
  categoryName?: string | null
  categoryKind?: string
  classificationSource?: "manual" | "rule" | "system" | "imported"
}

export interface AgentLedgerPatchResult {
  dryRun: boolean
  created: number
  updated: number
  skipped: number
  conflicts: number
  warnings: string[]
  operations: AgentLedgerOperationResult[]
}

export interface AgentLedgerOperationResult {
  index: number
  op: AgentLedgerOperation["op"]
  action: "create" | "update" | "skip" | "conflict" | "reject"
  targetType?: "category" | "cashflow"
  targetId?: FlowmId
  message: string
  warnings?: string[]
}

export interface CashflowSummaryInput {
  metric?:
    | "everyday_spend"
    | "income"
    | "net_cashflow"
    | "debt_payments"
    | "asset_movements"
    | "refunds"
    | "all_activity"
  dateFrom?: string
  dateTo?: string
  includeIgnored?: boolean
}

export interface CashflowSummary {
  metric: string
  amount: string
  currency: string
}

export interface CashflowBreakdownInput extends CashflowSummaryInput {
  groupBy?: "flow_kind" | "category" | "tag" | "source"
}

export interface CashflowBreakdownRow {
  key: string
  label: string
  amount: string
  currency: string
}

export interface MonthlyCashflowTrendInput {
  dateFrom?: string
  dateTo?: string
  months?: number
  includeIgnored?: boolean
}

export interface MonthlyCashflowTrendRow {
  month: string
  income: string
  expense: string
  net: string
  currency: string
}

export interface SubscriptionSummary {
  id: FlowmId
  name: string
  merchant: string | null
  amount: string
  currency: string
  billingCycle: string
  intervalCount: number
  nextChargeDate: string
  autoRenew: boolean
  categoryId: FlowmId | null
  status: string
  note: string | null
}

export interface ListSubscriptionsInput {
  status?: string
}

export interface CreateSubscriptionInput {
  name: string
  merchant?: string | null
  amount: string
  currency?: string
  billingCycle: "weekly" | "monthly" | "yearly" | "custom"
  intervalCount?: number
  nextChargeDate: string
  autoRenew?: boolean
  categoryId?: FlowmId | null
  note?: string | null
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: FlowmId
  status?: string
}

export interface GenerateOccurrenceInput {
  id?: FlowmId
  throughDate: string
}

export interface ListSubscriptionOccurrencesInput {
  subscriptionId?: FlowmId
  dateFrom?: string
  dateTo?: string
}

export interface SubscriptionOccurrenceSummary {
  id: FlowmId
  subscriptionId: FlowmId
  dueDate: string
  amount: string
  currency: string
  status: string
}

export interface LoanSummary {
  id: FlowmId
  name: string
  lender: string | null
  currency: string
  principalAmount: string | null
  currentPrincipalEstimate: string | null
  annualRateBps: number | null
  repaymentMethod: string | null
  paymentAmount: string
  paymentDay: number | null
  startDate: string
  termMonths: number | null
  status: string
  note: string | null
}

export interface ListLoansInput {
  status?: string
}

export interface CreateLoanInput {
  name: string
  lender?: string | null
  currency?: string
  principalAmount?: string | null
  currentPrincipalEstimate?: string | null
  annualRateBps?: number | null
  repaymentMethod?: string | null
  paymentAmount: string
  paymentDay?: number | null
  startDate: string
  termMonths?: number | null
  note?: string | null
}

export interface UpdateLoanInput extends Partial<CreateLoanInput> {
  id: FlowmId
  status?: string
}

export interface ListLoanPaymentOccurrencesInput {
  loanId?: FlowmId
  dateFrom?: string
  dateTo?: string
}

export interface LoanPaymentOccurrenceSummary {
  id: FlowmId
  loanId: FlowmId
  dueDate: string
  paymentAmount: string
  principalAmount: string | null
  interestAmount: string | null
  feeAmount: string | null
  remainingPrincipalEstimate: string | null
  status: string
}

export interface FuturePressureInput {
  dateFrom?: string
  dateTo?: string
}

export interface FuturePressureSummary {
  subscriptions: string
  loans: string
  total: string
  currency: string
}

export interface BudgetSetSummary {
  id: FlowmId
  name: string
  status: string
}

export interface CreateBudgetSetInput {
  name: string
}

export interface BudgetPeriodSummary {
  id: FlowmId
  budgetSetId: FlowmId
  periodKind: string
  periodStart: string
  periodEnd: string
  currency: string
  status: string
}

export interface ListBudgetPeriodsInput {
  budgetSetId?: FlowmId
  status?: string
}

export interface CreateBudgetPeriodInput {
  budgetSetId: FlowmId
  periodKind: "monthly" | "weekly" | "yearly" | "custom"
  periodStart: string
  periodEnd: string
  currency?: string
}

export interface BudgetItemSummary {
  id: FlowmId
  budgetPeriodId: FlowmId
  name: string
  itemKind: string
  plannedAmount: string
  currency: string
  categoryId: FlowmId | null
  color: string | null
  status: string
}

export interface ListBudgetItemsInput {
  budgetPeriodId?: FlowmId
}

export interface CreateBudgetItemInput {
  budgetPeriodId: FlowmId
  name: string
  itemKind?: "spending_limit" | "saving_goal" | "custom"
  plannedAmount: string
  currency?: string
  categoryId?: FlowmId | null
  color?: string | null
  scopes?: BudgetScopeInput[]
}

export interface UpdateBudgetItemInput {
  id: FlowmId
  name?: string
  plannedAmount?: string
  currency?: string
  color?: string | null
}

export interface BudgetScopeInput {
  scopeKind:
    | "category"
    | "category_tree"
    | "tag"
    | "source"
    | "flow_kind"
    | "custom"
    | "all_consumption"
  scopeValue?: string | null
}

export interface BudgetReferenceProgressInput {
  budgetPeriodId: FlowmId
}

export interface BudgetReferenceProgressRow {
  budgetItemId: FlowmId
  budgetName: string
  budgeted: string
  referenceUsed: string
  remaining: string
  currency: string
  color: string | null
}

export interface ObjectLinkSummary {
  id: FlowmId
  fromType: string
  fromId: FlowmId
  toType: string
  toId: FlowmId
  linkType: string
  confidence: number | null
  createdBy: string
  note: string | null
}

export interface ListObjectLinksInput {
  fromType?: string
  fromId?: FlowmId
  toType?: string
  toId?: FlowmId
}

export interface CreateObjectLinkInput {
  fromType: string
  fromId: FlowmId
  toType: string
  toId: FlowmId
  linkType: "evidence_of" | "likely_matches" | "confirmed_matches" | "related_to"
  confidence?: number | null
  createdBy?: "user" | "system"
  note?: string | null
}

export interface DashboardView {
  id: string
  slug: string
  name: string
  position: number
  isDefault: boolean
}

export interface CreateDashboardViewInput {
  name: string
}
export interface UpdateDashboardViewInput {
  id: string
  name?: string
  position?: number
}
export interface DashboardCard {
  id: string
  viewId: string
  type: string
  title: string | null
  code: string | null
  config: Record<string, unknown>
  position: number
  hidden: boolean
}
export interface DashboardLayoutEntry {
  cardId: string
  breakpoint: string
  x: number
  y: number
  w: number
  h: number
}
export interface ListDashboardCardsInput {
  viewId?: string
}
export interface ListDashboardLayoutsInput {
  viewId?: string
}
export interface AddDashboardCardInput {
  viewId: string
  type: string
  title?: string | null
  code?: string | null
  config?: Record<string, unknown>
  position?: number
  layouts: Omit<DashboardLayoutEntry, "cardId">[]
}
export interface UpdateDashboardCardInput {
  id: string
  title?: string | null
  code?: string | null
  config?: Record<string, unknown>
  hidden?: boolean
}
export interface SaveDashboardLayoutsInput {
  viewId?: string
  rows: DashboardLayoutEntry[]
}

export function createFlowmApi(db: Database, options: FlowmApiOptions = {}): FlowmApi {
  return new FlowmSqliteApi(db, options)
}

export {
  createFrankfurterFxProvider,
  type FrankfurterProviderOptions,
} from "./infrastructure/fx/frankfurter-provider"
