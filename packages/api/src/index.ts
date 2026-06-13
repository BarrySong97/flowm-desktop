import { type Database, type SqlParam, type SqlRow } from "@flowm/db"
import { type Result } from "@flowm/shared"

export type FlowmId = string | number

type Direction = "in" | "out" | "neutral"
type CashflowKind = "income" | "expense" | "transfer" | "asset_movement" | "debt_payment" | "refund" | "adjustment"
type ActiveStatus = "active" | "ignored" | "deleted"
type AssetType =
  | "cash"
  | "bank"
  | "wallet"
  | "brokerage"
  | "fund"
  | "stock"
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "fixed_asset"
  | "liability"
  | "other"

export type AssetSnapshotType = AssetType | "investment"

export interface FlowmApi {
  initializeFlowm(): Promise<Result<void>>

  getCurrencySettings(): Promise<Result<CurrencySettingsSummary>>
  updateCurrencySettings(input: UpdateCurrencySettingsInput): Promise<Result<CurrencySettingsSummary>>
  listExchangeRates(input?: ListExchangeRatesInput): Promise<Result<ExchangeRateSummary[]>>
  refreshExchangeRates(input?: RefreshExchangeRatesInput): Promise<Result<RefreshExchangeRatesResult>>

  listCategories(input?: ListCategoriesInput): Promise<Result<CategorySummary[]>>
  createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>>
  updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>>
  archiveCategory(input: { id: FlowmId }): Promise<Result<void>>
  listTags(input?: ListTagsInput): Promise<Result<TagSummary[]>>
  createTag(input: CreateTagInput): Promise<Result<TagSummary>>
  archiveTag(input: { id: FlowmId }): Promise<Result<void>>

  importStatement(input: ImportStatementInput): Promise<Result<ImportedBatchResult>>
  importNormalizedStatementEntries(input: ImportNormalizedStatementEntriesInput): Promise<Result<ImportedBatchResult>>
  listStatementImports(input?: ListStatementImportsInput): Promise<Result<StatementImportSummary[]>>
  listStatementLines(input?: ListStatementLinesInput): Promise<Result<StatementLineSummary[]>>
  listImportedEntries(input?: ListImportedEntriesInput): Promise<Result<ImportedEntrySummary[]>>
  convertStatementLinesToCashflowEvents(input?: ConvertStatementLinesInput): Promise<Result<{ created: number; skipped: number }>>

  listCashflowEvents(input?: ListCashflowEventsInput): Promise<Result<CashflowEventSummary[]>>
  getCashflowEvent(id: FlowmId): Promise<Result<CashflowEventSummary | null>>
  createCashflowEvent(input: CreateCashflowEventInput): Promise<Result<CashflowEventSummary>>
  updateCashflowEvent(input: UpdateCashflowEventInput): Promise<Result<CashflowEventSummary>>
  ignoreCashflowEvent(input: { id: FlowmId }): Promise<Result<void>>
  deleteCashflowEvent(input: { id: FlowmId }): Promise<Result<void>>
  setCashflowEventCategory(input: { id: FlowmId; categoryId: FlowmId | null }): Promise<Result<CashflowEventSummary>>
  setCashflowEventTags(input: { id: FlowmId; tagIds: FlowmId[] }): Promise<Result<void>>
  setCashflowEventAnalyticsIncluded(input: { id: FlowmId; includeInAnalytics: boolean }): Promise<Result<CashflowEventSummary>>
  getCashflowSummary(input?: CashflowSummaryInput): Promise<Result<CashflowSummary>>
  getCashflowBreakdown(input?: CashflowBreakdownInput): Promise<Result<CashflowBreakdownRow[]>>

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
  generateSubscriptionOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>>
  listSubscriptionOccurrences(input?: ListSubscriptionOccurrencesInput): Promise<Result<SubscriptionOccurrenceSummary[]>>

  listLoans(input?: ListLoansInput): Promise<Result<LoanSummary[]>>
  getLoan(input: { id: FlowmId }): Promise<Result<LoanSummary | null>>
  createLoan(input: CreateLoanInput): Promise<Result<LoanSummary>>
  updateLoan(input: UpdateLoanInput): Promise<Result<LoanSummary>>
  archiveLoan(input: { id: FlowmId }): Promise<Result<void>>
  generateLoanPaymentOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>>
  listLoanPaymentOccurrences(input?: ListLoanPaymentOccurrencesInput): Promise<Result<LoanPaymentOccurrenceSummary[]>>
  getFutureFixedPressure(input?: FuturePressureInput): Promise<Result<FuturePressureSummary>>

  listBudgetSets(): Promise<Result<BudgetSetSummary[]>>
  createBudgetSet(input: CreateBudgetSetInput): Promise<Result<BudgetSetSummary>>
  listBudgetPeriods(input?: ListBudgetPeriodsInput): Promise<Result<BudgetPeriodSummary[]>>
  createBudgetPeriod(input: CreateBudgetPeriodInput): Promise<Result<BudgetPeriodSummary>>
  listBudgetItems(input?: ListBudgetItemsInput): Promise<Result<BudgetItemSummary[]>>
  createBudgetItem(input: CreateBudgetItemInput): Promise<Result<BudgetItemSummary>>
  getBudgetReferenceProgress(input: BudgetReferenceProgressInput): Promise<Result<BudgetReferenceProgressRow[]>>

  listObjectLinks(input?: ListObjectLinksInput): Promise<Result<ObjectLinkSummary[]>>
  createObjectLink(input: CreateObjectLinkInput): Promise<Result<ObjectLinkSummary>>
  confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>>
  removeObjectLink(input: { id: FlowmId }): Promise<Result<void>>

  // Renderer compatibility shell. These methods use the clean-slate tables or
  // return empty dashboard configuration until the UI is wired to V2 concepts.
  getDashboardSnapshot(): Promise<Result<DashboardSnapshot>>
  listAssetSnapshots(input?: ListAssetSnapshotsInput): Promise<Result<AssetSnapshotSummary[]>>
  upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>>
  removeAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>>
  createBudget(input: CreateBudgetInput): Promise<Result<BusinessRecord>>
  getBudgetProgress(input?: { period?: string }): Promise<Result<BudgetProgressRow[]>>
  listFinancialEvents(input?: ListFinancialEventsInput): Promise<Result<FinancialEventSummary[]>>
  createFinancialEvent(input: CreateFinancialEventInput): Promise<Result<FinancialEventSummary>>
  updateFinancialEvent(input: UpdateFinancialEventInput): Promise<Result<FinancialEventSummary>>
  removeFinancialEvent(input: { id: FlowmId }): Promise<Result<void>>
  rebuildFinancialEventsFromImports(input?: { batchId?: FlowmId }): Promise<Result<{ created: number; skipped: number }>>
  listPlans(input?: ListPlansInput): Promise<Result<PlanSummary[]>>
  createPlan(input: CreatePlanInput): Promise<Result<PlanSummary>>
  updatePlan(input: UpdatePlanInput): Promise<Result<PlanSummary>>
  generatePlanOccurrences(input: { planId?: FlowmId; throughDate: string }): Promise<Result<{ generated: number }>>
  runFlowQuery(input: RunFlowQueryInput): Promise<Result<FlowQueryResult>>
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

export interface MoneyAmount {
  number: string
  currency: string
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
  transactions: Record<string, unknown>[]
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

export interface BusinessRecord {
  id: FlowmId
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

export interface ListTagsInput {
  includeArchived?: boolean
}

export interface CreateTagInput {
  name: string
  color?: string | null
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

export type FinancialEventSummary = CashflowEventSummary

export interface ListFinancialEventsInput {
  dateFrom?: string
  dateTo?: string
  flowKind?: string
  categoryId?: FlowmId
  source?: string
  limit?: number
  offset?: number
}

export interface CreateFinancialEventInput {
  date: string
  occurredAt?: string
  counterparty?: string
  description?: string
  flowKind: string
  categoryId?: FlowmId
  amount: string
  currency?: string
  direction?: string
  accountHint?: string
  explanationTags?: string[]
}

export interface UpdateFinancialEventInput {
  id: FlowmId
  flowKind?: string
  categoryId?: FlowmId
  description?: string
  explanationTags?: string[]
}

export interface CashflowSummaryInput {
  metric?: "everyday_spend" | "income" | "net_cashflow" | "debt_payments" | "asset_movements" | "refunds" | "all_activity"
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

export interface AssetItemSummary {
  id: FlowmId
  name: string
  assetType: AssetType
  institution: string | null
  defaultCurrency: string
  valuationMethod: string
  archived: boolean
  note: string | null
}

export interface ListAssetItemsInput {
  assetType?: AssetType
  includeArchived?: boolean
}

export interface CreateAssetItemInput {
  name: string
  assetType: AssetType | "investment"
  institution?: string | null
  defaultCurrency?: string
  valuationMethod?: string
  displayOrder?: number
  note?: string | null
}

export interface UpdateAssetItemInput extends Partial<CreateAssetItemInput> {
  id: FlowmId
}

export interface AssetSnapshotSummary {
  id: FlowmId
  assetItemId: FlowmId
  accountName: string
  assetType: AssetSnapshotType
  snapshotAt: string
  quantityNumber: string | null
  quantityCurrency: string | null
  quantityAmount: string | null
  quantityUnit: string | null
  valueNumber: string
  valueCurrency: string
  source: string
  note: string | null
  meta: Record<string, unknown> | null
}

export interface ListAssetSnapshotsInput {
  assetItemId?: FlowmId
  accountName?: string
  latestOnly?: boolean
}

export interface ListAssetSparklinesInput {
  limitPerAsset?: number
}

export interface AssetSparklinePoint {
  assetItemId: FlowmId
  snapshotAt: string
  valueNumber: string
}

export interface AddAssetSnapshotInput {
  assetItemId: FlowmId
  snapshotAt?: string
  valueAmount: string
  valueCurrency?: string
  quantityAmount?: string | null
  quantityUnit?: string | null
  costBasisAmount?: string | null
  costBasisCurrency?: string | null
  sourceKind?: string
  note?: string | null
}

export interface UpdateAssetSnapshotInput extends Partial<AddAssetSnapshotInput> {
  id: FlowmId
}

export interface UpsertAssetSnapshotInput {
  id?: FlowmId
  assetItemId?: FlowmId
  accountName: string
  assetType: AssetSnapshotType
  snapshotAt?: string
  quantityNumber?: string | null
  quantityCurrency?: string | null
  valueNumber: string
  valueCurrency?: string
  source?: string
  note?: string | null
  meta?: Record<string, unknown> | null
}

export interface NetWorthInput {
  asOf?: string
  displayCurrency?: string
}

export interface NetWorthSnapshot {
  netWorth: MoneyAmount
  assetValue: MoneyAmount
  liabilityValue: MoneyAmount
  missingFx: Array<{ assetItemId: FlowmId; currency: string; date: string }>
}

export interface AssetChangeInput {
  assetItemId: FlowmId
  comparison?: "previous" | "30d" | "90d" | "1y"
}

export interface AssetChangeSummary {
  assetItemId: FlowmId
  changeAmount: string
  changePercent: string
  comparisonLabel: string
  valueCurrency: string
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

export interface BudgetScopeInput {
  scopeKind: "category" | "category_tree" | "tag" | "source" | "flow_kind" | "custom" | "all_consumption"
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

export interface CreateBudgetInput {
  name: string
  periodKind?: "monthly" | "weekly" | "yearly" | "custom"
  periodStart?: string
  periodEnd?: string
  amount: string
  currency?: string
  scopes?: BudgetScopeInput[]
}

export interface BudgetProgressRow {
  budgetId: FlowmId
  name: string
  tag: string | null
  spent: string
  budgeted: string
  remaining: string
  currency: string
  scopeKind?: string | null
  scopeValue?: string | null
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

export interface PlanSummary {
  id: FlowmId
  planType: string
  name: string
  counterparty?: string | null
  amount: string
  currency: string
  scheduleRule: string
  startDate: string
  endDate?: string | null
  nextDueDate?: string | null
  status: string
  categoryId?: FlowmId | null
  flowKind?: string | null
  accountHint?: string | null
  meta?: Record<string, unknown> | null
}

export interface ListPlansInput {
  planType?: string
  status?: string
}

export interface CreatePlanInput {
  planType: string
  name: string
  counterparty?: string | null
  amount: string
  currency?: string
  scheduleRule: string
  startDate: string
  endDate?: string
  status?: string
  categoryId?: FlowmId
  flowKind?: string
  accountHint?: string
  meta?: Record<string, unknown>
}

export interface UpdatePlanInput {
  id: FlowmId
  name?: string
  counterparty?: string | null
  amount?: string
  currency?: string
  scheduleRule?: string
  startDate?: string
  endDate?: string
  status?: string
  categoryId?: FlowmId
  flowKind?: string | null
  accountHint?: string | null
  meta?: Record<string, unknown> | null
}

export interface RunFlowQueryInput {
  sql?: string
}

export interface FlowQueryResult {
  rows: Record<string, unknown>[]
  columns: string[]
  total?: string
}

export interface DashboardView {
  id: string
  slug: string
  name: string
  position: number
  isDefault: boolean
}

export interface CreateDashboardViewInput { name: string }
export interface UpdateDashboardViewInput { id: string; name?: string; position?: number }
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
export interface ListDashboardCardsInput { viewId?: string }
export interface ListDashboardLayoutsInput { viewId?: string }
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

const DEFAULT_CURRENCY = "CNY"
const CURRENCY_SETTINGS_ID = "default"

const DEFAULT_CATEGORIES: Array<{ name: string; categoryKind: string; color: string; icon: string; displayOrder: number }> = [
  { name: "餐饮", categoryKind: "expense", color: "#e07b3a", icon: "food", displayOrder: 1 },
  { name: "购物", categoryKind: "expense", color: "#c46a9e", icon: "shopping-bag", displayOrder: 2 },
  { name: "交通", categoryKind: "expense", color: "#4a8fc4", icon: "train", displayOrder: 3 },
  { name: "娱乐", categoryKind: "expense", color: "#d4a017", icon: "film", displayOrder: 4 },
  { name: "订阅", categoryKind: "expense", color: "#7c6ac4", icon: "repeat", displayOrder: 5 },
  { name: "居住", categoryKind: "expense", color: "#5bac8e", icon: "home", displayOrder: 6 },
  { name: "通讯", categoryKind: "expense", color: "#5e9e9f", icon: "phone", displayOrder: 7 },
  { name: "其他", categoryKind: "expense", color: "#9caca3", icon: "circle", displayOrder: 8 },
  { name: "收入", categoryKind: "income", color: "#14794a", icon: "wallet", displayOrder: 20 },
  { name: "转账", categoryKind: "transfer", color: "#6b7d72", icon: "arrow-left-right", displayOrder: 30 },
  { name: "还款", categoryKind: "debt", color: "#8b6a47", icon: "credit-card", displayOrder: 40 },
  { name: "退款", categoryKind: "adjustment", color: "#6f9f6b", icon: "undo", displayOrder: 50 },
]

function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

function fail<T = never>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

function json(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value)
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "string" || value.length === 0) return null
  try {
    const parsed = JSON.parse(value)
    return parsed != null && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function newId(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${random.replace(/-/g, "")}`
}

function normalizeCurrency(currency: string | null | undefined): string {
  return (currency ?? DEFAULT_CURRENCY).trim().toUpperCase()
}

function normalizeDirection(direction: string | null | undefined): Direction {
  if (direction === "income" || direction === "in") return "in"
  if (direction === "expense" || direction === "out") return "out"
  return "neutral"
}

function normalizeAssetType(type: string): AssetType {
  return type === "investment" ? "brokerage" : type as AssetType
}

function normalizeCashflowKind(kind: string): CashflowKind {
  switch (kind) {
    case "consumption_expense":
    case "financial_cost":
      return "expense"
    case "debt_repayment":
      return "debt_payment"
    case "debt_drawdown":
      return "adjustment"
    case "ignored":
    case "ambiguous":
      return "adjustment"
    default:
      return kind as CashflowKind
  }
}

function toSqlId(id: FlowmId): string {
  return String(id)
}

function addInterval(date: string, cycle: string, interval: number): string {
  const d = new Date(`${date}T00:00:00.000Z`)
  if (cycle === "weekly") {
    d.setUTCDate(d.getUTCDate() + 7 * interval)
  } else if (cycle === "yearly") {
    d.setUTCFullYear(d.getUTCFullYear() + interval)
  } else {
    const targetDay = d.getUTCDate()
    const month = d.getUTCMonth() + interval
    const year = d.getUTCFullYear() + Math.floor(month / 12)
    const normalizedMonth = month % 12
    const maxDay = new Date(Date.UTC(year, normalizedMonth + 1, 0)).getUTCDate()
    d.setUTCFullYear(year, normalizedMonth, Math.min(targetDay, maxDay))
  }
  return d.toISOString().slice(0, 10)
}

function monthBounds(ym?: string): { start: string; end: string } {
  const source = ym ?? new Date().toISOString().slice(0, 7)
  const [year, month] = source.split("-").map(Number)
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
  return { start, end: endDate }
}

class FlowmSqliteApi implements FlowmApi {
  private dashboardViews: DashboardView[] = [{ id: "overview", slug: "overview", name: "Overview", position: 0, isDefault: true }]
  private dashboardCards: DashboardCard[] = []
  private dashboardLayouts: DashboardLayoutEntry[] = []
  private initialized = false
  private initializing: Promise<Result<void>> | null = null

  constructor(
    private readonly db: Database,
    private readonly options: FlowmApiOptions = {},
  ) {}

  async initializeFlowm(): Promise<Result<void>> {
    if (this.initialized) return ok(undefined)
    this.initializing ??= this.initializeFlowmCore()
    const result = await this.initializing
    if (result.success) this.initialized = true
    this.initializing = null
    return result
  }

  private async initializeFlowmCore(): Promise<Result<void>> {
    try {
      await this.seedDefaults()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async getCurrencySettings(): Promise<Result<CurrencySettingsSummary>> {
    try {
      await this.ensureCurrencySettings()
      const row = await this.one("select * from currency_settings where id = ?", [CURRENCY_SETTINGS_ID])
      return ok(this.mapCurrencySettings(row!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateCurrencySettings(input: UpdateCurrencySettingsInput): Promise<Result<CurrencySettingsSummary>> {
    try {
      await this.ensureCurrencySettings()
      const current = await this.one("select * from currency_settings where id = ?", [CURRENCY_SETTINGS_ID])
      const updated = {
        displayCurrency: normalizeCurrency(input.displayCurrency ?? current?.display_currency as string | undefined),
        fxProvider: input.fxProvider ?? current?.fx_provider as string ?? "manual",
        fxRequestPolicy: input.fxRequestPolicy ?? current?.fx_request_policy as string ?? "manual_only",
        meta: input.meta === undefined ? current?.meta as string | null : json(input.meta),
      }
      await this.run(
        `update currency_settings set display_currency = ?, fx_provider = ?, fx_request_policy = ?, meta = ?, updated_at = ? where id = ?`,
        [updated.displayCurrency, updated.fxProvider, updated.fxRequestPolicy, updated.meta, nowIso(), CURRENCY_SETTINGS_ID],
      )
      return this.getCurrencySettings()
    } catch (error) {
      return fail(error)
    }
  }

  async listExchangeRates(input: ListExchangeRatesInput = {}): Promise<Result<ExchangeRateSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.fromCurrency) { conds.push("from_currency = ?"); params.push(normalizeCurrency(input.fromCurrency)) }
      if (input.toCurrency) { conds.push("to_currency = ?"); params.push(normalizeCurrency(input.toCurrency)) }
      if (input.provider) { conds.push("provider = ?"); params.push(input.provider) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      params.push(input.limit ?? 100)
      const rows = await this.all(`select * from exchange_rates ${where} order by rate_date desc limit ?`, params)
      return ok(rows.map(this.mapExchangeRate))
    } catch (error) {
      return fail(error)
    }
  }

  async refreshExchangeRates(): Promise<Result<RefreshExchangeRatesResult>> {
    return ok({ requested: 0, fetched: 0, skipped: 0, failed: 0, unsupported: 0 })
  }

  async listCategories(input: ListCategoriesInput = {}): Promise<Result<CategorySummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (!input.includeArchived) conds.push("archived_at is null")
      if (input.categoryKind) { conds.push("category_kind = ?"); params.push(input.categoryKind) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from categories ${where} order by display_order asc, name asc`, params)
      return ok(rows.map(this.mapCategory))
    } catch (error) {
      return fail(error)
    }
  }

  async createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const id = newId("cat")
      const timestamp = nowIso()
      const kind = input.categoryKind ?? input.kind ?? "expense"
      const order = input.displayOrder ?? input.sortOrder ?? 0
      await this.run(
        `insert into categories (id, name, parent_id, category_kind, color, icon, display_order, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.name, input.parentId == null ? null : toSqlId(input.parentId), kind, input.color ?? null, input.icon ?? null, order, timestamp, timestamp],
      )
      return ok(this.mapCategory((await this.one("select * from categories where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      if (input.name !== undefined) { fields.push("name = ?"); params.push(input.name) }
      if (input.parentId !== undefined) { fields.push("parent_id = ?"); params.push(input.parentId == null ? null : toSqlId(input.parentId)) }
      if (input.categoryKind !== undefined || input.kind !== undefined) { fields.push("category_kind = ?"); params.push(input.categoryKind ?? input.kind ?? "expense") }
      if (input.color !== undefined) { fields.push("color = ?"); params.push(input.color) }
      if (input.icon !== undefined) { fields.push("icon = ?"); params.push(input.icon) }
      if (input.displayOrder !== undefined || input.sortOrder !== undefined) { fields.push("display_order = ?"); params.push(input.displayOrder ?? input.sortOrder ?? 0) }
      params.push(toSqlId(input.id))
      await this.run(`update categories set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapCategory((await this.one("select * from categories where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveCategory(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update categories set archived_at = ?, updated_at = ? where id = ?", [nowIso(), nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async listTags(input: ListTagsInput = {}): Promise<Result<TagSummary[]>> {
    try {
      const rows = await this.all(
        `select * from tags ${input.includeArchived ? "" : "where archived_at is null"} order by name asc`,
      )
      return ok(rows.map(this.mapTag))
    } catch (error) {
      return fail(error)
    }
  }

  async createTag(input: CreateTagInput): Promise<Result<TagSummary>> {
    try {
      const id = newId("tag")
      const timestamp = nowIso()
      await this.run("insert into tags (id, name, color, created_at, updated_at) values (?, ?, ?, ?, ?)", [
        id,
        input.name,
        input.color ?? null,
        timestamp,
        timestamp,
      ])
      return ok(this.mapTag((await this.one("select * from tags where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveTag(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update tags set archived_at = ?, updated_at = ? where id = ?", [nowIso(), nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async importStatement(input: ImportStatementInput): Promise<Result<ImportedBatchResult>> {
    try {
      const importId = newId("imp")
      const timestamp = input.importedAt ?? nowIso()
      await this.run(
        `insert into statement_imports (id, source_name, file_name, file_hash, imported_at, raw_summary, created_at)
         values (?, ?, ?, ?, ?, ?, ?)`,
        [importId, input.sourceName, input.fileName ?? null, input.fileHash ?? null, timestamp, json(input.rawSummary ?? null), timestamp],
      )
      let inserted = 0
      let skipped = 0
      for (const line of input.lines) {
        const lineHash = `${line.externalId ?? ""}:${line.eventDate}:${line.amount}:${line.currency ?? DEFAULT_CURRENCY}:${line.counterparty ?? ""}`
        const exists = await this.one("select id from statement_lines where import_id = ? and line_hash = ?", [importId, lineHash])
        if (exists) {
          skipped++
          continue
        }
        await this.run(
          `insert into statement_lines
            (id, import_id, external_id, line_hash, occurred_at, event_date, counterparty, description, amount, currency,
             direction, payment_method, account_hint, raw_payload, created_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId("line"),
            importId,
            line.externalId ?? null,
            lineHash,
            line.occurredAt ?? null,
            line.eventDate,
            line.counterparty ?? null,
            line.description ?? null,
            line.amount,
            normalizeCurrency(line.currency),
            normalizeDirection(line.direction),
            line.paymentMethod ?? null,
            line.accountHint ?? null,
            json(line.rawPayload ?? null),
            timestamp,
          ],
        )
        inserted++
      }
      return ok({ batchId: importId, inserted, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async importNormalizedStatementEntries(input: ImportNormalizedStatementEntriesInput): Promise<Result<ImportedBatchResult>> {
    return this.importStatement({
      sourceName: input.sourceName,
      importedAt: input.importedAt,
      fileName: input.fileName,
      fileHash: input.fileHash,
      rawSummary: input.summary as Record<string, unknown> | null,
      lines: input.entries.map((entry) => ({
        externalId: entry.externalId ?? null,
        occurredAt: entry.occurredAt ?? null,
        eventDate: entry.date,
        counterparty: entry.counterparty ?? null,
        description: entry.description ?? entry.note ?? null,
        amount: entry.amountNumber,
        currency: entry.currency,
        direction: entry.direction ?? "neutral",
        paymentMethod: entry.paymentMethod ?? null,
        accountHint: entry.sourceAccountName,
        rawPayload: entry.raw ?? null,
      })),
    })
  }

  async listStatementImports(input: ListStatementImportsInput = {}): Promise<Result<StatementImportSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.sourceName) { conds.push("source_name = ?"); params.push(input.sourceName) }
      if (input.status) { conds.push("status = ?"); params.push(input.status) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from statement_imports ${where} order by imported_at desc`, params)
      return ok(rows.map(this.mapStatementImport))
    } catch (error) {
      return fail(error)
    }
  }

  async listStatementLines(input: ListStatementLinesInput = {}): Promise<Result<StatementLineSummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(rows.map(this.mapStatementLine))
    } catch (error) {
      return fail(error)
    }
  }

  async listImportedEntries(input: ListImportedEntriesInput = {}): Promise<Result<ImportedEntrySummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(rows.map((row) => ({
        id: row.id as string,
        batchId: row.import_id as string,
        sourceName: row.source_name as string,
        fileName: row.file_name as string | null,
        externalId: row.external_id as string | null,
        merchantOrderId: null,
        occurredAt: row.occurred_at as string | null,
        date: row.event_date as string,
        payee: row.counterparty as string | null,
        narration: row.description as string | null,
        amountNumber: row.amount as string,
        currency: row.currency as string,
        accountName: row.account_hint as string ?? row.source_name as string,
        sourceSubAccountLabel: null,
        counterpartyAccount: null,
        paymentMethod: row.payment_method as string | null,
        direction: row.direction as string,
        classification: null,
        confidence: null,
        status: row.status as ImportedEntrySummary["status"],
        raw: parseJsonObject(row.raw_payload),
      })))
    } catch (error) {
      return fail(error)
    }
  }

  async convertStatementLinesToCashflowEvents(input: ConvertStatementLinesInput = {}): Promise<Result<{ created: number; skipped: number }>> {
    try {
      const rows = await this.statementLineRows({ importId: input.importId, status: "pending" })
      let created = 0
      let skipped = 0
      for (const line of rows) {
        const existing = await this.one("select id from cashflow_events where statement_line_id = ?", [line.id as string])
        if (existing) {
          skipped++
          continue
        }
        const direction = line.direction as Direction
        const flowKind: CashflowKind = direction === "in" ? "income" : direction === "out" ? "expense" : "adjustment"
        const id = newId("cf")
        const timestamp = nowIso()
        await this.run(
          `insert into cashflow_events
            (id, statement_line_id, event_date, occurred_at, title, counterparty, description, amount, currency, direction,
             flow_kind, source_kind, source_name, payment_method, account_hint, classification_source, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?, ?, 'imported', ?, ?)`,
          [
            id,
            line.id as string,
            line.event_date as string,
            line.occurred_at as string | null,
            line.counterparty as string | null,
            line.counterparty as string | null,
            line.description as string | null,
            line.amount as string,
            line.currency as string,
            direction,
            flowKind,
            line.source_name as string,
            line.payment_method as string | null,
            line.account_hint as string | null,
            timestamp,
            timestamp,
          ],
        )
        await this.run("update statement_lines set status = 'converted' where id = ?", [line.id as string])
        created++
      }
      return ok({ created, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async listCashflowEvents(input: ListCashflowEventsInput = {}): Promise<Result<CashflowEventSummary[]>> {
    try {
      const rows = await this.cashflowRows(input)
      return ok(await Promise.all(rows.map((row) => this.mapCashflowEvent(row))))
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowEvent(id: FlowmId): Promise<Result<CashflowEventSummary | null>> {
    try {
      const row = await this.one(`select ce.*, c.name as category_name from cashflow_events ce left join categories c on c.id = ce.category_id where ce.id = ?`, [toSqlId(id)])
      return ok(row ? await this.mapCashflowEvent(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createCashflowEvent(input: CreateCashflowEventInput): Promise<Result<CashflowEventSummary>> {
    try {
      const id = newId("cf")
      const timestamp = nowIso()
      await this.run(
        `insert into cashflow_events
          (id, event_date, occurred_at, title, counterparty, description, user_note, amount, currency, direction, flow_kind,
           category_id, source_kind, source_name, payment_method, account_hint, include_in_analytics, classification_source, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.eventDate,
          input.occurredAt ?? null,
          input.title ?? input.counterparty ?? null,
          input.counterparty ?? null,
          input.description ?? null,
          input.userNote ?? null,
          input.amount,
          normalizeCurrency(input.currency),
          input.direction,
          input.flowKind,
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.sourceKind ?? "manual",
          input.sourceName ?? null,
          input.paymentMethod ?? null,
          input.accountHint ?? null,
          input.includeInAnalytics ?? true,
          input.classificationSource ?? "manual",
          timestamp,
          timestamp,
        ],
      )
      if (input.tagIds) await this.setCashflowEventTags({ id, tagIds: input.tagIds })
      return ok((await this.getCashflowEvent(id)).success ? (await this.getCashflowEvent(id) as { success: true; data: CashflowEventSummary | null }).data! : (() => { throw new Error("created cashflow event not found") })())
    } catch (error) {
      return fail(error)
    }
  }

  async updateCashflowEvent(input: UpdateCashflowEventInput): Promise<Result<CashflowEventSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      if (input.eventDate !== undefined) { fields.push("event_date = ?"); params.push(input.eventDate) }
      if (input.title !== undefined) { fields.push("title = ?"); params.push(input.title) }
      if (input.counterparty !== undefined) { fields.push("counterparty = ?"); params.push(input.counterparty) }
      if (input.description !== undefined) { fields.push("description = ?"); params.push(input.description) }
      if (input.userNote !== undefined) { fields.push("user_note = ?"); params.push(input.userNote) }
      if (input.amount !== undefined) { fields.push("amount = ?"); params.push(input.amount) }
      if (input.currency !== undefined) { fields.push("currency = ?"); params.push(normalizeCurrency(input.currency)) }
      if (input.direction !== undefined) { fields.push("direction = ?"); params.push(input.direction) }
      if (input.flowKind !== undefined) { fields.push("flow_kind = ?"); params.push(input.flowKind) }
      if (input.categoryId !== undefined) { fields.push("category_id = ?"); params.push(input.categoryId == null ? null : toSqlId(input.categoryId)) }
      if (input.includeInAnalytics !== undefined) { fields.push("include_in_analytics = ?"); params.push(input.includeInAnalytics) }
      if (input.status !== undefined) { fields.push("status = ?"); params.push(input.status) }
      params.push(toSqlId(input.id))
      await this.run(`update cashflow_events set ${fields.join(", ")} where id = ?`, params)
      const event = await this.getCashflowEvent(input.id)
      if (!event.success || event.data == null) throw new Error(`Cashflow event ${input.id} not found`)
      return ok(event.data)
    } catch (error) {
      return fail(error)
    }
  }

  async ignoreCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update cashflow_events set status = 'ignored', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async deleteCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update cashflow_events set status = 'deleted', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventCategory(input: { id: FlowmId; categoryId: FlowmId | null }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, categoryId: input.categoryId })
  }

  async setCashflowEventTags(input: { id: FlowmId; tagIds: FlowmId[] }): Promise<Result<void>> {
    try {
      await this.run("delete from cashflow_event_tags where cashflow_event_id = ?", [toSqlId(input.id)])
      for (const tagId of input.tagIds) {
        await this.run("insert or ignore into cashflow_event_tags (cashflow_event_id, tag_id) values (?, ?)", [toSqlId(input.id), toSqlId(tagId)])
      }
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventAnalyticsIncluded(input: { id: FlowmId; includeInAnalytics: boolean }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, includeInAnalytics: input.includeInAnalytics })
  }

  async getCashflowSummary(input: CashflowSummaryInput = {}): Promise<Result<CashflowSummary>> {
    try {
      const metric = input.metric ?? "everyday_spend"
      if (metric === "net_cashflow") {
        const income = Number((await this.getCashflowSummary({ ...input, metric: "income" }) as { success: true; data: CashflowSummary }).data.amount)
        const spend = Number((await this.getCashflowSummary({ ...input, metric: "everyday_spend" }) as { success: true; data: CashflowSummary }).data.amount)
        return ok({ metric, amount: (income - spend).toFixed(2), currency: DEFAULT_CURRENCY })
      }
      const { where, params } = this.cashflowMetricWhere(metric, input)
      const row = await this.one(`select coalesce(sum(cast(amount as real)), 0) as total from cashflow_events ${where}`, params)
      return ok({ metric, amount: Number(row?.total ?? 0).toFixed(2), currency: DEFAULT_CURRENCY })
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowBreakdown(input: CashflowBreakdownInput = {}): Promise<Result<CashflowBreakdownRow[]>> {
    try {
      const groupBy = input.groupBy ?? "flow_kind"
      const { where, params } = this.cashflowMetricWhere(input.metric ?? "all_activity", input)
      const select = groupBy === "category"
        ? "coalesce(c.name, '未分类') as label, coalesce(ce.category_id, 'uncategorized') as key"
        : groupBy === "source"
          ? "coalesce(ce.source_name, 'unknown') as key, coalesce(ce.source_name, 'unknown') as label"
          : "ce.flow_kind as key, ce.flow_kind as label"
      const join = groupBy === "category" ? "left join categories c on c.id = ce.category_id" : ""
      const rows = await this.all(
        `select ${select}, coalesce(sum(cast(ce.amount as real)), 0) as amount
         from cashflow_events ce ${join} ${where.replace(/^where /, "where ")}
         group by key, label order by amount desc`,
        params,
      )
      return ok(rows.map((row) => ({
        key: String(row.key),
        label: String(row.label),
        amount: Number(row.amount ?? 0).toFixed(2),
        currency: DEFAULT_CURRENCY,
      })))
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetItems(input: ListAssetItemsInput = {}): Promise<Result<AssetItemSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.assetType) { conds.push("asset_type = ?"); params.push(input.assetType) }
      if (!input.includeArchived) conds.push("archived_at is null")
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from asset_items ${where} order by display_order asc, name asc`, params)
      return ok(rows.map(this.mapAssetItem))
    } catch (error) {
      return fail(error)
    }
  }

  async createAssetItem(input: CreateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const id = newId("asset")
      const timestamp = nowIso()
      await this.run(
        `insert into asset_items
          (id, name, asset_type, institution, default_currency, valuation_method, display_order, note, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          normalizeAssetType(input.assetType),
          input.institution ?? null,
          normalizeCurrency(input.defaultCurrency),
          input.valuationMethod ?? "manual_balance",
          input.displayOrder ?? 0,
          input.note ?? null,
          timestamp,
          timestamp,
        ],
      )
      return ok(this.mapAssetItem((await this.one("select * from asset_items where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetItem(input: UpdateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      if (input.name !== undefined) { fields.push("name = ?"); params.push(input.name) }
      if (input.assetType !== undefined) { fields.push("asset_type = ?"); params.push(normalizeAssetType(input.assetType)) }
      if (input.institution !== undefined) { fields.push("institution = ?"); params.push(input.institution) }
      if (input.defaultCurrency !== undefined) { fields.push("default_currency = ?"); params.push(normalizeCurrency(input.defaultCurrency)) }
      if (input.valuationMethod !== undefined) { fields.push("valuation_method = ?"); params.push(input.valuationMethod) }
      if (input.displayOrder !== undefined) { fields.push("display_order = ?"); params.push(input.displayOrder) }
      if (input.note !== undefined) { fields.push("note = ?"); params.push(input.note) }
      params.push(toSqlId(input.id))
      await this.run(`update asset_items set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapAssetItem((await this.one("select * from asset_items where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveAssetItem(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update asset_items set archived_at = ?, updated_at = ? where id = ?", [nowIso(), nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSnapshots(input: ListAssetSnapshotsInput = {}): Promise<Result<AssetSnapshotSummary[]>> {
    try {
      const rows = input.latestOnly
        ? await this.latestAssetSnapshotRows(input)
        : await this.assetSnapshotRows(input)
      return ok(rows.map(this.mapAssetSnapshot))
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSparklines(input: ListAssetSparklinesInput = {}): Promise<Result<AssetSparklinePoint[]>> {
    try {
      const limitPerAsset = input.limitPerAsset ?? 30
      const rows = await this.all(
        `select asset_item_id, snapshot_at, value_amount from (
           select s.asset_item_id, s.snapshot_at, s.value_amount,
                  row_number() over (partition by s.asset_item_id
                                     order by s.snapshot_at desc, s.created_at desc, s.id desc) as rn
           from asset_snapshots s
         ) where rn <= ?
         order by asset_item_id, snapshot_at asc`,
        [limitPerAsset],
      )
      return ok(rows.map((row) => ({
        assetItemId: row.asset_item_id as string,
        snapshotAt: row.snapshot_at as string,
        valueNumber: row.value_amount as string,
      })))
    } catch (error) {
      return fail(error)
    }
  }

  async addAssetSnapshot(input: AddAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const id = newId("snap")
      const timestamp = nowIso()
      await this.run(
        `insert into asset_snapshots
          (id, asset_item_id, snapshot_at, value_amount, value_currency, quantity_amount, quantity_unit,
           cost_basis_amount, cost_basis_currency, source_kind, note, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          toSqlId(input.assetItemId),
          input.snapshotAt ?? timestamp,
          input.valueAmount,
          normalizeCurrency(input.valueCurrency),
          input.quantityAmount ?? null,
          input.quantityUnit ?? null,
          input.costBasisAmount ?? null,
          input.costBasisCurrency ? normalizeCurrency(input.costBasisCurrency) : null,
          input.sourceKind ?? "manual",
          input.note ?? null,
          timestamp,
        ],
      )
      return ok(this.mapAssetSnapshot((await this.oneAssetSnapshot(id))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetSnapshot(input: UpdateAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const fields: string[] = []
      const params: SqlParam[] = []
      if (input.snapshotAt !== undefined) { fields.push("snapshot_at = ?"); params.push(input.snapshotAt) }
      if (input.valueAmount !== undefined) { fields.push("value_amount = ?"); params.push(input.valueAmount) }
      if (input.valueCurrency !== undefined) { fields.push("value_currency = ?"); params.push(normalizeCurrency(input.valueCurrency)) }
      if (input.quantityAmount !== undefined) { fields.push("quantity_amount = ?"); params.push(input.quantityAmount) }
      if (input.quantityUnit !== undefined) { fields.push("quantity_unit = ?"); params.push(input.quantityUnit) }
      if (input.costBasisAmount !== undefined) { fields.push("cost_basis_amount = ?"); params.push(input.costBasisAmount) }
      if (input.costBasisCurrency !== undefined) { fields.push("cost_basis_currency = ?"); params.push(input.costBasisCurrency) }
      if (input.note !== undefined) { fields.push("note = ?"); params.push(input.note) }
      if (fields.length > 0) {
        params.push(toSqlId(input.id))
        await this.run(`update asset_snapshots set ${fields.join(", ")} where id = ?`, params)
      }
      return ok(this.mapAssetSnapshot((await this.oneAssetSnapshot(input.id))!))
    } catch (error) {
      return fail(error)
    }
  }

  async deleteAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("delete from asset_snapshots where id = ?", [toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      let assetItemId = input.assetItemId == null ? null : toSqlId(input.assetItemId)
      if (assetItemId == null) {
        const existing = await this.one("select id from asset_items where name = ? and archived_at is null order by created_at desc limit 1", [input.accountName])
        if (existing) {
          assetItemId = existing.id as string
        } else {
          const item = await this.createAssetItem({
            name: input.accountName,
            assetType: input.assetType,
            defaultCurrency: input.valueCurrency ?? DEFAULT_CURRENCY,
            note: input.note,
          })
          if (!item.success) throw new Error(item.error)
          assetItemId = toSqlId(item.data.id)
        }
      }
      if (input.id != null) {
        return this.updateAssetSnapshot({
          id: input.id,
          assetItemId,
          snapshotAt: input.snapshotAt,
          valueAmount: input.valueNumber,
          valueCurrency: input.valueCurrency,
          quantityAmount: input.quantityNumber,
          quantityUnit: input.quantityCurrency,
          note: input.note,
        })
      }
      return this.addAssetSnapshot({
        assetItemId,
        snapshotAt: input.snapshotAt,
        valueAmount: input.valueNumber,
        valueCurrency: input.valueCurrency,
        quantityAmount: input.quantityNumber,
        quantityUnit: input.quantityCurrency,
        sourceKind: input.source,
        note: input.note,
      })
    } catch (error) {
      return fail(error)
    }
  }

  async removeAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>> {
    return this.deleteAssetSnapshot(input)
  }

  async getNetWorthSnapshot(input: NetWorthInput = {}): Promise<Result<NetWorthSnapshot>> {
    try {
      const settings = await this.getCurrencySettings()
      if (!settings.success) throw new Error(settings.error)
      const displayCurrency = normalizeCurrency(input.displayCurrency ?? settings.data.displayCurrency)
      const rows = await this.latestAssetSnapshotRows({})
      let assetValue = 0
      let liabilityValue = 0
      const missingFx: NetWorthSnapshot["missingFx"] = []
      for (const row of rows) {
        const amount = Number(row.value_amount ?? 0)
        const currency = normalizeCurrency(row.value_currency as string)
        const date = String(row.snapshot_at).slice(0, 10)
        const converted = currency === displayCurrency
          ? amount
          : await this.convertAmount(amount, currency, displayCurrency, date)
        if (converted == null) {
          missingFx.push({ assetItemId: row.asset_item_id as string, currency, date })
          continue
        }
        if (row.asset_type === "liability") liabilityValue += converted
        else assetValue += converted
      }
      return ok({
        netWorth: { number: (assetValue - liabilityValue).toFixed(2), currency: displayCurrency },
        assetValue: { number: assetValue.toFixed(2), currency: displayCurrency },
        liabilityValue: { number: liabilityValue.toFixed(2), currency: displayCurrency },
        missingFx,
      })
    } catch (error) {
      return fail(error)
    }
  }

  async getAssetChange(input: AssetChangeInput): Promise<Result<AssetChangeSummary | null>> {
    try {
      const rows = await this.all(
        `select s.*, a.asset_type, a.name as asset_name from asset_snapshots s
         join asset_items a on a.id = s.asset_item_id
         where s.asset_item_id = ?
         order by s.snapshot_at desc, s.created_at desc, s.id desc`,
        [toSqlId(input.assetItemId)],
      )
      if (rows.length < 2) return ok(null)
      const latest = rows[0]
      const comparison = rows[1]
      const latestValue = Number(latest.value_amount)
      const comparisonValue = Number(comparison.value_amount)
      const change = latestValue - comparisonValue
      const percent = comparisonValue === 0 ? 0 : change / comparisonValue
      return ok({
        assetItemId: input.assetItemId,
        changeAmount: change.toFixed(2),
        changePercent: percent.toFixed(6),
        comparisonLabel: "previous_snapshot",
        valueCurrency: latest.value_currency as string,
      })
    } catch (error) {
      return fail(error)
    }
  }

  async listSubscriptions(input: ListSubscriptionsInput = {}): Promise<Result<SubscriptionSummary[]>> {
    try {
      const where = input.status ? "where status = ?" : ""
      const rows = await this.all(`select * from subscriptions ${where} order by next_charge_date asc`, input.status ? [input.status] : [])
      return ok(rows.map(this.mapSubscription))
    } catch (error) {
      return fail(error)
    }
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const id = newId("sub")
      const timestamp = nowIso()
      await this.run(
        `insert into subscriptions
          (id, name, merchant, amount, currency, billing_cycle, interval_count, next_charge_date,
           auto_renew, category_id, note, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.merchant ?? null,
          input.amount,
          normalizeCurrency(input.currency),
          input.billingCycle,
          input.intervalCount ?? 1,
          input.nextChargeDate,
          input.autoRenew ?? true,
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.note ?? null,
          timestamp,
          timestamp,
        ],
      )
      return ok(this.mapSubscription((await this.one("select * from subscriptions where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      const map: Record<string, string> = {
        name: "name",
        merchant: "merchant",
        amount: "amount",
        currency: "currency",
        billingCycle: "billing_cycle",
        intervalCount: "interval_count",
        nextChargeDate: "next_charge_date",
        autoRenew: "auto_renew",
        status: "status",
        note: "note",
      }
      for (const [key, column] of Object.entries(map)) {
        const value = input[key as keyof UpdateSubscriptionInput]
        if (value !== undefined) {
          fields.push(`${column} = ?`)
          params.push(key === "currency" ? normalizeCurrency(value as string) : value as SqlParam)
        }
      }
      if (input.categoryId !== undefined) { fields.push("category_id = ?"); params.push(input.categoryId == null ? null : toSqlId(input.categoryId)) }
      params.push(toSqlId(input.id))
      await this.run(`update subscriptions set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapSubscription((await this.one("select * from subscriptions where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveSubscription(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update subscriptions set status = 'canceled', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async generateSubscriptionOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>> {
    try {
      const params: SqlParam[] = input.id ? [toSqlId(input.id)] : []
      const where = input.id ? "where id = ? and status = 'active'" : "where status = 'active'"
      const subs = await this.all(`select * from subscriptions ${where}`, params)
      let generated = 0
      for (const sub of subs) {
        let due = sub.next_charge_date as string
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = await this.one("select id from subscription_occurrences where subscription_id = ? and due_date = ?", [sub.id as string, due])
          if (!exists) {
            await this.run(
              "insert into subscription_occurrences (id, subscription_id, due_date, amount, currency, created_at) values (?, ?, ?, ?, ?, ?)",
              [newId("subocc"), sub.id as string, due, sub.amount as string, sub.currency as string, nowIso()],
            )
            generated++
          }
          due = addInterval(due, sub.billing_cycle as string, Number(sub.interval_count ?? 1))
        }
      }
      return ok({ generated })
    } catch (error) {
      return fail(error)
    }
  }

  async listSubscriptionOccurrences(input: ListSubscriptionOccurrencesInput = {}): Promise<Result<SubscriptionOccurrenceSummary[]>> {
    try {
      const { where, params } = this.occurrenceWhere("subscription_id", input.subscriptionId, input.dateFrom, input.dateTo)
      const rows = await this.all(`select * from subscription_occurrences ${where} order by due_date asc`, params)
      return ok(rows.map(this.mapSubscriptionOccurrence))
    } catch (error) {
      return fail(error)
    }
  }

  async listLoans(input: ListLoansInput = {}): Promise<Result<LoanSummary[]>> {
    try {
      const where = input.status ? "where status = ?" : ""
      const rows = await this.all(`select * from loans ${where} order by start_date asc`, input.status ? [input.status] : [])
      return ok(rows.map(this.mapLoan))
    } catch (error) {
      return fail(error)
    }
  }

  async getLoan(input: { id: FlowmId }): Promise<Result<LoanSummary | null>> {
    try {
      const row = await this.one("select * from loans where id = ?", [toSqlId(input.id)])
      return ok(row ? this.mapLoan(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createLoan(input: CreateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const id = newId("loan")
      const timestamp = nowIso()
      await this.run(
        `insert into loans
          (id, name, lender, currency, principal_amount, current_principal_estimate, annual_rate_bps,
           repayment_method, payment_amount, payment_day, start_date, term_months, note, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.lender ?? null,
          normalizeCurrency(input.currency),
          input.principalAmount ?? null,
          input.currentPrincipalEstimate ?? null,
          input.annualRateBps ?? null,
          input.repaymentMethod ?? null,
          input.paymentAmount,
          input.paymentDay ?? null,
          input.startDate,
          input.termMonths ?? null,
          input.note ?? null,
          timestamp,
          timestamp,
        ],
      )
      return ok(this.mapLoan((await this.one("select * from loans where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateLoan(input: UpdateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      const map: Record<string, string> = {
        name: "name",
        lender: "lender",
        currency: "currency",
        principalAmount: "principal_amount",
        currentPrincipalEstimate: "current_principal_estimate",
        annualRateBps: "annual_rate_bps",
        repaymentMethod: "repayment_method",
        paymentAmount: "payment_amount",
        paymentDay: "payment_day",
        startDate: "start_date",
        termMonths: "term_months",
        status: "status",
        note: "note",
      }
      for (const [key, column] of Object.entries(map)) {
        const value = input[key as keyof UpdateLoanInput]
        if (value !== undefined) {
          fields.push(`${column} = ?`)
          params.push(key === "currency" ? normalizeCurrency(value as string) : value as SqlParam)
        }
      }
      params.push(toSqlId(input.id))
      await this.run(`update loans set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapLoan((await this.one("select * from loans where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveLoan(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update loans set status = 'closed', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async generateLoanPaymentOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>> {
    try {
      const params: SqlParam[] = input.id ? [toSqlId(input.id)] : []
      const where = input.id ? "where id = ? and status = 'active'" : "where status = 'active'"
      const loans = await this.all(`select * from loans ${where}`, params)
      let generated = 0
      for (const loan of loans) {
        let due = loan.start_date as string
        let remaining = Number(loan.current_principal_estimate ?? loan.principal_amount ?? 0)
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = await this.one("select id from loan_payment_occurrences where loan_id = ? and due_date = ?", [loan.id as string, due])
          if (!exists) {
            const payment = Number(loan.payment_amount ?? 0)
            const interest = loan.annual_rate_bps == null ? 0 : remaining * (Number(loan.annual_rate_bps) / 10000) / 12
            const principal = Math.max(payment - interest, 0)
            remaining = Math.max(remaining - principal, 0)
            await this.run(
              `insert into loan_payment_occurrences
                (id, loan_id, due_date, payment_amount, principal_amount, interest_amount, fee_amount,
                 remaining_principal_estimate, created_at)
               values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [newId("loanocc"), loan.id as string, due, loan.payment_amount as string, principal.toFixed(2), interest.toFixed(2), "0.00", remaining.toFixed(2), nowIso()],
            )
            generated++
          }
          due = addInterval(due, "monthly", 1)
        }
      }
      return ok({ generated })
    } catch (error) {
      return fail(error)
    }
  }

  async listLoanPaymentOccurrences(input: ListLoanPaymentOccurrencesInput = {}): Promise<Result<LoanPaymentOccurrenceSummary[]>> {
    try {
      const { where, params } = this.occurrenceWhere("loan_id", input.loanId, input.dateFrom, input.dateTo)
      const rows = await this.all(`select * from loan_payment_occurrences ${where} order by due_date asc`, params)
      return ok(rows.map(this.mapLoanPaymentOccurrence))
    } catch (error) {
      return fail(error)
    }
  }

  async getFutureFixedPressure(input: FuturePressureInput = {}): Promise<Result<FuturePressureSummary>> {
    try {
      const dateFrom = input.dateFrom ?? new Date().toISOString().slice(0, 10)
      const dateTo = input.dateTo ?? addInterval(dateFrom, "monthly", 1)
      const sub = await this.one(
        `select coalesce(sum(cast(amount as real)), 0) as total from subscription_occurrences
         where due_date >= ? and due_date <= ? and status in ('forecast', 'confirmed')`,
        [dateFrom, dateTo],
      )
      const loan = await this.one(
        `select coalesce(sum(cast(payment_amount as real)), 0) as total from loan_payment_occurrences
         where due_date >= ? and due_date <= ? and status in ('forecast', 'paid')`,
        [dateFrom, dateTo],
      )
      const subscriptions = Number(sub?.total ?? 0)
      const loans = Number(loan?.total ?? 0)
      return ok({
        subscriptions: subscriptions.toFixed(2),
        loans: loans.toFixed(2),
        total: (subscriptions + loans).toFixed(2),
        currency: DEFAULT_CURRENCY,
      })
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetSets(): Promise<Result<BudgetSetSummary[]>> {
    try {
      const rows = await this.all("select * from budget_sets order by created_at asc")
      return ok(rows.map(this.mapBudgetSet))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetSet(input: CreateBudgetSetInput): Promise<Result<BudgetSetSummary>> {
    try {
      const id = newId("bset")
      const timestamp = nowIso()
      await this.run("insert into budget_sets (id, name, created_at, updated_at) values (?, ?, ?, ?)", [id, input.name, timestamp, timestamp])
      return ok(this.mapBudgetSet((await this.one("select * from budget_sets where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetPeriods(input: ListBudgetPeriodsInput = {}): Promise<Result<BudgetPeriodSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.budgetSetId) { conds.push("budget_set_id = ?"); params.push(toSqlId(input.budgetSetId)) }
      if (input.status) { conds.push("status = ?"); params.push(input.status) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from budget_periods ${where} order by period_start desc`, params)
      return ok(rows.map(this.mapBudgetPeriod))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetPeriod(input: CreateBudgetPeriodInput): Promise<Result<BudgetPeriodSummary>> {
    try {
      const id = newId("bper")
      await this.run(
        `insert into budget_periods (id, budget_set_id, period_kind, period_start, period_end, currency)
         values (?, ?, ?, ?, ?, ?)`,
        [id, toSqlId(input.budgetSetId), input.periodKind, input.periodStart, input.periodEnd, normalizeCurrency(input.currency)],
      )
      return ok(this.mapBudgetPeriod((await this.one("select * from budget_periods where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetItems(input: ListBudgetItemsInput = {}): Promise<Result<BudgetItemSummary[]>> {
    try {
      const where = input.budgetPeriodId ? "where budget_period_id = ?" : ""
      const rows = await this.all(`select * from budget_items ${where} order by name asc`, input.budgetPeriodId ? [toSqlId(input.budgetPeriodId)] : [])
      return ok(rows.map(this.mapBudgetItem))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetItem(input: CreateBudgetItemInput): Promise<Result<BudgetItemSummary>> {
    try {
      const id = newId("bitem")
      await this.run(
        `insert into budget_items (id, budget_period_id, name, item_kind, planned_amount, currency, category_id, color)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          toSqlId(input.budgetPeriodId),
          input.name,
          input.itemKind ?? "spending_limit",
          input.plannedAmount,
          normalizeCurrency(input.currency),
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.color ?? null,
        ],
      )
      for (const scope of input.scopes ?? []) {
        await this.run(
          "insert into budget_item_scopes (id, budget_item_id, scope_kind, scope_value) values (?, ?, ?, ?)",
          [newId("bscope"), id, scope.scopeKind === "all_consumption" ? "flow_kind" : scope.scopeKind, scope.scopeKind === "all_consumption" ? "expense" : scope.scopeValue ?? null],
        )
      }
      return ok(this.mapBudgetItem((await this.one("select * from budget_items where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetReferenceProgress(input: BudgetReferenceProgressInput): Promise<Result<BudgetReferenceProgressRow[]>> {
    try {
      const items = await this.all("select * from budget_items where budget_period_id = ? and status = 'active' order by name asc", [toSqlId(input.budgetPeriodId)])
      const period = await this.one("select * from budget_periods where id = ?", [toSqlId(input.budgetPeriodId)])
      if (!period) throw new Error(`Budget period ${input.budgetPeriodId} not found`)
      const rows: BudgetReferenceProgressRow[] = []
      for (const item of items) {
        const { where, params } = await this.budgetUsageWhere(item, period)
        const used = await this.one(`select coalesce(sum(cast(amount as real)), 0) as total from cashflow_events ${where}`, params)
        const budgeted = Number(item.planned_amount ?? 0)
        const referenceUsed = Number(used?.total ?? 0)
        rows.push({
          budgetItemId: item.id as string,
          budgetName: item.name as string,
          budgeted: budgeted.toFixed(2),
          referenceUsed: referenceUsed.toFixed(2),
          remaining: (budgeted - referenceUsed).toFixed(2),
          currency: item.currency as string,
          color: (item.color as string | null) ?? null,
        })
      }
      return ok(rows)
    } catch (error) {
      return fail(error)
    }
  }

  async createBudget(input: CreateBudgetInput): Promise<Result<BusinessRecord>> {
    try {
      const set = await this.createBudgetSet({ name: input.name })
      if (!set.success) throw new Error(set.error)
      const bounds = monthBounds(input.periodStart?.slice(0, 7))
      const period = await this.createBudgetPeriod({
        budgetSetId: set.data.id,
        periodKind: input.periodKind ?? "monthly",
        periodStart: input.periodStart ?? bounds.start,
        periodEnd: input.periodEnd ?? bounds.end,
        currency: input.currency,
      })
      if (!period.success) throw new Error(period.error)
      const item = await this.createBudgetItem({
        budgetPeriodId: period.data.id,
        name: input.name,
        plannedAmount: input.amount,
        currency: input.currency,
        scopes: input.scopes,
      })
      if (!item.success) throw new Error(item.error)
      return ok({ id: item.data.id })
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetProgress(input: { period?: string } = {}): Promise<Result<BudgetProgressRow[]>> {
    try {
      const bounds = monthBounds(input.period)
      const periods = await this.all(
        "select * from budget_periods where period_start <= ? and period_end >= ? and status = 'active'",
        [bounds.end, bounds.start],
      )
      const output: BudgetProgressRow[] = []
      for (const period of periods) {
        const progress = await this.getBudgetReferenceProgress({ budgetPeriodId: period.id as string })
        if (!progress.success) throw new Error(progress.error)
        for (const row of progress.data) {
          output.push({
            budgetId: row.budgetItemId,
            name: row.budgetName,
            tag: null,
            spent: row.referenceUsed,
            budgeted: row.budgeted,
            remaining: row.remaining,
            currency: row.currency,
          })
        }
      }
      return ok(output)
    } catch (error) {
      return fail(error)
    }
  }

  async listObjectLinks(input: ListObjectLinksInput = {}): Promise<Result<ObjectLinkSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.fromType) { conds.push("from_type = ?"); params.push(input.fromType) }
      if (input.fromId) { conds.push("from_id = ?"); params.push(toSqlId(input.fromId)) }
      if (input.toType) { conds.push("to_type = ?"); params.push(input.toType) }
      if (input.toId) { conds.push("to_id = ?"); params.push(toSqlId(input.toId)) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from object_links ${where} order by created_at desc`, params)
      return ok(rows.map(this.mapObjectLink))
    } catch (error) {
      return fail(error)
    }
  }

  async createObjectLink(input: CreateObjectLinkInput): Promise<Result<ObjectLinkSummary>> {
    try {
      const id = newId("link")
      await this.run(
        `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.fromType,
          toSqlId(input.fromId),
          input.toType,
          toSqlId(input.toId),
          input.linkType,
          input.confidence ?? null,
          input.createdBy ?? "user",
          input.note ?? null,
          nowIso(),
        ],
      )
      return ok(this.mapObjectLink((await this.one("select * from object_links where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>> {
    try {
      await this.run("update object_links set link_type = 'confirmed_matches' where id = ?", [toSqlId(input.id)])
      return ok(this.mapObjectLink((await this.one("select * from object_links where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async removeObjectLink(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("delete from object_links where id = ?", [toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async getDashboardSnapshot(): Promise<Result<DashboardSnapshot>> {
    try {
      const netWorth = await this.getNetWorthSnapshot()
      const income = await this.getCashflowSummary({ metric: "income", ...monthBounds() })
      const expense = await this.getCashflowSummary({ metric: "everyday_spend", ...monthBounds() })
      const cashflow = await this.listCashflowEvents({ limit: 30 })
      const net = netWorth.success ? netWorth.data.netWorth : { number: "0.00", currency: DEFAULT_CURRENCY }
      const incomeAmount = income.success ? income.data.amount : "0.00"
      const expenseAmount = expense.success ? expense.data.amount : "0.00"
      return ok({
        metrics: {
          netWorth: net,
          cash: { number: netWorth.success ? netWorth.data.assetValue.number : "0.00", currency: net.currency },
          incomeMtd: { number: incomeAmount, currency: DEFAULT_CURRENCY },
          expenseMtd: { number: expenseAmount, currency: DEFAULT_CURRENCY },
          savingsMtd: { number: (Number(incomeAmount) - Number(expenseAmount)).toFixed(2), currency: DEFAULT_CURRENCY },
        },
        pnlStrip: [],
        dayFlow: cashflow.success
          ? cashflow.data.map((event) => ({
              id: event.id,
              time: event.eventDate,
              symbol: event.flowKind,
              category: event.categoryName ?? event.flowKind,
              account: event.sourceName ?? "",
              amountNumber: event.amount,
              currency: event.currency,
              kind: event.flowKind === "income" ? "income" : event.flowKind === "transfer" ? "transfer" : "expense",
            }))
          : [],
        transactions: cashflow.success ? cashflow.data as unknown as Record<string, unknown>[] : [],
        holdings: [],
        accounts: [],
        generatedAt: nowIso(),
      })
    } catch (error) {
      return fail(error)
    }
  }

  async listFinancialEvents(input: ListFinancialEventsInput = {}): Promise<Result<FinancialEventSummary[]>> {
    return this.listCashflowEvents({
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      flowKind: input.flowKind ? normalizeCashflowKind(input.flowKind) : undefined,
      categoryId: input.categoryId,
      sourceName: input.source,
      limit: input.limit,
      offset: input.offset,
    })
  }

  async createFinancialEvent(input: CreateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    return this.createCashflowEvent({
      eventDate: input.date,
      occurredAt: input.occurredAt ?? null,
      title: input.counterparty ?? input.description ?? null,
      counterparty: input.counterparty ?? null,
      description: input.description ?? null,
      amount: input.amount,
      currency: input.currency,
      direction: normalizeDirection(input.direction),
      flowKind: normalizeCashflowKind(input.flowKind),
      categoryId: input.categoryId,
      accountHint: input.accountHint,
    })
  }

  async updateFinancialEvent(input: UpdateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    return this.updateCashflowEvent({
      id: input.id,
      flowKind: input.flowKind == null ? undefined : normalizeCashflowKind(input.flowKind),
      categoryId: input.categoryId,
      description: input.description,
    })
  }

  async removeFinancialEvent(input: { id: FlowmId }): Promise<Result<void>> {
    return this.deleteCashflowEvent(input)
  }

  async rebuildFinancialEventsFromImports(input?: { batchId?: FlowmId }): Promise<Result<{ created: number; skipped: number }>> {
    return this.convertStatementLinesToCashflowEvents({ importId: input?.batchId })
  }

  async listPlans(input: ListPlansInput = {}): Promise<Result<PlanSummary[]>> {
    try {
      const plans: PlanSummary[] = []
      if (input.planType == null || input.planType === "subscription") {
        const subs = await this.listSubscriptions({ status: input.status })
        if (subs.success) {
          plans.push(...subs.data.map((sub) => ({
            id: sub.id,
            planType: "subscription",
            name: sub.name,
            counterparty: sub.merchant,
            amount: sub.amount,
            currency: sub.currency,
            scheduleRule: `FREQ=${sub.billingCycle.toUpperCase()}`,
            startDate: sub.nextChargeDate,
            nextDueDate: sub.nextChargeDate,
            status: sub.status,
            categoryId: sub.categoryId,
            meta: { sourceDomain: "subscriptions" },
          })))
        }
      }
      if (input.planType == null || input.planType === "loan_repayment" || input.planType === "loan") {
        const loans = await this.listLoans({ status: input.status })
        if (loans.success) {
          plans.push(...loans.data.map((loan) => ({
            id: loan.id,
            planType: "loan_repayment",
            name: loan.name,
            counterparty: loan.lender,
            amount: loan.paymentAmount,
            currency: loan.currency,
            scheduleRule: "FREQ=MONTHLY",
            startDate: loan.startDate,
            nextDueDate: loan.startDate,
            status: loan.status,
            meta: { sourceDomain: "loans" },
          })))
        }
      }
      return ok(plans)
    } catch (error) {
      return fail(error)
    }
  }

  async createPlan(input: CreatePlanInput): Promise<Result<PlanSummary>> {
    if (input.planType === "loan_repayment" || input.planType === "loan") {
      const loan = await this.createLoan({
        name: input.name,
        lender: input.counterparty,
        amount: undefined as never,
        paymentAmount: input.amount,
        currency: input.currency,
        startDate: input.startDate,
        note: input.meta == null ? null : JSON.stringify(input.meta),
      } as CreateLoanInput)
      if (!loan.success) return fail(loan.error)
    } else {
      const sub = await this.createSubscription({
        name: input.name,
        merchant: input.counterparty,
        amount: input.amount,
        currency: input.currency,
        billingCycle: input.scheduleRule.includes("YEARLY") ? "yearly" : input.scheduleRule.includes("WEEKLY") ? "weekly" : "monthly",
        nextChargeDate: input.startDate,
        categoryId: input.categoryId,
        note: input.meta == null ? null : JSON.stringify(input.meta),
      })
      if (!sub.success) return fail(sub.error)
    }
    const plans = await this.listPlans({ planType: input.planType })
    if (!plans.success) return fail(plans.error)
    return ok(plans.data[plans.data.length - 1]!)
  }

  async updatePlan(input: UpdatePlanInput): Promise<Result<PlanSummary>> {
    const plan = (await this.listPlans()).success ? (await this.listPlans() as { success: true; data: PlanSummary[] }).data.find((row) => row.id === input.id) : null
    if (plan?.planType === "loan_repayment") {
      const updated = await this.updateLoan({ id: input.id, name: input.name, paymentAmount: input.amount, currency: input.currency, startDate: input.startDate, status: input.status })
      if (!updated.success) return fail(updated.error)
    } else {
      const updated = await this.updateSubscription({ id: input.id, name: input.name, merchant: input.counterparty, amount: input.amount, currency: input.currency, nextChargeDate: input.startDate, status: input.status })
      if (!updated.success) return fail(updated.error)
    }
    const plans = await this.listPlans()
    if (!plans.success) return fail(plans.error)
    return ok(plans.data.find((row) => row.id === input.id)!)
  }

  async generatePlanOccurrences(input: { planId?: FlowmId; throughDate: string }): Promise<Result<{ generated: number }>> {
    const sub = await this.generateSubscriptionOccurrences({ id: input.planId, throughDate: input.throughDate })
    const loan = await this.generateLoanPaymentOccurrences({ id: input.planId, throughDate: input.throughDate })
    return ok({ generated: (sub.success ? sub.data.generated : 0) + (loan.success ? loan.data.generated : 0) })
  }

  async runFlowQuery(input: RunFlowQueryInput): Promise<Result<FlowQueryResult>> {
    try {
      if (input.sql == null || input.sql.trim().length === 0) return ok({ rows: [], columns: [] })
      const rows = await this.all(input.sql)
      return ok({ rows: rows as Record<string, unknown>[], columns: rows[0] == null ? [] : Object.keys(rows[0]), total: undefined })
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardViews(): Promise<Result<DashboardView[]>> {
    return ok(this.dashboardViews)
  }

  async createDashboardView(input: CreateDashboardViewInput): Promise<Result<DashboardView>> {
    const id = newId("view")
    const view = { id, slug: id, name: input.name, position: this.dashboardViews.length, isDefault: false }
    this.dashboardViews.push(view)
    return ok(view)
  }

  async updateDashboardView(input: UpdateDashboardViewInput): Promise<Result<DashboardView>> {
    const existing = this.dashboardViews.find((view) => view.id === input.id)
    if (!existing) return fail(`Dashboard view ${input.id} not found`)
    if (input.name !== undefined) existing.name = input.name
    if (input.position !== undefined) existing.position = input.position
    return ok(existing)
  }

  async removeDashboardView(input: { id: string }): Promise<Result<void>> {
    this.dashboardViews = this.dashboardViews.filter((view) => view.id !== input.id)
    return ok(undefined)
  }

  async saveDashboardViewOrder(input: { ids: string[] }): Promise<Result<DashboardView[]>> {
    this.dashboardViews = this.dashboardViews.map((view) => ({
      ...view,
      position: input.ids.indexOf(view.id) < 0 ? view.position : input.ids.indexOf(view.id),
    })).sort((a, b) => a.position - b.position)
    return ok(this.dashboardViews)
  }

  async listDashboardCards(input: ListDashboardCardsInput = {}): Promise<Result<DashboardCard[]>> {
    return ok(this.dashboardCards.filter((card) => input.viewId == null || card.viewId === input.viewId))
  }

  async listDashboardLayouts(input: ListDashboardLayoutsInput = {}): Promise<Result<DashboardLayoutEntry[]>> {
    const cardIds = new Set(this.dashboardCards.filter((card) => input.viewId == null || card.viewId === input.viewId).map((card) => card.id))
    return ok(this.dashboardLayouts.filter((layout) => cardIds.has(layout.cardId)))
  }

  async addDashboardCard(input: AddDashboardCardInput): Promise<Result<DashboardCard>> {
    const card: DashboardCard = {
      id: newId("card"),
      viewId: input.viewId,
      type: input.type,
      title: input.title ?? null,
      code: input.code ?? null,
      config: input.config ?? {},
      position: input.position ?? this.dashboardCards.length,
      hidden: false,
    }
    this.dashboardCards.push(card)
    this.dashboardLayouts.push(...input.layouts.map((layout) => ({ ...layout, cardId: card.id })))
    return ok(card)
  }

  async updateDashboardCard(input: UpdateDashboardCardInput): Promise<Result<DashboardCard>> {
    const card = this.dashboardCards.find((row) => row.id === input.id)
    if (!card) return fail(`Dashboard card ${input.id} not found`)
    if (input.title !== undefined) card.title = input.title
    if (input.code !== undefined) card.code = input.code
    if (input.config !== undefined) card.config = input.config
    if (input.hidden !== undefined) card.hidden = input.hidden
    return ok(card)
  }

  async removeDashboardCard(input: { id: string }): Promise<Result<void>> {
    this.dashboardCards = this.dashboardCards.filter((card) => card.id !== input.id)
    this.dashboardLayouts = this.dashboardLayouts.filter((layout) => layout.cardId !== input.id)
    return ok(undefined)
  }

  async saveDashboardLayouts(input: SaveDashboardLayoutsInput): Promise<Result<void>> {
    this.dashboardLayouts = [
      ...this.dashboardLayouts.filter((layout) => !input.rows.some((row) => row.cardId === layout.cardId && row.breakpoint === layout.breakpoint)),
      ...input.rows,
    ]
    return ok(undefined)
  }

  async resetDashboardLayout(): Promise<Result<void>> {
    this.dashboardLayouts = []
    return ok(undefined)
  }

  private async seedDefaults(): Promise<void> {
    await this.ensureCurrencySettings()
    const row = await this.one("select count(*) as count from categories")
    if (Number(row?.count ?? 0) === 0) {
      const timestamp = nowIso()
      for (const category of DEFAULT_CATEGORIES) {
        await this.run(
          `insert into categories (id, name, category_kind, color, icon, display_order, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId("cat"), category.name, category.categoryKind, category.color, category.icon, category.displayOrder, timestamp, timestamp],
        )
      }
    }
  }

  private async ensureCurrencySettings(): Promise<void> {
    const row = await this.one("select id from currency_settings where id = ?", [CURRENCY_SETTINGS_ID])
    if (row) return
    await this.run(
      `insert into currency_settings (id, display_currency, fx_provider, fx_request_policy, updated_at, meta)
       values (?, ?, 'manual', 'manual_only', ?, null)`,
      [CURRENCY_SETTINGS_ID, DEFAULT_CURRENCY, nowIso()],
    )
  }

  private async statementLineRows(input: ListStatementLinesInput & { sourceName?: string } = {}): Promise<SqlRow[]> {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (input.importId) { conds.push("sl.import_id = ?"); params.push(toSqlId(input.importId)) }
    if (input.status) { conds.push("sl.status = ?"); params.push(input.status) }
    if (input.sourceName) { conds.push("si.source_name = ?"); params.push(input.sourceName) }
    const where = conds.length ? `where ${conds.join(" and ")}` : ""
    params.push(input.limit ?? 200)
    return this.all(
      `select sl.*, si.source_name, si.file_name from statement_lines sl
       join statement_imports si on si.id = sl.import_id
       ${where} order by sl.event_date desc, sl.created_at desc limit ?`,
      params,
    )
  }

  private async cashflowRows(input: ListCashflowEventsInput): Promise<SqlRow[]> {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (input.dateFrom) { conds.push("ce.event_date >= ?"); params.push(input.dateFrom) }
    if (input.dateTo) { conds.push("ce.event_date <= ?"); params.push(input.dateTo) }
    const flowKind = input.flowKind
    if (Array.isArray(flowKind) && flowKind.length > 0) {
      conds.push(`ce.flow_kind in (${flowKind.map(() => "?").join(", ")})`)
      params.push(...flowKind)
    } else if (typeof flowKind === "string") {
      conds.push("ce.flow_kind = ?")
      params.push(flowKind)
    }
    if (input.direction) { conds.push("ce.direction = ?"); params.push(input.direction) }
    if (input.categoryId) { conds.push("ce.category_id = ?"); params.push(toSqlId(input.categoryId)) }
    if (input.sourceName ?? input.source) { conds.push("ce.source_name = ?"); params.push(input.sourceName ?? input.source ?? "") }
    if (input.status) { conds.push("ce.status = ?"); params.push(input.status) }
    else conds.push("ce.status != 'deleted'")
    if (input.includeInAnalytics !== undefined) { conds.push("ce.include_in_analytics = ?"); params.push(input.includeInAnalytics) }
    if (input.keyword) {
      conds.push("(ce.title like ? or ce.counterparty like ? or ce.description like ?)")
      params.push(`%${input.keyword}%`, `%${input.keyword}%`, `%${input.keyword}%`)
    }
    if (input.tagId) {
      conds.push("exists (select 1 from cashflow_event_tags cet where cet.cashflow_event_id = ce.id and cet.tag_id = ?)")
      params.push(toSqlId(input.tagId))
    }
    const where = conds.length ? `where ${conds.join(" and ")}` : ""
    params.push(input.limit ?? 200, input.offset ?? 0)
    return this.all(
      `select ce.*, c.name as category_name from cashflow_events ce
       left join categories c on c.id = ce.category_id
       ${where} order by ce.event_date desc, ce.created_at desc limit ? offset ?`,
      params,
    )
  }

  private cashflowMetricWhere(metric: string, input: CashflowSummaryInput): { where: string; params: SqlParam[] } {
    const conds: string[] = ["status = 'active'"]
    const params: SqlParam[] = []
    if (!input.includeIgnored) conds.push("include_in_analytics = 1")
    if (input.dateFrom) { conds.push("event_date >= ?"); params.push(input.dateFrom) }
    if (input.dateTo) { conds.push("event_date <= ?"); params.push(input.dateTo) }
    switch (metric) {
      case "income":
        conds.push("flow_kind = 'income'", "direction = 'in'")
        break
      case "debt_payments":
        conds.push("flow_kind = 'debt_payment'")
        break
      case "asset_movements":
        conds.push("flow_kind = 'asset_movement'")
        break
      case "refunds":
        conds.push("flow_kind = 'refund'")
        break
      case "all_activity":
        break
      case "everyday_spend":
      default:
        conds.push("flow_kind = 'expense'", "direction = 'out'")
        break
    }
    return { where: `where ${conds.join(" and ")}`, params }
  }

  private async assetSnapshotRows(input: ListAssetSnapshotsInput): Promise<SqlRow[]> {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (input.assetItemId) { conds.push("s.asset_item_id = ?"); params.push(toSqlId(input.assetItemId)) }
    if (input.accountName) { conds.push("a.name = ?"); params.push(input.accountName) }
    const where = conds.length ? `where ${conds.join(" and ")}` : ""
    return this.all(
      `select s.*, a.name as asset_name, a.asset_type, a.institution, a.default_currency from asset_snapshots s
       join asset_items a on a.id = s.asset_item_id
       ${where} order by s.snapshot_at desc, s.created_at desc`,
      params,
    )
  }

  private async latestAssetSnapshotRows(input: ListAssetSnapshotsInput): Promise<SqlRow[]> {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (input.assetItemId) { conds.push("s.asset_item_id = ?"); params.push(toSqlId(input.assetItemId)) }
    if (input.accountName) { conds.push("a.name = ?"); params.push(input.accountName) }
    const where = conds.length ? `and ${conds.join(" and ")}` : ""
    return this.all(
      `select s.*, a.name as asset_name, a.asset_type, a.institution, a.default_currency from asset_snapshots s
       join asset_items a on a.id = s.asset_item_id
       where s.id = (
         select s2.id from asset_snapshots s2
         where s2.asset_item_id = s.asset_item_id
         order by s2.snapshot_at desc, s2.created_at desc, s2.id desc
         limit 1
       ) ${where}
       order by a.display_order asc, a.name asc`,
      params,
    )
  }

  private async oneAssetSnapshot(id: FlowmId): Promise<SqlRow | null> {
    return this.one(
      `select s.*, a.name as asset_name, a.asset_type, a.institution, a.default_currency from asset_snapshots s
       join asset_items a on a.id = s.asset_item_id
       where s.id = ?`,
      [toSqlId(id)],
    )
  }

  private occurrenceWhere(column: string, id?: FlowmId, dateFrom?: string, dateTo?: string): { where: string; params: SqlParam[] } {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (id) { conds.push(`${column} = ?`); params.push(toSqlId(id)) }
    if (dateFrom) { conds.push("due_date >= ?"); params.push(dateFrom) }
    if (dateTo) { conds.push("due_date <= ?"); params.push(dateTo) }
    return { where: conds.length ? `where ${conds.join(" and ")}` : "", params }
  }

  private async budgetUsageWhere(item: SqlRow, period: SqlRow): Promise<{ where: string; params: SqlParam[] }> {
    const conds: string[] = [
      "status = 'active'",
      "include_in_analytics = 1",
      "event_date >= ?",
      "event_date <= ?",
    ]
    const params: SqlParam[] = [period.period_start as string, period.period_end as string]
    if (item.category_id != null) { conds.push("category_id = ?"); params.push(item.category_id as string) }
    const scopes = await this.all("select * from budget_item_scopes where budget_item_id = ?", [item.id as string])
    for (const scope of scopes) {
      if (scope.scope_kind === "category" || scope.scope_kind === "category_tree") {
        conds.push("category_id = ?")
        params.push(scope.scope_value as string)
      } else if (scope.scope_kind === "source") {
        conds.push("source_name = ?")
        params.push(scope.scope_value as string)
      } else if (scope.scope_kind === "flow_kind") {
        conds.push("flow_kind = ?")
        params.push(scope.scope_value as string)
      } else if (scope.scope_kind === "tag") {
        conds.push("exists (select 1 from cashflow_event_tags cet where cet.cashflow_event_id = cashflow_events.id and cet.tag_id = ?)")
        params.push(scope.scope_value as string)
      }
    }
    if (item.category_id == null && scopes.length === 0) {
      conds.push("flow_kind = 'expense'")
    }
    return { where: `where ${conds.join(" and ")}`, params }
  }

  private async convertAmount(amount: number, fromCurrency: string, toCurrency: string, date: string): Promise<number | null> {
    const row = await this.one(
      "select rate from exchange_rates where from_currency = ? and to_currency = ? and rate_date = ? order by fetched_at desc limit 1",
      [fromCurrency, toCurrency, date],
    )
    if (row?.rate != null) return amount * Number(row.rate)
    const provider = this.options.fxProvider
    if (provider == null) return null
    const fetched = await provider.fetchRate({ fromCurrency, toCurrency, date })
    if (fetched == null) return null
    const id = newId("fx")
    await this.run(
      `insert into exchange_rates (id, from_currency, to_currency, rate_date, rate, provider, fetched_at, source_date, meta)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        normalizeCurrency(fetched.fromCurrency),
        normalizeCurrency(fetched.toCurrency),
        fetched.rateDate,
        fetched.rate,
        fetched.provider,
        nowIso(),
        fetched.sourceDate ?? fetched.rateDate,
        json(fetched.meta ?? null),
      ],
    )
    return amount * Number(fetched.rate)
  }

  private mapCurrencySettings(row: SqlRow): CurrencySettingsSummary {
    return {
      displayCurrency: row.display_currency as string,
      fxProvider: row.fx_provider as string,
      fxRequestPolicy: row.fx_request_policy as string,
      updatedAt: row.updated_at as string,
      meta: parseJsonObject(row.meta),
    }
  }

  private mapExchangeRate(row: SqlRow): ExchangeRateSummary {
    return {
      id: row.id as string,
      fromCurrency: row.from_currency as string,
      toCurrency: row.to_currency as string,
      rateDate: row.rate_date as string,
      rate: row.rate as string,
      provider: row.provider as string,
      fetchedAt: row.fetched_at as string,
      sourceDate: row.source_date as string | null,
      meta: parseJsonObject(row.meta),
    }
  }

  private mapCategory(row: SqlRow): CategorySummary {
    return {
      id: row.id as string,
      name: row.name as string,
      parentId: row.parent_id as string | null,
      categoryKind: row.category_kind as string,
      kind: row.category_kind as string,
      color: row.color as string | null,
      icon: row.icon as string | null,
      sortOrder: Number(row.display_order ?? 0),
      displayOrder: Number(row.display_order ?? 0),
      archived: row.archived_at != null,
      archivedAt: row.archived_at as string | null,
    }
  }

  private mapTag(row: SqlRow): TagSummary {
    return {
      id: row.id as string,
      name: row.name as string,
      color: row.color as string | null,
      archived: row.archived_at != null,
    }
  }

  private mapStatementImport(row: SqlRow): StatementImportSummary {
    return {
      id: row.id as string,
      sourceName: row.source_name as string,
      fileName: row.file_name as string | null,
      fileHash: row.file_hash as string | null,
      importedAt: row.imported_at as string,
      status: row.status as string,
    }
  }

  private mapStatementLine(row: SqlRow): StatementLineSummary {
    return {
      id: row.id as string,
      importId: row.import_id as string,
      externalId: row.external_id as string | null,
      eventDate: row.event_date as string,
      occurredAt: row.occurred_at as string | null,
      counterparty: row.counterparty as string | null,
      description: row.description as string | null,
      amount: row.amount as string,
      currency: row.currency as string,
      direction: row.direction as string,
      status: row.status as string,
    }
  }

  private async mapCashflowEvent(row: SqlRow): Promise<CashflowEventSummary> {
    const tagRows = await this.all(
      `select t.* from tags t join cashflow_event_tags cet on cet.tag_id = t.id where cet.cashflow_event_id = ? order by t.name`,
      [row.id as string],
    )
    return {
      id: row.id as string,
      statementLineId: row.statement_line_id as string | null,
      eventDate: row.event_date as string,
      date: row.event_date as string,
      occurredAt: row.occurred_at as string | null,
      title: row.title as string | null,
      counterparty: row.counterparty as string | null,
      description: row.description as string | null,
      userNote: row.user_note as string | null,
      amount: row.amount as string,
      currency: row.currency as string,
      direction: row.direction as Direction,
      flowKind: row.flow_kind as string,
      categoryId: row.category_id as string | null,
      categoryName: row.category_name as string | null,
      sourceKind: row.source_kind as string,
      sourceName: row.source_name as string | null,
      source: row.source_name as string | null,
      includeInAnalytics: Boolean(row.include_in_analytics),
      status: row.status as ActiveStatus,
      classificationSource: row.classification_source as string,
      tags: tagRows.map(this.mapTag),
      createdAt: row.created_at as string,
    }
  }

  private mapAssetItem(row: SqlRow): AssetItemSummary {
    return {
      id: row.id as string,
      name: row.name as string,
      assetType: row.asset_type as AssetType,
      institution: row.institution as string | null,
      defaultCurrency: row.default_currency as string,
      valuationMethod: row.valuation_method as string,
      archived: row.archived_at != null,
      note: row.note as string | null,
    }
  }

  private mapAssetSnapshot(row: SqlRow): AssetSnapshotSummary {
    return {
      id: row.id as string,
      assetItemId: row.asset_item_id as string,
      accountName: row.asset_name as string,
      assetType: row.asset_type === "brokerage" ? "investment" : row.asset_type as AssetSnapshotType,
      snapshotAt: row.snapshot_at as string,
      quantityNumber: row.quantity_amount as string | null,
      quantityCurrency: row.quantity_unit as string | null,
      quantityAmount: row.quantity_amount as string | null,
      quantityUnit: row.quantity_unit as string | null,
      valueNumber: row.value_amount as string,
      valueCurrency: row.value_currency as string,
      source: row.source_kind as string,
      note: row.note as string | null,
      meta: {
        costBasisAmount: row.cost_basis_amount,
        costBasisCurrency: row.cost_basis_currency,
        institution: row.institution,
      },
    }
  }

  private mapSubscription(row: SqlRow): SubscriptionSummary {
    return {
      id: row.id as string,
      name: row.name as string,
      merchant: row.merchant as string | null,
      amount: row.amount as string,
      currency: row.currency as string,
      billingCycle: row.billing_cycle as string,
      intervalCount: Number(row.interval_count ?? 1),
      nextChargeDate: row.next_charge_date as string,
      autoRenew: Boolean(row.auto_renew),
      categoryId: row.category_id as string | null,
      status: row.status as string,
      note: row.note as string | null,
    }
  }

  private mapSubscriptionOccurrence(row: SqlRow): SubscriptionOccurrenceSummary {
    return {
      id: row.id as string,
      subscriptionId: row.subscription_id as string,
      dueDate: row.due_date as string,
      amount: row.amount as string,
      currency: row.currency as string,
      status: row.status as string,
    }
  }

  private mapLoan(row: SqlRow): LoanSummary {
    return {
      id: row.id as string,
      name: row.name as string,
      lender: row.lender as string | null,
      currency: row.currency as string,
      principalAmount: row.principal_amount as string | null,
      currentPrincipalEstimate: row.current_principal_estimate as string | null,
      annualRateBps: row.annual_rate_bps as number | null,
      repaymentMethod: row.repayment_method as string | null,
      paymentAmount: row.payment_amount as string,
      paymentDay: row.payment_day as number | null,
      startDate: row.start_date as string,
      termMonths: row.term_months as number | null,
      status: row.status as string,
      note: row.note as string | null,
    }
  }

  private mapLoanPaymentOccurrence(row: SqlRow): LoanPaymentOccurrenceSummary {
    return {
      id: row.id as string,
      loanId: row.loan_id as string,
      dueDate: row.due_date as string,
      paymentAmount: row.payment_amount as string,
      principalAmount: row.principal_amount as string | null,
      interestAmount: row.interest_amount as string | null,
      feeAmount: row.fee_amount as string | null,
      remainingPrincipalEstimate: row.remaining_principal_estimate as string | null,
      status: row.status as string,
    }
  }

  private mapBudgetSet(row: SqlRow): BudgetSetSummary {
    return { id: row.id as string, name: row.name as string, status: row.status as string }
  }

  private mapBudgetPeriod(row: SqlRow): BudgetPeriodSummary {
    return {
      id: row.id as string,
      budgetSetId: row.budget_set_id as string,
      periodKind: row.period_kind as string,
      periodStart: row.period_start as string,
      periodEnd: row.period_end as string,
      currency: row.currency as string,
      status: row.status as string,
    }
  }

  private mapBudgetItem(row: SqlRow): BudgetItemSummary {
    return {
      id: row.id as string,
      budgetPeriodId: row.budget_period_id as string,
      name: row.name as string,
      itemKind: row.item_kind as string,
      plannedAmount: row.planned_amount as string,
      currency: row.currency as string,
      categoryId: row.category_id as string | null,
      color: (row.color as string | null) ?? null,
      status: row.status as string,
    }
  }

  private mapObjectLink(row: SqlRow): ObjectLinkSummary {
    return {
      id: row.id as string,
      fromType: row.from_type as string,
      fromId: row.from_id as string,
      toType: row.to_type as string,
      toId: row.to_id as string,
      linkType: row.link_type as string,
      confidence: row.confidence as number | null,
      createdBy: row.created_by as string,
      note: row.note as string | null,
    }
  }

  private async one(sql: string, params: SqlParam[] = []): Promise<SqlRow | null> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    return this.db.$client.prepare(sql).get(...bound) as SqlRow | null
  }

  private async all(sql: string, params: SqlParam[] = []): Promise<SqlRow[]> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    return this.db.$client.prepare(sql).all(...bound) as SqlRow[]
  }

  private async run(sql: string, params: SqlParam[] = []): Promise<void> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    this.db.$client.prepare(sql).run(...bound)
  }
}

export function createFlowmApi(db: Database, options: FlowmApiOptions = {}): FlowmApi {
  return new FlowmSqliteApi(db, options)
}
