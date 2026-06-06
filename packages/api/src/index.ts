import {
  ImportReconciliationService,
  addMonths,
  addDecimals,
  type ImportedEntryInput,
  type NormalizedStatementEntry,
} from "@flowm/business"
import {
  ElectronSqlExecutor,
  MIGRATION_STATEMENTS,
  type SqlExecutor,
  type SqlParam,
  type SqlRow,
} from "@flowm/db"
import { isElectron, type ISODate, type Result } from "@flowm/shared"

export interface FlowmApi {
  initializeFlowm(): Promise<Result<void>>
  getDashboardSnapshot(): Promise<Result<DashboardSnapshot>>
  importEntries(input: ImportEntriesInput): Promise<Result<ImportedBatchResult>>
  importNormalizedStatementEntries(input: ImportNormalizedStatementEntriesInput): Promise<Result<ImportedBatchResult>>
  listImportedEntries(input?: ListImportedEntriesInput): Promise<Result<ImportedEntrySummary[]>>
  listAssetSnapshots(input?: ListAssetSnapshotsInput): Promise<Result<AssetSnapshotSummary[]>>
  upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>>
  removeAssetSnapshot(input: { id: number }): Promise<Result<void>>
  getCurrencySettings(): Promise<Result<CurrencySettingsSummary>>
  updateCurrencySettings(input: UpdateCurrencySettingsInput): Promise<Result<CurrencySettingsSummary>>
  listExchangeRates(input?: ListExchangeRatesInput): Promise<Result<ExchangeRateSummary[]>>
  refreshExchangeRates(input?: RefreshExchangeRatesInput): Promise<Result<RefreshExchangeRatesResult>>
  createBudget(input: CreateBudgetInput): Promise<Result<BusinessRecord>>
  getBudgetProgress(input?: { period?: string }): Promise<Result<BudgetProgressRow[]>>
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
  // Financial Events (No-Ledger model)
  listFinancialEvents(input?: ListFinancialEventsInput): Promise<Result<FinancialEventSummary[]>>
  createFinancialEvent(input: CreateFinancialEventInput): Promise<Result<FinancialEventSummary>>
  updateFinancialEvent(input: UpdateFinancialEventInput): Promise<Result<FinancialEventSummary>>
  removeFinancialEvent(input: { id: number }): Promise<Result<void>>
  rebuildFinancialEventsFromImports(input?: { batchId?: number }): Promise<Result<{ created: number; skipped: number }>>
  // Categories
  listCategories(): Promise<Result<CategorySummary[]>>
  createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>>
  updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>>
  archiveCategory(input: { id: number }): Promise<Result<void>>
  // Plans (replaces subscriptions + loans in the No-Ledger model)
  listPlans(input?: ListPlansInput): Promise<Result<PlanSummary[]>>
  createPlan(input: CreatePlanInput): Promise<Result<PlanSummary>>
  updatePlan(input: UpdatePlanInput): Promise<Result<PlanSummary>>
  generatePlanOccurrences(input: { planId?: number; throughDate: string }): Promise<Result<{ generated: number }>>
  // Flow Query (replaces runBeancountQuery for new data sources)
  runFlowQuery(input: RunFlowQueryInput): Promise<Result<FlowQueryResult>>
}

export interface BusinessRecord {
  id: number | string
}

export interface DashboardSnapshot {
  metrics: {
    netWorth: MoneyAmount
    cash: MoneyAmount
    incomeMtd: MoneyAmount
    expenseMtd: MoneyAmount
    savingsMtd: MoneyAmount
  }
  pnlStrip: Array<{
    label: string
    value: string
    delta: string
    up: boolean
  }>
  dayFlow: DayFlowRow[]
  transactions: Record<string, unknown>[]
  holdings: HoldingRow[]
  accounts: Record<string, unknown>[]
  generatedAt: string
}

export interface DayFlowRow {
  id: number
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

export interface MoneyAmount {
  number: string
  currency: string
}

export interface ImportEntriesInput {
  sourceName: string
  importedAt: string
  fileName?: string | null
  entries: ImportedEntryInput[]
}

export interface ImportNormalizedStatementEntriesInput {
  sourceName: string
  importedAt: string
  fileName?: string | null
  fileHash?: string | null
  entries: NormalizedStatementEntry[]
  summary?: unknown
}

export interface ImportedBatchResult {
  batchId: number
  inserted: number
  skipped: number
}

export interface ListImportedEntriesInput {
  limit?: number
  sourceName?: string
  status?: "pending" | "matched" | "confirmed" | "ignored"
  classification?: string
}

export interface ImportedEntrySummary {
  id: number
  batchId: number
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
  status: "pending" | "matched" | "confirmed" | "ignored"
  raw: Record<string, unknown> | null
}

export type AssetSnapshotType = "cash" | "bank" | "wallet" | "investment" | "fixed_asset" | "liability" | "other"

export interface ListAssetSnapshotsInput {
  accountName?: string
  latestOnly?: boolean
}

export interface AssetSnapshotSummary {
  id: number
  accountName: string
  assetType: AssetSnapshotType
  snapshotAt: string
  quantityNumber: string | null
  quantityCurrency: string | null
  valueNumber: string
  valueCurrency: string
  source: string
  note: string | null
  meta: Record<string, unknown> | null
}

export interface UpsertAssetSnapshotInput {
  id?: number
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
  id: number
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

export interface FxRateProvider {
  readonly id: string
  fetchRate(input: FxRateFetchInput): Promise<FxRateFetchResult | null>
}

export interface FlowmApiOptions {
  fxProvider?: FxRateProvider
}

export type DashboardBreakpoint = "lg" | "md" | "sm" | "xs" | "xxs"

export interface DashboardView {
  id: string
  name: string
  slug: string
  position: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDashboardViewInput {
  name: string
}

export interface UpdateDashboardViewInput {
  id: string
  name?: string
  position?: number
}

export interface ListDashboardCardsInput {
  viewId?: string
}

export interface ListDashboardLayoutsInput {
  viewId?: string
}

export interface DashboardLayoutEntry {
  cardId: string
  breakpoint: DashboardBreakpoint
  x: number
  y: number
  w: number
  h: number
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
  createdAt: string
  updatedAt: string
}

export interface AddDashboardCardInput {
  id?: string
  viewId?: string
  type: string
  title?: string | null
  code?: string | null
  config?: Record<string, unknown>
  layouts: DashboardLayoutEntry[]
}

export interface UpdateDashboardCardInput {
  id: string
  title?: string | null
  code?: string | null
  config?: Record<string, unknown>
  hidden?: boolean
  position?: number
}

export interface SaveDashboardLayoutsInput {
  viewId?: string
  rows: DashboardLayoutEntry[]
}

export interface BudgetProgressRow {
  budgetId: number
  name: string
  period: string
  accountName: string | null
  tag: string | null
  budgeted: string
  actual: string
  remaining: string
}

export interface BudgetScopeInput {
  scopeKind: "category" | "category_tree" | "tag" | "source" | "flow_kind" | "all_consumption"
  scopeValue?: string | null
}

export interface CreateBudgetInput {
  name: string
  amount: string
  currency?: string
  periodKind?: string
  periodStart?: string
  periodEnd?: string
  includeFlowKinds?: string[]
  scopes?: BudgetScopeInput[]
}

interface ImportedEntryRow extends SqlRow {
  id: number
  batch_id: number
  date: string
  occurred_at: string | null
  payee: string | null
  narration: string | null
  amount_number: string
  currency: string
  account_name: string
  source_sub_account_label: string | null
  counterparty_account: string | null
  payment_method: string | null
  merchant_order_id: string | null
  direction: string | null
  classification: string | null
  confidence: number | null
  status: "pending" | "matched" | "confirmed" | "ignored"
  raw: string | null
  meta: string | null
  source_name: string
  file_name: string | null
  external_id: string | null
}

interface AssetSnapshotSqlRow extends SqlRow {
  id: number
  account_name: string
  asset_type: AssetSnapshotType
  snapshot_at: string
  quantity_number: string | null
  quantity_currency: string | null
  value_number: string
  value_currency: string
  source: string
  note: string | null
  meta: string | null
}

interface CurrencySettingsSqlRow extends SqlRow {
  id: string
  display_currency: string
  fx_provider: string
  fx_request_policy: string
  updated_at: string
  meta: string | null
}

interface ExchangeRateSqlRow extends SqlRow {
  id: number
  from_currency: string
  to_currency: string
  rate_date: string
  rate: string
  provider: string
  fetched_at: string
  source_date: string | null
  meta: string | null
}

interface DashboardCardSqlRow extends SqlRow {
  id: string
  view_id: string
  type: string
  title: string | null
  code: string | null
  config_json: string
  position: number
  hidden: number
  created_at: string
  updated_at: string
}

interface DashboardViewSqlRow extends SqlRow {
  id: string
  name: string
  slug: string
  position: number
  is_default: number
  created_at: string
  updated_at: string
}

interface DashboardLayoutSqlRow extends SqlRow {
  card_id: string
  breakpoint: string
  x: number
  y: number
  w: number
  h: number
}

interface FxRequirement {
  fromCurrency: string
  toCurrency: string
  rateDate: string
}

const DEFAULT_CURRENCY = "CNY"
const DEFAULT_FX_PROVIDER = "frankfurter"
const DEFAULT_FX_REQUEST_POLICY = "on_demand_foreign_currency_only"
const CURRENCY_SETTINGS_ID = "default"
const SEED_CARD_VERSION = 9
const DEFAULT_DASHBOARD_VIEW_ID = "overview"
const ASSETS_DASHBOARD_VIEW_ID = "assets"

const RESET_SCHEMA_TABLES = [
  "exchange_rates",
  "currency_settings",
  "budget_scopes",
  "plan_occurrences",
  "plans",
  "classification_rules",
  "categories",
  "financial_events",
  "cashflow_events",
  "dashboard_layouts",
  "dashboard_cards",
  "dashboard_views",
  "asset_snapshots",
  "imported_entries",
  "import_batches",
  "loan_schedule_items",
  "loans",
  "subscriptions",
  "recurring_rules",
  "investment_instruments",
  "budgets",
  "document_links",
  "document_tags",
  "documents",
  "note_links",
  "note_tags",
  "notes",
  "prices",
  "pads",
  "balance_asserts",
  "transaction_links",
  "transaction_tags",
  "postings",
  "transactions",
  "account_labels",
  "account_currencies",
  "accounts",
  "commodities",
  "customs",
  "events",
  "queries",
  "links",
  "tags",
] as const

const DEFAULT_CATEGORIES: Array<{ name: string; kind: string; icon: string; color: string; sortOrder: number }> = [
  // Expense
  { name: "餐饮", kind: "expense", icon: "🍜", color: "#FF6B6B", sortOrder: 1 },
  { name: "购物", kind: "expense", icon: "🛍️", color: "#FFA07A", sortOrder: 2 },
  { name: "交通", kind: "expense", icon: "🚇", color: "#87CEEB", sortOrder: 3 },
  { name: "娱乐", kind: "expense", icon: "🎬", color: "#DDA0DD", sortOrder: 4 },
  { name: "住房", kind: "expense", icon: "🏠", color: "#98FB98", sortOrder: 5 },
  { name: "通讯", kind: "expense", icon: "📱", color: "#B0C4DE", sortOrder: 6 },
  { name: "医疗", kind: "expense", icon: "💊", color: "#F0E68C", sortOrder: 7 },
  { name: "教育", kind: "expense", icon: "📚", color: "#E6E6FA", sortOrder: 8 },
  { name: "保险", kind: "expense", icon: "🛡️", color: "#FAEBD7", sortOrder: 9 },
  { name: "订阅", kind: "expense", icon: "🔄", color: "#E0FFFF", sortOrder: 10 },
  { name: "其他支出", kind: "expense", icon: "💸", color: "#F5F5DC", sortOrder: 11 },
  // Income
  { name: "工资", kind: "income", icon: "💰", color: "#90EE90", sortOrder: 20 },
  { name: "奖金", kind: "income", icon: "🎁", color: "#98FB98", sortOrder: 21 },
  { name: "投资收益", kind: "income", icon: "📈", color: "#00FA9A", sortOrder: 22 },
  { name: "理财收益", kind: "income", icon: "🏦", color: "#3CB371", sortOrder: 23 },
  { name: "兼职收入", kind: "income", icon: "💼", color: "#2E8B57", sortOrder: 24 },
  { name: "其他收入", kind: "income", icon: "💵", color: "#66CDAA", sortOrder: 25 },
  // Asset movement
  { name: "投资买入", kind: "asset_movement", icon: "📊", color: "#6495ED", sortOrder: 30 },
  { name: "投资卖出", kind: "asset_movement", icon: "💹", color: "#4169E1", sortOrder: 31 },
  // Debt
  { name: "借款", kind: "debt", icon: "🏧", color: "#CD853F", sortOrder: 40 },
  { name: "还款", kind: "debt", icon: "💳", color: "#D2691E", sortOrder: 41 },
  // Transfer
  { name: "账户转账", kind: "transfer", icon: "↔️", color: "#808080", sortOrder: 50 },
  // Adjustment
  { name: "退款", kind: "adjustment", icon: "↩️", color: "#A9A9A9", sortOrder: 60 },
  { name: "报销", kind: "adjustment", icon: "📋", color: "#C0C0C0", sortOrder: 61 },
]

const DEFAULT_DASHBOARD_VIEWS = [
  { id: "overview", slug: "overview", name: "总览", sourceName: null },
  { id: "alipay", slug: "alipay", name: "支付宝", sourceName: "alipay_personal_csv" },
  { id: "wechat", slug: "wechat", name: "微信", sourceName: "wechat_personal_xlsx" },
  { id: ASSETS_DASHBOARD_VIEW_ID, slug: "assets", name: "资产", sourceName: null },
] as const


function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

function fail<T>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

function json(input: Record<string, unknown> | null | undefined) {
  return input == null ? null : JSON.stringify(input)
}

function todayMonth() {
  return new Date().toISOString().slice(0, 7)
}

function addAmount(values: string[]) {
  return values.length === 0 ? "0.00" : addDecimals(...values)
}

function normalizeDirection(direction: string | null | undefined): "in" | "out" | null {
  if (direction === "in" || direction === "income") return "in"
  if (direction === "out" || direction === "expense") return "out"
  return null
}

function dayFlowKind(flowKind: unknown, direction: unknown): DayFlowRow["kind"] {
  if (flowKind === "income" || direction === "in") return "income"
  if (
    flowKind === "transfer" ||
    flowKind === "asset_movement" ||
    flowKind === "debt_repayment" ||
    flowKind === "debt_drawdown"
  ) {
    return "transfer"
  }
  return "expense"
}

function rowToDashboardCard(row: DashboardCardSqlRow): DashboardCard {
  let config: Record<string, unknown> = {}
  if (row.config_json) {
    try {
      const parsed = JSON.parse(row.config_json) as unknown
      if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
        config = parsed as Record<string, unknown>
      }
    } catch {
      config = {}
    }
  }
  return {
    id: row.id,
    viewId: row.view_id,
    type: row.type,
    title: row.title,
    code: row.code,
    config,
    position: Number(row.position),
    hidden: Number(row.hidden) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToDashboardView(row: DashboardViewSqlRow): DashboardView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    position: Number(row.position),
    isDefault: Number(row.is_default) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToDashboardLayout(row: DashboardLayoutSqlRow): DashboardLayoutEntry {
  return {
    cardId: row.card_id,
    breakpoint: row.breakpoint as DashboardBreakpoint,
    x: Number(row.x),
    y: Number(row.y),
    w: Number(row.w),
    h: Number(row.h),
  }
}

function rowToImportedEntrySummary(row: ImportedEntryRow): ImportedEntrySummary {
  return {
    id: Number(row.id),
    batchId: Number(row.batch_id),
    sourceName: row.source_name,
    fileName: row.file_name,
    externalId: row.external_id,
    merchantOrderId: row.merchant_order_id,
    occurredAt: row.occurred_at,
    date: row.date,
    payee: row.payee,
    narration: row.narration,
    amountNumber: row.amount_number,
    currency: row.currency,
    accountName: row.account_name,
    sourceSubAccountLabel: row.source_sub_account_label,
    counterpartyAccount: row.counterparty_account,
    paymentMethod: row.payment_method,
    direction: row.direction,
    classification: row.classification,
    confidence: row.confidence == null ? null : Number(row.confidence),
    status: row.status,
    raw: parseJsonObject(row.raw),
  }
}

function rowToAssetSnapshotSummary(row: AssetSnapshotSqlRow): AssetSnapshotSummary {
  return {
    id: Number(row.id),
    accountName: row.account_name,
    assetType: row.asset_type,
    snapshotAt: row.snapshot_at,
    quantityNumber: row.quantity_number,
    quantityCurrency: row.quantity_currency,
    valueNumber: row.value_number,
    valueCurrency: row.value_currency,
    source: row.source,
    note: row.note,
    meta: parseJsonObject(row.meta),
  }
}

function rowToCurrencySettingsSummary(row: CurrencySettingsSqlRow): CurrencySettingsSummary {
  return {
    displayCurrency: row.display_currency,
    fxProvider: row.fx_provider,
    fxRequestPolicy: row.fx_request_policy,
    updatedAt: row.updated_at,
    meta: parseJsonObject(row.meta),
  }
}

function rowToExchangeRateSummary(row: ExchangeRateSqlRow): ExchangeRateSummary {
  return {
    id: Number(row.id),
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    rateDate: row.rate_date,
    rate: row.rate,
    provider: row.provider,
    fetchedAt: row.fetched_at,
    sourceDate: row.source_date,
    meta: parseJsonObject(row.meta),
  }
}

function parseJsonObject(value: string | Record<string, unknown> | null): Record<string, unknown> | null {
  if (value == null) return null
  if (typeof value === "object") return value
  try {
    const parsed = JSON.parse(value) as unknown
    if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
}

function parseJsonStringArray(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }
  if (typeof value !== "string" || value.length === 0) return null
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : null
  } catch {
    return null
  }
}

function scopeParseFlowKinds(value: unknown): string[] | null {
  return parseJsonStringArray(value)
}

function generateCardId(): string {
  const cryptoObj =
    typeof globalThis !== "undefined" && "crypto" in globalThis ? (globalThis as { crypto?: Crypto }).crypto : undefined
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function generateDashboardViewId(): string {
  const cryptoObj =
    typeof globalThis !== "undefined" && "crypto" in globalThis ? (globalThis as { crypto?: Crypto }).crypto : undefined
  if (cryptoObj?.randomUUID) return `view_${cryptoObj.randomUUID()}`
  return `view_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function slugBase(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug.length > 0 ? slug : "view"
}

function normalizeCurrencyCode(value: string): string {
  return value.trim().toUpperCase()
}

function isCurrencyCode(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-Z]{3}$/.test(normalizeCurrencyCode(value))
}

function assertDisplayCurrency(value: string): string {
  const currency = normalizeCurrencyCode(value)
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Display currency must be a 3-letter ISO currency code")
  }
  return currency
}

function displayQueryNeedsFx(sql: string): boolean {
  const lower = sql.toLowerCase()
  return [
    "financial_events_display",
    "asset_snapshots_display",
    "latest_assets_display",
    "plans_display",
  ].some((view) => lower.includes(view))
}

class FrankfurterFxProvider implements FxRateProvider {
  readonly id = DEFAULT_FX_PROVIDER

  async fetchRate(input: FxRateFetchInput): Promise<FxRateFetchResult | null> {
    const fromCurrency = normalizeCurrencyCode(input.fromCurrency)
    const toCurrency = normalizeCurrencyCode(input.toCurrency)
    const date = input.date
    const url = new URL(`https://api.frankfurter.dev/v1/${encodeURIComponent(date)}`)
    url.searchParams.set("base", fromCurrency)
    url.searchParams.set("symbols", toCurrency)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Frankfurter returned HTTP ${response.status}`)
    }
    const payload = (await response.json()) as {
      base?: unknown
      date?: unknown
      rates?: Record<string, unknown>
    }
    const rawRate = payload.rates?.[toCurrency]
    if (typeof rawRate !== "number" || !Number.isFinite(rawRate)) return null
    return {
      fromCurrency,
      toCurrency,
      rateDate: date,
      rate: String(rawRate),
      provider: this.id,
      sourceDate: typeof payload.date === "string" ? payload.date : date,
      meta: { endpoint: "frankfurter.v1" },
    }
  }
}

interface DashboardSeedCard {
  id: string
  type: string
  title?: string | null
  code?: string | null
  config?: Record<string, unknown>
  position: number
}

interface DashboardSeedLayout extends DashboardLayoutEntry {}

export interface DashboardSeedBundle {
  cards: DashboardSeedCard[]
  layouts: DashboardSeedLayout[]
}

interface SeedLayoutSpec {
  lg: { x: number; y: number; w: number; h: number }
  md: { x: number; y: number; w: number; h: number }
  sm: { x: number; y: number; w: number; h: number }
  xs: { x: number; y: number; w: number; h: number }
  xxs: { x: number; y: number; w: number; h: number }
}

type SeedLayoutKind = "kpi" | "table" | "line" | "pie" | "trend"

const SEED_BREAKPOINTS: DashboardBreakpoint[] = ["lg", "md", "sm", "xs", "xxs"]

// ── Flow Query SQL builders for seed cards ──────────────────────────────────

const DISPLAY_FX_OK_SQL = "fx_status IN ('same_currency', 'converted')"

// Base expense SQL for financial_events, with optional source filter
function feExpenseSql(extra: string): string {
  const src = extra ? ` AND source = '${extra}'` : ""
  return `flow_kind IN ('consumption_expense', 'financial_cost')${src} AND ${DISPLAY_FX_OK_SQL}`
}
function feIncomeSql(extra: string): string {
  const src = extra ? ` AND source = '${extra}'` : ""
  return `flow_kind = 'income'${src} AND ${DISPLAY_FX_OK_SQL}`
}

// Build KPI SQL: SUM of amount filtered by a WHERE clause
function kpiSum(where: string): string {
  return `SELECT ROUND(COALESCE(SUM(CAST(amount_display AS REAL)), 0), 2) AS total FROM financial_events_display WHERE ${where}`
}
function kpiSumMtd(where: string): string {
  return `${kpiSum(`${where} AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')`)}`
}
function kpiSum30d(where: string): string {
  return `${kpiSum(`${where} AND date >= date('now', '-30 days')`)}`
}

const LATEST_ASSETS_CTE = `WITH latest_assets AS (
  SELECT s.*
  FROM latest_assets_display s
  WHERE s.fx_status IN ('same_currency', 'converted')
)`

function assetTypeLabelSql(column = "asset_type"): string {
  return `CASE ${column}
    WHEN 'cash' THEN '现金'
    WHEN 'bank' THEN '银行'
    WHEN 'wallet' THEN '钱包'
    WHEN 'investment' THEN '投资'
    WHEN 'fixed_asset' THEN '固定资产'
    WHEN 'liability' THEN '负债'
    ELSE '其他'
  END`
}

function latestAssetKpiSql(where: string, expression = "SUM(CAST(value_display AS REAL))"): string {
  return `${LATEST_ASSETS_CTE} SELECT ROUND(COALESCE(${expression}, 0), 2) AS total FROM latest_assets WHERE ${where}`
}

function latestAssetTableSql(): string {
  return `${LATEST_ASSETS_CTE} SELECT account_name AS account, ${assetTypeLabelSql()} AS type, ROUND(CAST(value_display AS REAL), 2) AS value, currency_display AS currency, date(snapshot_at) AS date, source AS source FROM latest_assets ORDER BY account_name LIMIT 50`
}

function latestAssetDistributionSql(): string {
  return `${LATEST_ASSETS_CTE} SELECT ${assetTypeLabelSql()} AS type, ROUND(SUM(ABS(CAST(value_display AS REAL))), 2) AS total FROM latest_assets GROUP BY type ORDER BY total DESC`
}

function planMonthlyKpiSql(planType: string): string {
  return `SELECT ROUND(COALESCE(SUM(CAST(monthly_amount_display AS REAL)), 0), 2) AS total FROM plans_display WHERE plan_type = '${planType}' AND status = 'active' AND ${DISPLAY_FX_OK_SQL}`
}

function futurePlanTableSql(): string {
  return `SELECT next_due_date AS date, CASE plan_type WHEN 'subscription' THEN '订阅' WHEN 'loan_repayment' THEN '贷款' ELSE plan_type END AS type, name AS name, COALESCE(counterparty, '') AS counterparty, ROUND(CAST(amount_display AS REAL), 2) AS amount, currency_display AS currency, status AS status FROM plans_display WHERE plan_type IN ('subscription', 'loan_repayment') AND status = 'active' AND ${DISPLAY_FX_OK_SQL} ORDER BY next_due_date ASC, id ASC LIMIT 30`
}

function tableSql(sourceFilter: string): string {
  const src = sourceFilter ? ` AND fe.source = '${sourceFilter}'` : ""
  return `SELECT fe.date AS date, COALESCE(fe.counterparty, fe.description, '—') AS payee, ROUND(CAST(fe.amount_display AS REAL), 2) AS amount, fe.currency_display AS currency, fe.flow_kind AS kind FROM financial_events_display fe WHERE fe.fx_status IN ('same_currency', 'converted')${src} ORDER BY fe.date DESC, fe.id DESC LIMIT 30`
}

function lineSql(sourceFilter: string): string {
  const src = sourceFilter ? ` AND source = '${sourceFilter}'` : ""
  return `SELECT strftime('%Y-%m', date) AS month, ROUND(SUM(CAST(amount_display AS REAL)), 2) AS total FROM financial_events_display WHERE flow_kind IN ('consumption_expense', 'financial_cost') AND ${DISPLAY_FX_OK_SQL}${src} GROUP BY month ORDER BY month`
}

function pieSql(sourceFilter: string): string {
  const src = sourceFilter ? ` AND fe.source = '${sourceFilter}'` : ""
  return `SELECT COALESCE(fe.category_name, '未分类') AS category, ROUND(SUM(CAST(fe.amount_display AS REAL)), 2) AS total FROM financial_events_display fe WHERE fe.flow_kind IN ('consumption_expense', 'financial_cost') AND fe.fx_status IN ('same_currency', 'converted')${src} GROUP BY category ORDER BY total DESC LIMIT 8`
}

function areaSql(sourceFilter: string): string {
  const src = sourceFilter ? ` AND fe.source = '${sourceFilter}'` : ""
  return `SELECT strftime('%Y-%m', fe.date) AS month, COALESCE(fe.category_name, '未分类') AS category, ROUND(SUM(CAST(fe.amount_display AS REAL)), 2) AS total FROM financial_events_display fe WHERE fe.flow_kind IN ('consumption_expense', 'financial_cost') AND fe.fx_status IN ('same_currency', 'converted')${src} GROUP BY month, category ORDER BY month`
}

function seedLayout(kind: SeedLayoutKind, index: number, kpiOffset = 0): SeedLayoutSpec {
  if (kind === "kpi") {
    const slot = index + kpiOffset
    return {
      lg: { x: (slot % 4) * 3, y: Math.floor(slot / 4) * 2, w: 3, h: 2 },
      md: { x: (slot % 4) * 3, y: Math.floor(slot / 4) * 2, w: 3, h: 2 },
      sm: { x: (slot % 2) * 3, y: Math.floor(slot / 2) * 2, w: 3, h: 2 },
      xs: { x: (slot % 2) * 2, y: Math.floor(slot / 2) * 2, w: 2, h: 2 },
      xxs: { x: 0, y: slot * 2, w: 2, h: 2 },
    }
  }
  if (kind === "table") {
    return {
      lg: { x: 0, y: 4, w: 6, h: 5 },
      md: { x: 0, y: 4, w: 12, h: 5 },
      sm: { x: 0, y: 8, w: 6, h: 5 },
      xs: { x: 0, y: 8, w: 4, h: 5 },
      xxs: { x: 0, y: 8 + kpiOffset * 2, w: 2, h: 5 },
    }
  }
  if (kind === "line") {
    return {
      lg: { x: 6, y: 4, w: 6, h: 5 },
      md: { x: 0, y: 9, w: 12, h: 5 },
      sm: { x: 0, y: 13, w: 6, h: 5 },
      xs: { x: 0, y: 13, w: 4, h: 5 },
      xxs: { x: 0, y: 13 + kpiOffset * 2, w: 2, h: 5 },
    }
  }
  if (kind === "pie") {
    return {
      lg: { x: 0, y: 9, w: 5, h: 5 },
      md: { x: 0, y: 14, w: 6, h: 5 },
      sm: { x: 0, y: 18, w: 6, h: 5 },
      xs: { x: 0, y: 18, w: 4, h: 5 },
      xxs: { x: 0, y: 18 + kpiOffset * 2, w: 2, h: 5 },
    }
  }
  return {
    lg: { x: 5, y: 9, w: 7, h: 5 },
    md: { x: 6, y: 14, w: 6, h: 5 },
    sm: { x: 0, y: 23, w: 6, h: 5 },
    xs: { x: 0, y: 23, w: 4, h: 5 },
    xxs: { x: 0, y: 23 + kpiOffset * 2, w: 2, h: 5 },
  }
}

function buildSeedTemplates(viewId: string, sourceName?: string | null): Array<{
  suffix: string
  type: string
  code: string
  title: string
  config?: Record<string, unknown>
  layoutKind: SeedLayoutKind
}> {
  const src = sourceName ?? ""
  const templates: Array<{
    suffix: string
    type: string
    code: string
    title: string
    config?: Record<string, unknown>
    layoutKind: SeedLayoutKind
  }> = []

  if (viewId === ASSETS_DASHBOARD_VIEW_ID) {
    return [
      {
        suffix: "kpi-net",
        type: "custom-kpi",
        code: "NET",
        title: "净资产",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("1=1"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-liquid",
        type: "custom-kpi",
        code: "CASH",
        title: "现金/钱包/银行",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("asset_type IN ('cash', 'wallet', 'bank')"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-investments",
        type: "custom-kpi",
        code: "INV",
        title: "投资资产",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("asset_type = 'investment'"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-fixed",
        type: "custom-kpi",
        code: "FIXED",
        title: "固定资产",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("asset_type = 'fixed_asset'"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-liability",
        type: "custom-kpi",
        code: "DEBT",
        title: "负债",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("asset_type = 'liability'", "SUM(ABS(CAST(value_display AS REAL)))"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-subscriptions",
        type: "custom-kpi",
        code: "SUB",
        title: "订阅月成本",
        config: {
          viz: "kpi",
          sql: planMonthlyKpiSql("subscription"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-loans",
        type: "custom-kpi",
        code: "LOAN",
        title: "贷款月供压力",
        config: {
          viz: "kpi",
          sql: planMonthlyKpiSql("loan_repayment"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "table-assets",
        type: "custom-table",
        code: "ASSET",
        title: "最新资产明细",
        config: {
          viz: "table",
          sql: latestAssetTableSql(),
        },
        layoutKind: "table",
      },
      {
        suffix: "table-plans",
        type: "custom-table",
        code: "PLAN",
        title: "未来计划列表",
        config: {
          viz: "table",
          sql: futurePlanTableSql(),
        },
        layoutKind: "line",
      },
      {
        suffix: "pie-assets",
        type: "custom-pie",
        code: "MIX",
        title: "资产分布",
        config: {
          viz: "pie",
          sql: latestAssetDistributionSql(),
          labelColumn: "type",
          valueColumn: "total",
        },
        layoutKind: "pie",
      },
    ]
  }

  // Overview-only KPIs: net worth and cash (from asset_snapshots)
  if (viewId === DEFAULT_DASHBOARD_VIEW_ID) {
    templates.push(
      {
        suffix: "kpi-net",
        type: "custom-kpi",
        code: "NET",
        title: "净资产",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("1=1"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
      {
        suffix: "kpi-cash",
        type: "custom-kpi",
        code: "CASH",
        title: "现金",
        config: {
          viz: "kpi",
          sql: latestAssetKpiSql("asset_type IN ('cash', 'bank', 'wallet')"),
          valueColumn: "total",
          format: { kind: "currency", decimals: 2 },
        },
        layoutKind: "kpi",
      },
    )
  }

  // Shared KPI + chart cards (income/expense from financial_events)
  templates.push(
    {
      suffix: "kpi-exp-mtd",
      type: "custom-kpi",
      code: "MEXP",
      title: "本月支出",
      config: {
        viz: "kpi",
        sql: kpiSumMtd(feExpenseSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "kpi-exp-30d",
      type: "custom-kpi",
      code: "30EXP",
      title: "近30天支出",
      config: {
        viz: "kpi",
        sql: kpiSum30d(feExpenseSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "kpi-exp-total",
      type: "custom-kpi",
      code: "TEXP",
      title: "总支出",
      config: {
        viz: "kpi",
        sql: kpiSum(feExpenseSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "kpi-inc-mtd",
      type: "custom-kpi",
      code: "MINC",
      title: "本月收入",
      config: {
        viz: "kpi",
        sql: kpiSumMtd(feIncomeSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "kpi-inc-30d",
      type: "custom-kpi",
      code: "30INC",
      title: "近30天收入",
      config: {
        viz: "kpi",
        sql: kpiSum30d(feIncomeSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "kpi-inc-total",
      type: "custom-kpi",
      code: "TINC",
      title: "总收入",
      config: {
        viz: "kpi",
        sql: kpiSum(feIncomeSql(src)),
        valueColumn: "total",
        format: { kind: "currency", decimals: 2 },
      },
      layoutKind: "kpi",
    },
    {
      suffix: "table-recent",
      type: "custom-table",
      code: "TXN",
      title: "近期流水",
      config: {
        viz: "table",
        sql: tableSql(src),
      },
      layoutKind: "table",
    },
    {
      suffix: "line-monthly-exp",
      type: "custom-line",
      code: "LINE",
      title: "月度支出趋势",
      config: {
        viz: "line",
        sql: lineSql(src),
        xColumn: "month",
        yColumns: ["total"],
        smooth: true,
      },
      layoutKind: "line",
    },
    {
      suffix: "pie-category",
      type: "custom-pie",
      code: "PIE",
      title: "分类分布",
      config: {
        viz: "pie",
        sql: pieSql(src),
        labelColumn: "category",
        valueColumn: "total",
      },
      layoutKind: "pie",
    },
    {
      suffix: "area-category-trend",
      type: "custom-area",
      code: "CAT",
      title: "分类走势",
      config: {
        viz: "area",
        sql: areaSql(src),
        xColumn: "month",
        seriesColumn: "category",
        valueColumn: "total",
        smooth: true,
      },
      layoutKind: "trend",
    },
  )
  return templates
}

export function buildDefaultDashboardSeed(
  _now: string,
  input: { viewId?: string; sourceName?: string | null } = {},
): DashboardSeedBundle {
  const viewId = input.viewId ?? DEFAULT_DASHBOARD_VIEW_ID
  const templates = buildSeedTemplates(viewId, input.sourceName)
  const kpiOffset = 0
  const cards: DashboardSeedCard[] = templates.map((spec, index) => ({
    id: `seed-${viewId}-${spec.suffix}`,
    type: spec.type,
    title: spec.title,
    code: spec.code,
    config: spec.config ?? {},
    position: index,
  }))
  const layouts: DashboardSeedLayout[] = []
  for (const [index, spec] of templates.entries()) {
    const layoutSpec = seedLayout(spec.layoutKind, index, kpiOffset)
    for (const breakpoint of SEED_BREAKPOINTS) {
      const layout = layoutSpec[breakpoint]
      layouts.push({
        cardId: `seed-${viewId}-${spec.suffix}`,
        breakpoint,
        x: layout.x,
        y: layout.y,
        w: layout.w,
        h: layout.h,
      })
    }
  }
  return { cards, layouts }
}

// ── No-Ledger model: input/output types ──────────────────────────────────────

export interface ListFinancialEventsInput {
  dateFrom?: string
  dateTo?: string
  flowKind?: string
  categoryId?: number
  source?: string
  limit?: number
  offset?: number
}

export interface FinancialEventSummary {
  id: number
  source?: string
  sourceEntryId?: number
  occurredAt?: string
  date: string
  counterparty?: string
  description?: string
  flowKind: string
  categoryId?: number
  categoryName?: string
  amount: string
  currency: string
  direction?: string
  confidence?: number
  classificationSource: string
  explanationTags?: string[]
  createdAt: string
}

export interface CreateFinancialEventInput {
  date: string
  occurredAt?: string
  counterparty?: string
  description?: string
  flowKind: string
  categoryId?: number
  amount: string
  currency?: string
  direction?: string
  accountHint?: string
  explanationTags?: string[]
}

export interface UpdateFinancialEventInput {
  id: number
  flowKind?: string
  categoryId?: number
  description?: string
  explanationTags?: string[]
}

export interface CategorySummary {
  id: number
  name: string
  parentId?: number
  kind: string
  color?: string
  icon?: string
  sortOrder: number
  archived: boolean
}

export interface CreateCategoryInput {
  name: string
  parentId?: number
  kind: string
  color?: string
  icon?: string
  sortOrder?: number
}

export interface UpdateCategoryInput {
  id: number
  name?: string
  parentId?: number
  kind?: string
  color?: string
  icon?: string
  sortOrder?: number
}

export interface ListPlansInput {
  planType?: string
  status?: string
}

export interface PlanSummary {
  id: number
  planType: string
  name: string
  counterparty?: string
  amount: string
  currency: string
  scheduleRule: string
  startDate: string
  endDate?: string
  nextDueDate?: string
  status: string
  categoryId?: number
  flowKind?: string
  accountHint?: string
  meta?: Record<string, unknown> | null
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
  categoryId?: number
  flowKind?: string
  accountHint?: string
  meta?: Record<string, unknown>
}

export interface UpdatePlanInput {
  id: number
  name?: string
  counterparty?: string | null
  amount?: string
  currency?: string
  scheduleRule?: string
  startDate?: string
  endDate?: string
  status?: string
  categoryId?: number
  flowKind?: string | null
  accountHint?: string | null
  meta?: Record<string, unknown> | null
}

export interface RunFlowQueryInput {
  // Raw SQL mode — executes directly against the new No-Ledger schema
  sql?: string
  // Structured mode (convenience wrapper)
  from?:
    | "financial_events"
    | "financial_events_display"
    | "asset_snapshots"
    | "asset_snapshots_display"
    | "latest_assets_display"
    | "plans"
    | "plans_display"
    | "plan_occurrences"
    | "budgets"
  dateFrom?: string
  dateTo?: string
  groupBy?: string
  flowKind?: string[]
  categoryId?: number
  aggregation?: "sum" | "count" | "avg"
  amountField?: string
}

export interface FlowQueryResult {
  rows: Record<string, unknown>[]
  columns: string[]
  total?: string
}

// Helper: generate plan occurrence dates from a minimal plan row
// Map imported_entries.classification + direction to financial_events.flow_kind
function classifyImportedEntry(classification: string | null, direction: string | null): string {
  switch (classification) {
    case "external_expense_candidate":
      return "consumption_expense"
    case "platform_income_candidate":
    case "investment_income_candidate":
      return "income"
    case "refund_candidate":
    case "investment_refund_candidate":
      return "adjustment"
    case "personal_transfer_candidate":
    case "internal_transfer_candidate":
      return "transfer"
    case "gift_candidate":
      if (direction === "income") return "income"
      if (direction === "expense") return "consumption_expense"
      return "transfer"
    case "investment_buy_candidate":
      return "asset_movement"
    case "closed_or_failed":
      return "ignored"
    case "ambiguous":
      break
    default:
      break
  }
  // Fall back to direction if classification is ambiguous/null
  if (direction === "expense") return "consumption_expense"
  if (direction === "income") return "income"
  return "ambiguous"
}

function defaultCategoryNameForImportedEntry(entry: SqlRow, flowKind: string): string | null {
  const classification = entry.classification as string | null
  const direction = entry.direction as string | null
  const meta = parseJsonObject(entry.meta as string | null)
  const text = [
    entry.payee,
    entry.narration,
    entry.payment_method,
    entry.source_sub_account_label,
    entry.counterparty_account,
    meta?.type,
    meta?.note,
  ]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ")

  if (classification === "refund_candidate") return "退款"
  if (classification === "investment_refund_candidate") return "投资卖出"
  if (classification === "investment_buy_candidate") return "投资买入"
  if (classification === "investment_income_candidate") return /余额宝|零钱通|理财/.test(text) ? "理财收益" : "投资收益"
  if (classification === "platform_income_candidate") return "其他收入"
  if (classification === "gift_candidate") return direction === "income" ? "其他收入" : "其他支出"
  if (flowKind === "transfer") return "账户转账"
  if (flowKind === "debt_repayment") return "还款"
  if (flowKind === "debt_drawdown") return "借款"
  if (flowKind === "income") return "其他收入"
  if (flowKind !== "consumption_expense" && flowKind !== "financial_cost") return null
  if (/订阅|会员|自动续费|爱奇艺|腾讯视频|优酷|网易云|Spotify|Netflix|Apple|iCloud/i.test(text)) return "订阅"
  if (/餐|饭|咖啡|奶茶|外卖|美团|饿了么|麦当劳|肯德基|KFC|星巴克|食|饮/i.test(text)) return "餐饮"
  if (/地铁|公交|交通|滴滴|打车|出租|高铁|铁路|航旅|机票|停车|加油/i.test(text)) return "交通"
  if (/淘宝|天猫|京东|拼多多|购物|商场|超市|便利店|优衣库|Nike|Adidas/i.test(text)) return "购物"
  if (/电影|游戏|娱乐|剧院|演出|音乐|Steam|PlayStation|Switch/i.test(text)) return "娱乐"
  if (/房租|物业|水电|燃气|宽带|租房|住房/i.test(text)) return "住房"
  if (/话费|流量|通讯|移动|联通|电信/i.test(text)) return "通讯"
  if (/医院|医疗|药|体检|诊所/i.test(text)) return "医疗"
  if (/教育|课程|学习|培训|学校|书/i.test(text)) return "教育"
  if (/保险|保费/i.test(text)) return "保险"
  return "其他支出"
}

function occurrenceDatesFromPlan(
  scheduleRule: string,
  startDate: string,
  endDate: string | null | undefined,
  throughDate: string,
): string[] {
  const end = endDate && endDate < throughDate ? endDate : throughDate
  const freq = scheduleRule.match(/FREQ=(\w+)/i)?.[1]?.toUpperCase() ?? "MONTHLY"
  const byMonthDay = scheduleRule.match(/BYMONTHDAY=(\d+)/i)?.[1]
  const interval = parseInt(scheduleRule.match(/INTERVAL=(\d+)/i)?.[1] ?? "1")
  const dates: string[] = []
  let current = startDate
  let safety = 0
  while (current <= end && safety++ < 500) {
    dates.push(current)
    const d = new Date(current + "T00:00:00Z")
    if (freq === "WEEKLY") {
      d.setUTCDate(d.getUTCDate() + 7 * interval)
    } else if (freq === "YEARLY") {
      d.setUTCFullYear(d.getUTCFullYear() + interval)
    } else {
      const targetDay = byMonthDay ? parseInt(byMonthDay) : d.getUTCDate()
      let m = d.getUTCMonth() + interval
      const y = d.getUTCFullYear() + Math.floor(m / 12)
      m = m % 12
      const maxDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
      d.setUTCFullYear(y, m, Math.min(targetDay, maxDay))
    }
    current = d.toISOString().slice(0, 10)
  }
  return dates
}

// ─────────────────────────────────────────────────────────────────────────────

class FlowmSqliteApi implements FlowmApi {
  private readonly importService = new ImportReconciliationService()
  private readonly fxProvider: FxRateProvider

  constructor(
    private readonly executor: SqlExecutor,
    options: FlowmApiOptions = {},
  ) {
    this.fxProvider = options.fxProvider ?? new FrankfurterFxProvider()
  }

  async initializeFlowm(): Promise<Result<void>> {
    try {
      await this.resetLegacySchemaIfNeeded()
      await this.executor.executeBatchSql(MIGRATION_STATEMENTS.map((sql) => ({ sql })))
      await this.seedCurrencySettingsIfEmpty()
      await this.seedDefaultCategoriesIfEmpty()
      await this.seedDefaultDashboardIfEmpty()
      await this.rebuildFinancialEventsCore()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async getDashboardSnapshot(): Promise<Result<DashboardSnapshot>> {
    try {
      await this.prepareDisplayCurrencyContext()
      const settings = await this.currencySettingsRow()
      const displayCurrency = settings.display_currency
      const period = todayMonth()
      const monthStart = `${period}-01`
      const nextMonthStart = addMonths(monthStart as ISODate, 1)
      const assets = await this.all<SqlRow>(
        `select * from latest_assets_display
         where fx_status in ('same_currency', 'converted')
         order by account_name`,
      )
      // Recent financial events for day-flow strip
      const recentEvents = await this.all<SqlRow>(
        `SELECT * FROM financial_events_display
         WHERE fx_status in ('same_currency', 'converted')
         ORDER BY date DESC, id DESC LIMIT 50`,
      )
      // MTD aggregates from display currency values.
      const mtdRows = await this.all<SqlRow>(
        `SELECT flow_kind, SUM(CAST(amount_display AS REAL)) as total
         FROM financial_events_display
         WHERE fx_status in ('same_currency', 'converted') AND date >= ? AND date < ?
         GROUP BY flow_kind`,
        [monthStart, nextMonthStart],
      )
      const cashValues: string[] = []
      const assetValues: string[] = []
      let incomeMtd = "0.00"
      let expenseMtd = "0.00"
      for (const asset of assets) {
        const value = asset.value_display
        if (value == null) continue
        assetValues.push(String(value))
        if (asset.asset_type === "cash" || asset.asset_type === "bank" || asset.asset_type === "wallet") {
          cashValues.push(String(value))
        }
      }
      for (const row of mtdRows) {
        const kind = row.flow_kind as string
        const total = Math.abs(Number(row.total)).toFixed(2)
        if (kind === "income") incomeMtd = total
        else if (kind === "consumption_expense" || kind === "financial_cost") {
          expenseMtd = (Number(expenseMtd) + Number(total)).toFixed(2)
        }
      }
      const savings = (Number(incomeMtd) - Number(expenseMtd)).toFixed(2)
      const netWorth = addAmount(assetValues)
      const holdings: HoldingRow[] = assets.map((asset) => ({
        account: asset.account_name as string,
        symbol: (asset.account_name as string).split(":").pop()?.toUpperCase() ?? "?",
        name: asset.account_name as string,
        type: String(asset.asset_type).toUpperCase(),
        balanceNumber: String(asset.value_display ?? "0"),
        currency: displayCurrency,
      }))
      const dayFlow: DayFlowRow[] = recentEvents.slice(0, 12).map((e) => ({
        id: e.id as number,
        time: (e.date as string).slice(5),
        symbol: (e.counterparty ?? e.description ?? e.source ?? "—") as string,
        category: (e.category_name ?? e.flow_kind ?? "other") as string,
        account: (e.account_hint ?? e.source ?? "") as string,
        amountNumber: String(e.amount_display ?? "0"),
        currency: displayCurrency,
        kind: dayFlowKind(e.flow_kind, e.direction),
      }))
      return ok({
        accounts: [],
        transactions: [],
        holdings,
        dayFlow,
        metrics: {
          netWorth: { number: netWorth, currency: displayCurrency },
          cash: { number: addAmount(cashValues), currency: displayCurrency },
          incomeMtd: { number: incomeMtd, currency: displayCurrency },
          expenseMtd: { number: expenseMtd, currency: displayCurrency },
          savingsMtd: { number: savings, currency: displayCurrency },
        },
        pnlStrip: [
          { label: "1D", value: "0.00", delta: "0.0%", up: true },
          { label: "MTD", value: savings, delta: "LIVE", up: !savings.startsWith("-") },
          { label: "INC", value: incomeMtd, delta: period, up: true },
          { label: "EXP", value: expenseMtd, delta: period, up: false },
          { label: "NET", value: netWorth, delta: "BOOK", up: !netWorth.startsWith("-") },
        ],
        generatedAt: new Date().toISOString(),
      })
    } catch (error) {
      return fail(error)
    }
  }

  async createBudget(input: CreateBudgetInput): Promise<Result<BusinessRecord>> {
    try {
      const now = new Date().toISOString()
      const id = await this.insertOne(
        `insert into budgets
          (name, period_kind, period_start, period_end, amount, currency, include_flow_kinds, status, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [
          input.name,
          input.periodKind ?? "monthly",
          input.periodStart ?? null,
          input.periodEnd ?? null,
          input.amount,
          input.currency ?? DEFAULT_CURRENCY,
          input.includeFlowKinds == null ? null : JSON.stringify(input.includeFlowKinds),
          now,
          now,
        ],
      )
      if (input.scopes != null && input.scopes.length > 0) {
        await this.executor.executeBatchSql(
          input.scopes.map((scope) => ({
            sql: "insert into budget_scopes (budget_id, scope_kind, scope_value) values (?, ?, ?)",
            params: [id, scope.scopeKind, scope.scopeValue ?? null],
          })),
        )
      }
      return ok({ id })
    } catch (error) {
      return fail(error)
    }
  }


  async importEntries(input: ImportEntriesInput): Promise<Result<ImportedBatchResult>> {
    try {
      const batchId = await this.insertOne(
        "insert into import_batches (source_name, imported_at, file_name, file_hash, status, meta) values (?, ?, ?, ?, 'imported', ?)",
        [
          input.sourceName,
          input.importedAt,
          input.fileName ?? null,
          null,
          json({ module: "import" }),
        ],
      )
      let inserted = 0
      let skipped = 0
      for (const entry of this.importService.dedupeImportedEntries(input.entries)) {
        const hash = this.importService.hashImportedEntry(entry)
        const result = await this.executor.executeSingleSql({
          sql: `insert or ignore into imported_entries
            (batch_id, external_id, date, payee, narration, amount_number, currency,
             account_name, hash, status, raw, meta)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
          params: [
            batchId,
            entry.externalId ?? null,
            entry.date,
            entry.payee ?? null,
            entry.narration ?? null,
            entry.amountNumber,
            entry.currency,
            entry.accountName,
            hash,
            json(entry as unknown as Record<string, unknown>),
            json({ module: "import", sourceName: input.sourceName }),
          ],
        })
        if (result.rowsAffected > 0) inserted += 1
        else skipped += 1
      }
      await this.rebuildFinancialEventsCore(batchId)
      return ok({ batchId, inserted, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async importNormalizedStatementEntries(input: ImportNormalizedStatementEntriesInput): Promise<Result<ImportedBatchResult>> {
    try {
      if (input.fileHash != null && input.fileHash.length > 0) {
        const existing = await this.one<{ id: number }>(
          "select id from import_batches where source_name = ? and file_hash = ? order by id desc limit 1",
          [input.sourceName, input.fileHash],
        )
        if (existing != null) {
          await this.rebuildFinancialEventsCore(Number(existing.id))
          return ok({ batchId: Number(existing.id), inserted: 0, skipped: input.entries.length })
        }
      }
      const batchId = await this.insertOne(
        "insert into import_batches (source_name, imported_at, file_name, file_hash, status, meta) values (?, ?, ?, ?, 'imported', ?)",
        [
          input.sourceName,
          input.importedAt,
          input.fileName ?? null,
          input.fileHash ?? null,
          json({ module: "statement-import", summary: input.summary ?? null }),
        ],
      )

      const seen = new Set<string>()
      let inserted = 0
      let skipped = 0
      for (const entry of input.entries) {
        const hash = this.importService.hashImportedEntry({
          sourceName: input.sourceName,
          externalId: entry.externalId,
          date: entry.date,
          payee: entry.counterparty,
          narration: entry.description,
          amountNumber: entry.amountNumber,
          currency: entry.currency,
          accountName: entry.sourceAccountName,
        })
        if (seen.has(hash)) {
          skipped += 1
          continue
        }
        seen.add(hash)
        const status = entry.classification === "closed_or_failed" ? "ignored" : "pending"
        const result = await this.executor.executeSingleSql({
          sql: `insert or ignore into imported_entries
            (batch_id, external_id, merchant_order_id, occurred_at, date, payee, counterparty_account,
             narration, amount_number, currency, account_name, source_sub_account_label, payment_method,
             direction, classification, confidence, hash, status, raw, meta)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            batchId,
            entry.externalId ?? null,
            entry.merchantOrderId ?? null,
            entry.occurredAt,
            entry.date,
            entry.counterparty,
            entry.counterpartyAccount,
            entry.description,
            entry.amountNumber,
            entry.currency,
            entry.sourceAccountName,
            entry.sourceSubAccountLabel,
            entry.paymentMethod,
            entry.direction,
            entry.classification,
            entry.confidence,
            hash,
            status,
            json(entry.raw),
            json({
              module: "statement-import",
              source: entry.source,
              type: entry.type,
              note: entry.note,
            }),
          ],
        })
        if (result.rowsAffected > 0) inserted += 1
        else skipped += 1
      }
      await this.rebuildFinancialEventsCore(batchId)
      return ok({ batchId, inserted, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async listImportedEntries(input: ListImportedEntriesInput = {}): Promise<Result<ImportedEntrySummary[]>> {
    try {
      const where: string[] = []
      const params: SqlParam[] = []
      if (input.sourceName != null) {
        where.push("import_batches.source_name = ?")
        params.push(input.sourceName)
      }
      if (input.status != null) {
        where.push("imported_entries.status = ?")
        params.push(input.status)
      }
      if (input.classification != null) {
        where.push("imported_entries.classification = ?")
        params.push(input.classification)
      }
      params.push(Math.max(1, Math.min(input.limit ?? 200, 1000)))
      const rows = await this.all<ImportedEntryRow>(
        `select imported_entries.*, import_batches.source_name, import_batches.file_name
         from imported_entries
         join import_batches on import_batches.id = imported_entries.batch_id
         ${where.length > 0 ? `where ${where.join(" and ")}` : ""}
         order by imported_entries.date desc, imported_entries.id desc
         limit ?`,
        params,
      )
      return ok(rows.map(rowToImportedEntrySummary))
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSnapshots(input: ListAssetSnapshotsInput = {}): Promise<Result<AssetSnapshotSummary[]>> {
    try {
      const rows = input.latestOnly
        ? await this.latestAssetSnapshotRows(input.accountName)
        : await this.assetSnapshotRows(input.accountName)
      return ok(rows.map(rowToAssetSnapshotSummary))
    } catch (error) {
      return fail(error)
    }
  }

  async upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const snapshotAt = input.snapshotAt ?? new Date().toISOString()
      const valueCurrency = input.valueCurrency ?? DEFAULT_CURRENCY
      // Liabilities are stored as negative values so net worth = SUM(value)
      const rawValue = parseFloat(input.valueNumber) || 0
      const normalizedValue =
        input.assetType === "liability" && rawValue > 0
          ? String(-rawValue)
          : input.valueNumber
      const meta = json({ module: "asset-snapshot", ...(input.meta ?? {}) })
      let id = input.id
      if (id == null) {
        id = await this.insertOne(
          `insert into asset_snapshots
            (account_name, asset_type, snapshot_at, quantity_number, quantity_currency,
             value_number, value_currency, source, note, meta)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.accountName,
            input.assetType,
            snapshotAt,
            input.quantityNumber ?? null,
            input.quantityCurrency ?? null,
            normalizedValue,
            valueCurrency,
            input.source ?? "manual",
            input.note ?? null,
            meta,
          ],
        )
      } else {
        await this.run(
          `update asset_snapshots set
            account_name = ?, asset_type = ?, snapshot_at = ?, quantity_number = ?,
            quantity_currency = ?, value_number = ?, value_currency = ?, source = ?,
            note = ?, meta = ?
           where id = ?`,
          [
            input.accountName,
            input.assetType,
            snapshotAt,
            input.quantityNumber ?? null,
            input.quantityCurrency ?? null,
            normalizedValue,
            valueCurrency,
            input.source ?? "manual",
            input.note ?? null,
            meta,
            id,
          ],
        )
      }
      const row = await this.one<AssetSnapshotSqlRow>("select * from asset_snapshots where id = ?", [id])
      if (row == null) throw new Error(`Asset snapshot ${id} not found`)
      return ok(rowToAssetSnapshotSummary(row))
    } catch (error) {
      return fail(error)
    }
  }

  async removeAssetSnapshot(input: { id: number }): Promise<Result<void>> {
    try {
      await this.run("delete from asset_snapshots where id = ?", [input.id])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async getCurrencySettings(): Promise<Result<CurrencySettingsSummary>> {
    try {
      const row = await this.currencySettingsRow()
      return ok(rowToCurrencySettingsSummary(row))
    } catch (error) {
      return fail(error)
    }
  }

  async updateCurrencySettings(input: UpdateCurrencySettingsInput): Promise<Result<CurrencySettingsSummary>> {
    try {
      const existing = await this.currencySettingsRow()
      const displayCurrency =
        input.displayCurrency === undefined
          ? existing.display_currency
          : assertDisplayCurrency(input.displayCurrency)
      const fxProvider = (input.fxProvider ?? existing.fx_provider).trim() || DEFAULT_FX_PROVIDER
      const fxRequestPolicy =
        (input.fxRequestPolicy ?? existing.fx_request_policy).trim() || DEFAULT_FX_REQUEST_POLICY
      const now = new Date().toISOString()
      await this.run(
        `update currency_settings set
          display_currency = ?,
          fx_provider = ?,
          fx_request_policy = ?,
          updated_at = ?,
          meta = ?
         where id = ?`,
        [
          displayCurrency,
          fxProvider,
          fxRequestPolicy,
          now,
          input.meta === undefined ? existing.meta : json(input.meta),
          CURRENCY_SETTINGS_ID,
        ],
      )
      const row = await this.currencySettingsRow()
      return ok(rowToCurrencySettingsSummary(row))
    } catch (error) {
      return fail(error)
    }
  }

  async listExchangeRates(input: ListExchangeRatesInput = {}): Promise<Result<ExchangeRateSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.fromCurrency != null) {
        conds.push("from_currency = ?")
        params.push(normalizeCurrencyCode(input.fromCurrency))
      }
      if (input.toCurrency != null) {
        conds.push("to_currency = ?")
        params.push(normalizeCurrencyCode(input.toCurrency))
      }
      if (input.provider != null) {
        conds.push("provider = ?")
        params.push(input.provider)
      }
      params.push(Math.max(1, Math.min(input.limit ?? 200, 1000)))
      const rows = await this.all<ExchangeRateSqlRow>(
        `select * from exchange_rates
         ${conds.length > 0 ? `where ${conds.join(" and ")}` : ""}
         order by rate_date desc, from_currency, to_currency
         limit ?`,
        params,
      )
      return ok(rows.map(rowToExchangeRateSummary))
    } catch (error) {
      return fail(error)
    }
  }

  async refreshExchangeRates(input: RefreshExchangeRatesInput = {}): Promise<Result<RefreshExchangeRatesResult>> {
    try {
      return ok(await this.prepareDisplayCurrencyContext({ force: input.force ?? false }))
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetProgress(input: { period?: string } = {}): Promise<Result<BudgetProgressRow[]>> {
    try {
      const period = input.period ?? todayMonth()
      const monthStart = `${period}-01`
      const nextMonthStart = addMonths(monthStart as ISODate, 1)
      const budgetRows = await this.all<SqlRow>(
        `SELECT b.*, GROUP_CONCAT(bs.scope_kind || ':' || COALESCE(bs.scope_value,'*')) as scopes
         FROM budgets b
         LEFT JOIN budget_scopes bs ON bs.budget_id = b.id
         WHERE b.status = 'active' AND (b.period_start IS NULL OR b.period_start <= ?) AND (b.period_end IS NULL OR b.period_end >= ?)
         GROUP BY b.id ORDER BY b.name`,
        [nextMonthStart, monthStart],
      )
      const result: BudgetProgressRow[] = []
      for (const row of budgetRows) {
        const scopes = await this.budgetScopes(Number(row.id))
        const { conditions, params } = this.budgetEventScope(scopeParseFlowKinds(row.include_flow_kinds), scopes)
        const actualRows = await this.all<SqlRow>(
          `SELECT SUM(CAST(fe.amount AS REAL)) as total FROM financial_events fe
           WHERE ${conditions.join(" AND ")} AND fe.date >= ? AND fe.date < ? AND fe.currency = ?`,
          [...params, monthStart, nextMonthStart, (row.currency ?? DEFAULT_CURRENCY) as string],
        )
        const actual = Math.abs(Number(actualRows[0]?.total ?? 0)).toFixed(2)
        const budgeted = row.amount as string
        const remaining = (Number(budgeted) - Number(actual)).toFixed(2)
        result.push({
          budgetId: row.id as number,
          name: row.name as string,
          period,
          accountName: null,
          tag: null,
          budgeted,
          actual,
          remaining,
        })
      }
      return ok(result)
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardViews(): Promise<Result<DashboardView[]>> {
    try {
      const rows = await this.dashboardViewRows()
      return ok(rows.map(rowToDashboardView))
    } catch (error) {
      return fail(error)
    }
  }

  async createDashboardView(input: CreateDashboardViewInput): Promise<Result<DashboardView>> {
    try {
      const name = input.name.trim()
      if (name.length === 0) throw new Error("Dashboard view name cannot be empty")
      await this.assertDashboardViewNameAvailable(name)
      const id = generateDashboardViewId()
      const slug = await this.uniqueDashboardViewSlug(slugBase(name))
      const position = await this.nextDashboardViewPosition()
      const now = new Date().toISOString()
      await this.run(
        `insert into dashboard_views (id, name, slug, position, is_default, created_at, updated_at, meta)
         values (?, ?, ?, ?, 0, ?, ?, ?)`,
        [id, name, slug, position, now, now, json({ module: "dashboard-view" })],
      )
      const row = await this.one<DashboardViewSqlRow>("select * from dashboard_views where id = ?", [id])
      if (row == null) throw new Error(`Dashboard view ${id} was not written`)
      return ok(rowToDashboardView(row))
    } catch (error) {
      return fail(error)
    }
  }

  async updateDashboardView(input: UpdateDashboardViewInput): Promise<Result<DashboardView>> {
    try {
      const existing = await this.one<DashboardViewSqlRow>("select * from dashboard_views where id = ?", [input.id])
      if (existing == null) throw new Error(`Dashboard view ${input.id} not found`)
      const sets: string[] = []
      const params: SqlParam[] = []
      if (input.name !== undefined) {
        const name = input.name.trim()
        if (name.length === 0) throw new Error("Dashboard view name cannot be empty")
        await this.assertDashboardViewNameAvailable(name, input.id)
        sets.push("name = ?")
        params.push(name)
        if (existing.is_default !== 1) {
          sets.push("slug = ?")
          params.push(await this.uniqueDashboardViewSlug(slugBase(name), input.id))
        }
      }
      if (input.position !== undefined) {
        sets.push("position = ?")
        params.push(input.position)
      }
      if (sets.length > 0) {
        sets.push("updated_at = ?")
        params.push(new Date().toISOString())
        params.push(input.id)
        await this.run(`update dashboard_views set ${sets.join(", ")} where id = ?`, params)
      }
      const row = await this.one<DashboardViewSqlRow>("select * from dashboard_views where id = ?", [input.id])
      if (row == null) throw new Error(`Dashboard view ${input.id} not found`)
      return ok(rowToDashboardView(row))
    } catch (error) {
      return fail(error)
    }
  }

  async removeDashboardView(input: { id: string }): Promise<Result<void>> {
    try {
      const count = await this.one<{ count: number }>("select count(*) as count from dashboard_views")
      if (Number(count?.count ?? 0) <= 1) throw new Error("Cannot delete the last dashboard view")
      const view = await this.one<DashboardViewSqlRow>("select * from dashboard_views where id = ?", [input.id])
      if (view == null) throw new Error(`Dashboard view ${input.id} not found`)
      await this.executor.executeBatchSql([
        {
          sql: "delete from dashboard_layouts where card_id in (select id from dashboard_cards where view_id = ?)",
          params: [input.id],
        },
        {
          sql: "delete from dashboard_cards where view_id = ?",
          params: [input.id],
        },
        {
          sql: "delete from dashboard_views where id = ?",
          params: [input.id],
        },
      ])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async saveDashboardViewOrder(input: { ids: string[] }): Promise<Result<DashboardView[]>> {
    try {
      const existing = await this.dashboardViewRows()
      const existingIds = new Set(existing.map((row) => row.id))
      if (input.ids.length !== existing.length || input.ids.some((id) => !existingIds.has(id))) {
        throw new Error("Dashboard view order must include every view exactly once")
      }
      const seen = new Set<string>()
      for (const id of input.ids) {
        if (seen.has(id)) throw new Error("Dashboard view order contains duplicates")
        seen.add(id)
      }
      await this.executor.executeBatchSql(
        input.ids.map((id, index) => ({
          sql: "update dashboard_views set position = ?, updated_at = ? where id = ?",
          params: [index, new Date().toISOString(), id],
        })),
      )
      const rows = await this.dashboardViewRows()
      return ok(rows.map(rowToDashboardView))
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardCards(input: ListDashboardCardsInput = {}): Promise<Result<DashboardCard[]>> {
    try {
      const viewId = input.viewId ?? DEFAULT_DASHBOARD_VIEW_ID
      const rows = (await this.all(
        `select id, view_id, type, title, code, config_json, position, hidden, created_at, updated_at
         from dashboard_cards
         where hidden = 0 and view_id = ?
         order by position, created_at, id`,
        [viewId],
      )) as DashboardCardSqlRow[]
      return ok(rows.map(rowToDashboardCard))
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardLayouts(input: ListDashboardLayoutsInput = {}): Promise<Result<DashboardLayoutEntry[]>> {
    try {
      const viewId = input.viewId ?? DEFAULT_DASHBOARD_VIEW_ID
      const rows = (await this.all(
        `select dashboard_layouts.card_id, dashboard_layouts.breakpoint, dashboard_layouts.x,
                dashboard_layouts.y, dashboard_layouts.w, dashboard_layouts.h
         from dashboard_layouts
         join dashboard_cards on dashboard_cards.id = dashboard_layouts.card_id
         where dashboard_cards.view_id = ?`,
        [viewId],
      )) as DashboardLayoutSqlRow[]
      return ok(rows.map(rowToDashboardLayout))
    } catch (error) {
      return fail(error)
    }
  }

  async addDashboardCard(input: AddDashboardCardInput): Promise<Result<DashboardCard>> {
    try {
      const id = input.id ?? generateCardId()
      const now = new Date().toISOString()
      const viewId = input.viewId ?? DEFAULT_DASHBOARD_VIEW_ID
      await this.assertDashboardViewExists(viewId)
      const position = await this.nextDashboardPosition(viewId)
      await this.run(
        `insert into dashboard_cards (id, view_id, type, title, code, config_json, position, hidden, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          id,
          viewId,
          input.type,
          input.title ?? null,
          input.code ?? null,
          JSON.stringify(input.config ?? {}),
          position,
          now,
          now,
        ],
      )
      if (input.layouts.length > 0) {
        await this.executor.executeBatchSql(
          input.layouts.map((entry) => ({
            sql: `insert into dashboard_layouts (card_id, breakpoint, x, y, w, h) values (?, ?, ?, ?, ?, ?)`,
            params: [id, entry.breakpoint, entry.x, entry.y, entry.w, entry.h],
          })),
        )
      }
      const row = (await this.one<DashboardCardSqlRow>(
        `select id, view_id, type, title, code, config_json, position, hidden, created_at, updated_at
         from dashboard_cards where id = ?`,
        [id],
      )) as DashboardCardSqlRow | null
      if (row == null) throw new Error(`Dashboard card ${id} was not written`)
      return ok(rowToDashboardCard(row))
    } catch (error) {
      return fail(error)
    }
  }

  async updateDashboardCard(input: UpdateDashboardCardInput): Promise<Result<DashboardCard>> {
    try {
      const sets: string[] = []
      const params: SqlParam[] = []
      if (input.title !== undefined) {
        sets.push("title = ?")
        params.push(input.title)
      }
      if (input.code !== undefined) {
        sets.push("code = ?")
        params.push(input.code)
      }
      if (input.config !== undefined) {
        sets.push("config_json = ?")
        params.push(JSON.stringify(input.config))
      }
      if (input.hidden !== undefined) {
        sets.push("hidden = ?")
        params.push(input.hidden ? 1 : 0)
      }
      if (input.position !== undefined) {
        sets.push("position = ?")
        params.push(input.position)
      }
      sets.push("updated_at = ?")
      params.push(new Date().toISOString())
      params.push(input.id)
      await this.run(
        `update dashboard_cards set ${sets.join(", ")} where id = ?`,
        params,
      )
      const row = (await this.one<DashboardCardSqlRow>(
        `select id, view_id, type, title, code, config_json, position, hidden, created_at, updated_at
         from dashboard_cards where id = ?`,
        [input.id],
      )) as DashboardCardSqlRow | null
      if (row == null) throw new Error(`Dashboard card ${input.id} not found`)
      return ok(rowToDashboardCard(row))
    } catch (error) {
      return fail(error)
    }
  }

  async removeDashboardCard(input: { id: string }): Promise<Result<void>> {
    try {
      await this.executor.executeBatchSql([
        {
          sql: "delete from dashboard_layouts where card_id = ?",
          params: [input.id],
        },
        {
          sql: "delete from dashboard_cards where id = ?",
          params: [input.id],
        },
      ])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async saveDashboardLayouts(input: SaveDashboardLayoutsInput): Promise<Result<void>> {
    try {
      if (input.rows.length === 0) return ok(undefined)
      const viewId = input.viewId ?? DEFAULT_DASHBOARD_VIEW_ID
      const cardIds = [...new Set(input.rows.map((entry) => entry.cardId))]
      const placeholders = cardIds.map(() => "?").join(", ")
      const rows = await this.all<{ id: string }>(
        `select id from dashboard_cards where view_id = ? and id in (${placeholders})`,
        [viewId, ...cardIds],
      )
      if (rows.length !== cardIds.length) {
        throw new Error("Dashboard layout rows must belong to the target view")
      }
      await this.executor.executeBatchSql(
        input.rows.map((entry) => ({
          sql: `insert into dashboard_layouts (card_id, breakpoint, x, y, w, h)
                values (?, ?, ?, ?, ?, ?)
                on conflict(card_id, breakpoint) do update set
                  x = excluded.x,
                  y = excluded.y,
                  w = excluded.w,
                  h = excluded.h`,
          params: [entry.cardId, entry.breakpoint, entry.x, entry.y, entry.w, entry.h],
        })),
      )
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async resetDashboardLayout(): Promise<Result<void>> {
    try {
      await this.run("delete from dashboard_layouts", [])
      await this.run("delete from dashboard_cards", [])
      await this.seedDefaultDashboardIfEmpty()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  private async seedDefaultDashboardIfEmpty() {
    const now = new Date().toISOString()
    for (const [position, view] of DEFAULT_DASHBOARD_VIEWS.entries()) {
      await this.run(
        `insert into dashboard_views (id, name, slug, position, is_default, created_at, updated_at, meta)
         values (?, ?, ?, ?, 1, ?, ?, ?)
         on conflict(id) do update set
           name = excluded.name,
           slug = excluded.slug,
           is_default = 1,
           updated_at = excluded.updated_at`,
        [view.id, view.name, view.slug, position, now, now, json({ module: "dashboard-seed" })],
      )
    }

    for (const view of DEFAULT_DASHBOARD_VIEWS) {
      const defaults = buildDefaultDashboardSeed(now, {
        viewId: view.id,
        sourceName: view.sourceName,
      })
      const currentSeed = await this.one<{ count: number }>(
        `select count(*) as count from dashboard_cards
         where view_id = ? and id like ? and json_extract(config_json, '$.seedVersion') >= ?`,
        [view.id, `seed-${view.id}-%`, SEED_CARD_VERSION],
      )
      const currentSeedLayouts = await this.one<{ count: number }>(
        `select count(*) as count from dashboard_layouts
         where card_id in (
           select id from dashboard_cards
           where view_id = ? and id like ? and json_extract(config_json, '$.seedVersion') >= ?
         )`,
        [view.id, `seed-${view.id}-%`, SEED_CARD_VERSION],
      )
      if (
        Number(currentSeed?.count ?? 0) >= defaults.cards.length &&
        Number(currentSeedLayouts?.count ?? 0) >= defaults.layouts.length
      ) {
        continue
      }

      await this.executor.executeBatchSql(
        [
          {
            sql: "delete from dashboard_layouts where card_id in (select id from dashboard_cards where view_id = ? and id like 'seed-%')",
            params: [view.id],
          },
          {
            sql: "delete from dashboard_cards where view_id = ? and id like 'seed-%'",
            params: [view.id],
          },
        ],
      )

      await this.executor.executeBatchSql(
        defaults.cards.map((card) => ({
          sql: `insert into dashboard_cards (id, view_id, type, title, code, config_json, position, hidden, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          params: [
            card.id,
            view.id,
            card.type,
            card.title ?? null,
            card.code ?? null,
            JSON.stringify({
              ...(card.config ?? {}),
              seedVersion: SEED_CARD_VERSION,
              seedViewId: view.id,
            }),
            card.position,
            now,
            now,
          ],
        })),
      )
      if (defaults.layouts.length > 0) {
        await this.executor.executeBatchSql(
          defaults.layouts.map((entry) => ({
            sql: `insert into dashboard_layouts (card_id, breakpoint, x, y, w, h) values (?, ?, ?, ?, ?, ?)`,
            params: [entry.cardId, entry.breakpoint, entry.x, entry.y, entry.w, entry.h],
          })),
        )
      }
    }
  }

  private async nextDashboardPosition(viewId: string): Promise<number> {
    const row = (await this.one<{ next_position: number }>(
      "select coalesce(max(position), -1) + 1 as next_position from dashboard_cards where view_id = ?",
      [viewId],
    )) as { next_position: number } | null
    return Number(row?.next_position ?? 0)
  }

  private async nextDashboardViewPosition(): Promise<number> {
    const row = (await this.one<{ next_position: number }>(
      "select coalesce(max(position), -1) + 1 as next_position from dashboard_views",
    )) as { next_position: number } | null
    return Number(row?.next_position ?? 0)
  }

  private async dashboardViewRows(): Promise<DashboardViewSqlRow[]> {
    return this.all<DashboardViewSqlRow>(
      "select id, name, slug, position, is_default, created_at, updated_at from dashboard_views order by position, created_at, id",
    )
  }

  private async assertDashboardViewExists(id: string): Promise<void> {
    const row = await this.one<{ id: string }>("select id from dashboard_views where id = ?", [id])
    if (row == null) throw new Error(`Dashboard view ${id} not found`)
  }

  private async assertDashboardViewNameAvailable(name: string, exceptId?: string): Promise<void> {
    const row = exceptId == null
      ? await this.one<{ id: string }>("select id from dashboard_views where name = ? limit 1", [name])
      : await this.one<{ id: string }>("select id from dashboard_views where name = ? and id != ? limit 1", [name, exceptId])
    if (row != null) throw new Error(`Dashboard view ${name} already exists`)
  }

  private async uniqueDashboardViewSlug(base: string, exceptId?: string): Promise<string> {
    let candidate = base
    let suffix = 2
    while (true) {
      const row = exceptId == null
        ? await this.one<{ id: string }>("select id from dashboard_views where slug = ? limit 1", [candidate])
        : await this.one<{ id: string }>("select id from dashboard_views where slug = ? and id != ? limit 1", [candidate, exceptId])
      if (row == null) return candidate
      candidate = `${base}-${suffix}`
      suffix += 1
    }
  }

  private async latestAssetSnapshotRows(accountName?: string): Promise<AssetSnapshotSqlRow[]> {
    const where = accountName ? "AND s.account_name = ?" : ""
    const params: SqlParam[] = accountName ? [accountName] : []
    return this.all<AssetSnapshotSqlRow>(
      `SELECT s.* FROM asset_snapshots s
       WHERE s.id = (
         SELECT s2.id
         FROM asset_snapshots s2
         WHERE s2.account_name = s.account_name
         ORDER BY s2.snapshot_at DESC, s2.id DESC
         LIMIT 1
       )
       ${where}
       ORDER BY s.account_name`,
      params,
    )
  }

  private async assetSnapshotRows(accountName?: string): Promise<AssetSnapshotSqlRow[]> {
    const where = accountName ? "WHERE account_name = ?" : ""
    const params: SqlParam[] = accountName ? [accountName] : []
    return this.all<AssetSnapshotSqlRow>(
      `SELECT * FROM asset_snapshots ${where} ORDER BY snapshot_at DESC, id DESC`,
      params,
    )
  }

  private async seedCurrencySettingsIfEmpty(): Promise<void> {
    const now = new Date().toISOString()
    await this.run(
      `insert into currency_settings
        (id, display_currency, fx_provider, fx_request_policy, updated_at, meta)
       values (?, ?, ?, ?, ?, ?)
       on conflict(id) do nothing`,
      [
        CURRENCY_SETTINGS_ID,
        DEFAULT_CURRENCY,
        DEFAULT_FX_PROVIDER,
        DEFAULT_FX_REQUEST_POLICY,
        now,
        json({ module: "currency-settings" }),
      ],
    )
  }

  private async currencySettingsRow(): Promise<CurrencySettingsSqlRow> {
    await this.seedCurrencySettingsIfEmpty()
    const row = await this.one<CurrencySettingsSqlRow>(
      "select * from currency_settings where id = ?",
      [CURRENCY_SETTINGS_ID],
    )
    if (row == null) throw new Error("Currency settings not found")
    return {
      ...row,
      display_currency: assertDisplayCurrency(row.display_currency),
      fx_provider: row.fx_provider || DEFAULT_FX_PROVIDER,
      fx_request_policy: row.fx_request_policy || DEFAULT_FX_REQUEST_POLICY,
    }
  }

  private async prepareDisplayCurrencyContext(
    input: { force?: boolean } = {},
  ): Promise<RefreshExchangeRatesResult> {
    const settings = await this.currencySettingsRow()
    const displayCurrency = assertDisplayCurrency(settings.display_currency)
    const provider = settings.fx_provider || this.fxProvider.id
    const requirements = await this.collectFxRequirements(displayCurrency)
    let requested = 0
    let fetched = 0
    let skipped = 0
    let failed = 0
    const unsupported = 0

    for (const requirement of requirements) {
      requested += 1
      if (!input.force) {
        const cached = await this.one<ExchangeRateSqlRow>(
          `select * from exchange_rates
           where from_currency = ? and to_currency = ? and rate_date = ? and provider = ?
           limit 1`,
          [requirement.fromCurrency, requirement.toCurrency, requirement.rateDate, provider],
        )
        if (cached != null) {
          skipped += 1
          continue
        }
      }

      try {
        const result = await this.fxProvider.fetchRate({
          fromCurrency: requirement.fromCurrency,
          toCurrency: requirement.toCurrency,
          date: requirement.rateDate,
        })
        if (result == null) {
          failed += 1
          continue
        }
        await this.upsertExchangeRate({
          ...result,
          fromCurrency: requirement.fromCurrency,
          toCurrency: requirement.toCurrency,
          rateDate: requirement.rateDate,
          provider,
        })
        fetched += 1
      } catch {
        failed += 1
      }
    }

    return { requested, fetched, skipped, failed, unsupported }
  }

  private async collectFxRequirements(displayCurrency: string): Promise<FxRequirement[]> {
    const rows = await this.all<{ from_currency: string | null; rate_date: string | null }>(
      `select upper(currency) as from_currency, date as rate_date
         from financial_events
        where currency is not null and upper(currency) != ?
       union
       select upper(value_currency) as from_currency, date(snapshot_at) as rate_date
         from asset_snapshots
        where value_currency is not null and upper(value_currency) != ?
       union
       select upper(currency) as from_currency, date('now') as rate_date
         from plans
        where currency is not null and upper(currency) != ?`,
      [displayCurrency, displayCurrency, displayCurrency],
    )
    const seen = new Set<string>()
    const requirements: FxRequirement[] = []
    for (const row of rows) {
      const fromCurrency = row.from_currency == null ? "" : normalizeCurrencyCode(row.from_currency)
      const rateDate = row.rate_date
      if (!isCurrencyCode(fromCurrency) || rateDate == null || rateDate.length === 0) continue
      const key = `${fromCurrency}:${displayCurrency}:${rateDate}`
      if (seen.has(key)) continue
      seen.add(key)
      requirements.push({
        fromCurrency,
        toCurrency: displayCurrency,
        rateDate,
      })
    }
    return requirements
  }

  private async upsertExchangeRate(input: FxRateFetchResult): Promise<void> {
    const now = new Date().toISOString()
    await this.run(
      `insert into exchange_rates
        (from_currency, to_currency, rate_date, rate, provider, fetched_at, source_date, meta)
       values (?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(from_currency, to_currency, rate_date, provider) do update set
         rate = excluded.rate,
         fetched_at = excluded.fetched_at,
         source_date = excluded.source_date,
         meta = excluded.meta`,
      [
        normalizeCurrencyCode(input.fromCurrency),
        normalizeCurrencyCode(input.toCurrency),
        input.rateDate,
        input.rate,
        input.provider,
        now,
        input.sourceDate ?? input.rateDate,
        json(input.meta ?? { module: "exchange-rate" }),
      ],
    )
  }

  private async seedDefaultCategoriesIfEmpty(): Promise<void> {
    const count = await this.one<{ count: number }>("SELECT COUNT(*) as count FROM categories")
    if (Number(count?.count ?? 0) > 0) return
    const now = new Date().toISOString()
    for (const cat of DEFAULT_CATEGORIES) {
      await this.run(
        `INSERT OR IGNORE INTO categories (name, kind, color, icon, sort_order, archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [cat.name, cat.kind, cat.color, cat.icon, cat.sortOrder, now, now],
      )
    }
  }

  // ── No-Ledger API: Financial Events ────────────────────────────────────────

  async listFinancialEvents(input?: ListFinancialEventsInput): Promise<Result<FinancialEventSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input?.dateFrom) { conds.push("fe.date >= ?"); params.push(input.dateFrom) }
      if (input?.dateTo) { conds.push("fe.date <= ?"); params.push(input.dateTo) }
      if (input?.flowKind) { conds.push("fe.flow_kind = ?"); params.push(input.flowKind) }
      if (input?.categoryId) { conds.push("fe.category_id = ?"); params.push(input.categoryId) }
      if (input?.source) { conds.push("fe.source = ?"); params.push(input.source) }
      const where = conds.length ? "WHERE " + conds.join(" AND ") : ""
      const limit = input?.limit ?? 200
      const offset = input?.offset ?? 0
      params.push(limit, offset)
      const rows = await this.all<SqlRow>(
        `SELECT fe.*, c.name as category_name FROM financial_events fe
         LEFT JOIN categories c ON fe.category_id = c.id
         ${where} ORDER BY fe.date DESC, fe.id DESC LIMIT ? OFFSET ?`,
        params,
      )
      return ok(rows.map((r) => ({
        id: r.id as number,
        source: r.source as string | undefined,
        sourceEntryId: r.source_entry_id as number | undefined,
        occurredAt: r.occurred_at as string | undefined,
        date: r.date as string,
        counterparty: r.counterparty as string | undefined,
        description: r.description as string | undefined,
        flowKind: r.flow_kind as string,
        categoryId: r.category_id as number | undefined,
        categoryName: r.category_name as string | undefined,
        amount: r.amount as string,
        currency: r.currency as string,
        direction: r.direction as string | undefined,
        confidence: r.confidence as number | undefined,
        classificationSource: r.classification_source as string,
        explanationTags: r.explanation_tags ? JSON.parse(r.explanation_tags as string) : undefined,
        createdAt: r.created_at as string,
      })))
    } catch (e) { return fail(e) }
  }

  async createFinancialEvent(input: CreateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    try {
      const now = new Date().toISOString()
      const id = await this.insertOne(
        `INSERT INTO financial_events
         (date, occurred_at, counterparty, description, flow_kind, category_id, amount, currency,
          direction, account_hint, explanation_tags, classification_source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)`,
        [input.date, input.occurredAt ?? null, input.counterparty ?? null, input.description ?? null,
         input.flowKind, input.categoryId ?? null, input.amount, input.currency ?? "CNY",
         normalizeDirection(input.direction) ?? input.direction ?? null, input.accountHint ?? null,
         input.explanationTags ? JSON.stringify(input.explanationTags) : null, now, now],
      )
      const rows = await this.all<SqlRow>(
        `SELECT fe.*, c.name as category_name FROM financial_events fe LEFT JOIN categories c ON fe.category_id = c.id WHERE fe.id = ?`,
        [id],
      )
      return ok(this.mapFinancialEventRow(rows[0]))
    } catch (e) { return fail(e) }
  }

  async updateFinancialEvent(input: UpdateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    try {
      const now = new Date().toISOString()
      const sets: string[] = ["updated_at = ?", "classification_source = 'manual'"]
      const params: SqlParam[] = [now]
      if (input.flowKind !== undefined) { sets.push("flow_kind = ?"); params.push(input.flowKind) }
      if (input.categoryId !== undefined) { sets.push("category_id = ?"); params.push(input.categoryId) }
      if (input.description !== undefined) { sets.push("description = ?"); params.push(input.description) }
      if (input.explanationTags !== undefined) { sets.push("explanation_tags = ?"); params.push(JSON.stringify(input.explanationTags)) }
      params.push(input.id)
      await this.run(`UPDATE financial_events SET ${sets.join(", ")} WHERE id = ?`, params)
      const rows = await this.all<SqlRow>(
        `SELECT fe.*, c.name as category_name FROM financial_events fe LEFT JOIN categories c ON fe.category_id = c.id WHERE fe.id = ?`,
        [input.id],
      )
      return ok(this.mapFinancialEventRow(rows[0]))
    } catch (e) { return fail(e) }
  }

  async removeFinancialEvent(input: { id: number }): Promise<Result<void>> {
    try {
      await this.run(`DELETE FROM financial_events WHERE id = ?`, [input.id])
      return ok(undefined)
    } catch (e) { return fail(e) }
  }

  async rebuildFinancialEventsFromImports(input?: { batchId?: number }): Promise<Result<{ created: number; skipped: number }>> {
    try {
      return ok(await this.rebuildFinancialEventsCore(input?.batchId))
    } catch (e) { return fail(e) }
  }

  private mapFinancialEventRow(r: SqlRow): FinancialEventSummary {
    return {
      id: r.id as number,
      source: r.source as string | undefined,
      sourceEntryId: r.source_entry_id as number | undefined,
      occurredAt: r.occurred_at as string | undefined,
      date: r.date as string,
      counterparty: r.counterparty as string | undefined,
      description: r.description as string | undefined,
      flowKind: r.flow_kind as string,
      categoryId: r.category_id as number | undefined,
      categoryName: r.category_name as string | undefined,
      amount: r.amount as string,
      currency: r.currency as string,
      direction: r.direction as string | undefined,
      confidence: r.confidence as number | undefined,
      classificationSource: r.classification_source as string,
      explanationTags: r.explanation_tags ? JSON.parse(r.explanation_tags as string) : undefined,
      createdAt: r.created_at as string,
    }
  }

  // ── No-Ledger API: Categories ───────────────────────────────────────────────

  async listCategories(): Promise<Result<CategorySummary[]>> {
    try {
      const rows = await this.all<SqlRow>(`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`, [])
      return ok(rows.map(this.mapCategoryRow))
    } catch (e) { return fail(e) }
  }

  async createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const now = new Date().toISOString()
      const id = await this.insertOne(
        `INSERT INTO categories (name, parent_id, kind, color, icon, sort_order, archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [input.name, input.parentId ?? null, input.kind, input.color ?? null, input.icon ?? null, input.sortOrder ?? 0, now, now],
      )
      const row = await this.one<SqlRow>(`SELECT * FROM categories WHERE id = ?`, [id])
      return ok(this.mapCategoryRow(row!))
    } catch (e) { return fail(e) }
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const now = new Date().toISOString()
      const sets: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [now]
      if (input.name !== undefined) { sets.push("name = ?"); params.push(input.name) }
      if (input.parentId !== undefined) { sets.push("parent_id = ?"); params.push(input.parentId) }
      if (input.kind !== undefined) { sets.push("kind = ?"); params.push(input.kind) }
      if (input.color !== undefined) { sets.push("color = ?"); params.push(input.color) }
      if (input.icon !== undefined) { sets.push("icon = ?"); params.push(input.icon) }
      if (input.sortOrder !== undefined) { sets.push("sort_order = ?"); params.push(input.sortOrder) }
      params.push(input.id)
      await this.run(`UPDATE categories SET ${sets.join(", ")} WHERE id = ?`, params)
      const row = await this.one<SqlRow>(`SELECT * FROM categories WHERE id = ?`, [input.id])
      return ok(this.mapCategoryRow(row!))
    } catch (e) { return fail(e) }
  }

  async archiveCategory(input: { id: number }): Promise<Result<void>> {
    try {
      const now = new Date().toISOString()
      await this.run(`UPDATE categories SET archived = 1, updated_at = ? WHERE id = ?`, [now, input.id])
      return ok(undefined)
    } catch (e) { return fail(e) }
  }

  private mapCategoryRow(r: SqlRow): CategorySummary {
    return {
      id: r.id as number,
      name: r.name as string,
      parentId: r.parent_id as number | undefined,
      kind: r.kind as string,
      color: r.color as string | undefined,
      icon: r.icon as string | undefined,
      sortOrder: r.sort_order as number,
      archived: Boolean(r.archived),
    }
  }

  // ── No-Ledger API: Plans ────────────────────────────────────────────────────

  async listPlans(input?: ListPlansInput): Promise<Result<PlanSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input?.planType) { conds.push("plan_type = ?"); params.push(input.planType) }
      if (input?.status) { conds.push("status = ?"); params.push(input.status) }
      const where = conds.length ? "WHERE " + conds.join(" AND ") : ""
      const rows = await this.all<SqlRow>(`SELECT * FROM plans ${where} ORDER BY next_due_date ASC, name ASC`, params)
      return ok(rows.map(this.mapPlanRow))
    } catch (e) { return fail(e) }
  }

  async createPlan(input: CreatePlanInput): Promise<Result<PlanSummary>> {
    try {
      const now = new Date().toISOString()
      const id = await this.insertOne(
        `INSERT INTO plans (plan_type, name, counterparty, amount, currency, schedule_rule, start_date, end_date,
         next_due_date, status, category_id, flow_kind, account_hint, meta, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [input.planType, input.name, input.counterparty ?? null, input.amount,
         input.currency ?? "CNY", input.scheduleRule, input.startDate, input.endDate ?? null,
         input.startDate, input.status ?? "active", input.categoryId ?? null, input.flowKind ?? null, input.accountHint ?? null,
         input.meta ? JSON.stringify(input.meta) : null, now, now],
      )
      const row = await this.one<SqlRow>(`SELECT * FROM plans WHERE id = ?`, [id])
      return ok(this.mapPlanRow(row!))
    } catch (e) { return fail(e) }
  }

  async updatePlan(input: UpdatePlanInput): Promise<Result<PlanSummary>> {
    try {
      const now = new Date().toISOString()
      const sets: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [now]
      if (input.name !== undefined) { sets.push("name = ?"); params.push(input.name) }
      if (input.counterparty !== undefined) { sets.push("counterparty = ?"); params.push(input.counterparty) }
      if (input.amount !== undefined) { sets.push("amount = ?"); params.push(input.amount) }
      if (input.currency !== undefined) { sets.push("currency = ?"); params.push(input.currency) }
      if (input.scheduleRule !== undefined) { sets.push("schedule_rule = ?"); params.push(input.scheduleRule) }
      if (input.startDate !== undefined) {
        sets.push("start_date = ?")
        params.push(input.startDate)
        sets.push("next_due_date = ?")
        params.push(input.startDate)
      }
      if (input.endDate !== undefined) { sets.push("end_date = ?"); params.push(input.endDate) }
      if (input.status !== undefined) { sets.push("status = ?"); params.push(input.status) }
      if (input.categoryId !== undefined) { sets.push("category_id = ?"); params.push(input.categoryId) }
      if (input.flowKind !== undefined) { sets.push("flow_kind = ?"); params.push(input.flowKind) }
      if (input.accountHint !== undefined) { sets.push("account_hint = ?"); params.push(input.accountHint) }
      if (input.meta !== undefined) { sets.push("meta = ?"); params.push(input.meta == null ? null : JSON.stringify(input.meta)) }
      params.push(input.id)
      await this.run(`UPDATE plans SET ${sets.join(", ")} WHERE id = ?`, params)
      const row = await this.one<SqlRow>(`SELECT * FROM plans WHERE id = ?`, [input.id])
      if (row == null) throw new Error(`Plan ${input.id} not found`)
      return ok(this.mapPlanRow(row!))
    } catch (e) { return fail(e) }
  }

  async generatePlanOccurrences(input: { planId?: number; throughDate: string }): Promise<Result<{ generated: number }>> {
    try {
      const conds = input.planId ? "WHERE id = ? AND status = 'active'" : "WHERE status = 'active'"
      const params: SqlParam[] = input.planId ? [input.planId] : []
      const plans = await this.all<SqlRow>(`SELECT * FROM plans ${conds}`, params)
      let generated = 0
      const now = new Date().toISOString()
      for (const plan of plans) {
        const dates = occurrenceDatesFromPlan(
          plan.schedule_rule as string,
          plan.start_date as string,
          plan.end_date as string | null,
          input.throughDate,
        )
        for (const dueDate of dates) {
          const exists = await this.one<SqlRow>(
            `SELECT id FROM plan_occurrences WHERE plan_id = ? AND due_date = ?`,
            [plan.id, dueDate],
          )
          if (exists) continue
          await this.run(
            `INSERT INTO plan_occurrences (plan_id, due_date, amount, currency, flow_kind, category_id, status, generated_at)
             VALUES (?, ?, ?, ?, ?, ?, 'forecast', ?)`,
            [plan.id, dueDate, plan.amount, plan.currency, plan.flow_kind ?? null, plan.category_id ?? null, now],
          )
          generated++
        }
      }
      return ok({ generated })
    } catch (e) { return fail(e) }
  }

  private mapPlanRow(r: SqlRow): PlanSummary {
    return {
      id: r.id as number,
      planType: r.plan_type as string,
      name: r.name as string,
      counterparty: r.counterparty as string | undefined,
      amount: r.amount as string,
      currency: r.currency as string,
      scheduleRule: r.schedule_rule as string,
      startDate: r.start_date as string,
      endDate: r.end_date as string | undefined,
      nextDueDate: r.next_due_date as string | undefined,
      status: r.status as string,
      categoryId: r.category_id as number | undefined,
      flowKind: r.flow_kind as string | undefined,
      accountHint: r.account_hint as string | undefined,
      meta: parseJsonObject(r.meta as string | null),
    }
  }

  // ── No-Ledger API: Flow Query ───────────────────────────────────────────────

  async runFlowQuery(input: RunFlowQueryInput): Promise<Result<FlowQueryResult>> {
    try {
      // Raw SQL mode: execute the SQL directly against the No-Ledger schema
      if (input.sql && input.sql.trim().length > 0) {
        if (displayQueryNeedsFx(input.sql)) {
          await this.prepareDisplayCurrencyContext()
        }
        const rows = await this.all<SqlRow>(input.sql)
        const columns = rows.length > 0 ? Object.keys(rows[0]) : []
        const total = rows.length > 0 && "total" in rows[0]
          ? String(rows[rows.length - 1].total)
          : undefined
        return ok({ rows: rows as Record<string, unknown>[], columns, total })
      }
      // Structured mode: build SQL from input fields
      const tableMap: Record<string, string> = {
        financial_events: "financial_events",
        financial_events_display: "financial_events_display",
        asset_snapshots: "asset_snapshots",
        asset_snapshots_display: "asset_snapshots_display",
        latest_assets_display: "latest_assets_display",
        plans: "plans",
        plans_display: "plans_display",
        plan_occurrences: "plan_occurrences",
        budgets: "budgets",
      }
      const table = input.from ? tableMap[input.from] : "financial_events"
      if (!table) return fail(new Error("Unknown query source: " + input.from))
      if (displayQueryNeedsFx(table)) {
        await this.prepareDisplayCurrencyContext()
      }
      const conds: string[] = []
      const params: SqlParam[] = []
      const dateField =
        input.from === "plan_occurrences"
          ? "due_date"
          : input.from === "asset_snapshots" ||
              input.from === "asset_snapshots_display" ||
              input.from === "latest_assets_display"
            ? "snapshot_at"
            : input.from === "plans" || input.from === "plans_display"
              ? "next_due_date"
              : "date"
      if (input.dateFrom) { conds.push(`${dateField} >= ?`); params.push(input.dateFrom) }
      if (input.dateTo) { conds.push(`${dateField} <= ?`); params.push(input.dateTo) }
      if (input.flowKind?.length) {
        conds.push(`flow_kind IN (${input.flowKind.map(() => "?").join(",")})`)
        params.push(...input.flowKind)
      }
      if (input.categoryId) { conds.push("category_id = ?"); params.push(input.categoryId) }
      const where = conds.length ? "WHERE " + conds.join(" AND ") : ""
      const groupBy = input.groupBy ? `GROUP BY ${input.groupBy}` : ""
      const amtField = input.amountField ?? (
        input.from === "asset_snapshots" || input.from === "asset_snapshots_display" || input.from === "latest_assets_display"
          ? table.endsWith("_display")
            ? "value_display"
            : "value_number"
          : input.from === "plans_display"
            ? "monthly_amount_display"
            : input.from === "financial_events_display"
              ? "amount_display"
              : "amount"
      )
      const agg = input.aggregation === "count" ? "COUNT(*) as total"
        : input.aggregation === "avg" ? `AVG(CAST(${amtField} AS REAL)) as total`
        : `SUM(CAST(${amtField} AS REAL)) as total`
      const selectCols = input.groupBy ? `${input.groupBy}, ${agg}` : `*`
      const sql = `SELECT ${selectCols} FROM ${table} ${where} ${groupBy} ORDER BY ${input.groupBy ?? dateField} DESC LIMIT 500`
      const rows = await this.all<SqlRow>(sql, params)
      const columns = rows.length > 0 ? Object.keys(rows[0]) : []
      const total = rows.length > 0 && "total" in rows[0] ? String(rows[rows.length - 1].total) : undefined
      return ok({ rows: rows as Record<string, unknown>[], columns, total })
    } catch (e) { return fail(e) }
  }

  private async resetLegacySchemaIfNeeded(): Promise<void> {
    const hasLedgerTransactions = await this.tableExists("transactions")
    const hasCashflowEvents = await this.tableExists("cashflow_events")
    const hasOldBudgetSchema =
      (await this.tableExists("budgets")) && !(await this.tableHasColumn("budgets", "period_kind"))

    if (!hasLedgerTransactions && !hasCashflowEvents && !hasOldBudgetSchema) return

    await this.executor.executeBatchSql([
      { sql: "PRAGMA foreign_keys = OFF" },
      ...RESET_SCHEMA_TABLES.map((table) => ({ sql: `DROP TABLE IF EXISTS ${table}` })),
      { sql: "PRAGMA foreign_keys = ON" },
    ])
  }

  private async tableExists(name: string): Promise<boolean> {
    const row = await this.one<{ name: string }>(
      "select name from sqlite_master where type = 'table' and name = ? limit 1",
      [name],
    )
    return row != null
  }

  private async tableHasColumn(table: string, column: string): Promise<boolean> {
    const rows = await this.all<{ name: string }>(`PRAGMA table_info(${table})`)
    return rows.some((row) => row.name === column)
  }

  private async budgetScopes(budgetId: number): Promise<BudgetScopeInput[]> {
    return this.all<SqlRow>(
      "select scope_kind, scope_value from budget_scopes where budget_id = ? order by id",
      [budgetId],
    ).then((rows) =>
      rows.map((row) => ({
        scopeKind: row.scope_kind as BudgetScopeInput["scopeKind"],
        scopeValue: row.scope_value as string | null,
      })),
    )
  }

  private budgetEventScope(
    includeFlowKinds: string[] | null,
    scopes: BudgetScopeInput[],
  ): { conditions: string[]; params: SqlParam[] } {
    const conditions: string[] = []
    const params: SqlParam[] = []
    const scopedFlowKinds = scopes
      .filter((scope) => scope.scopeKind === "flow_kind" && scope.scopeValue != null)
      .map((scope) => scope.scopeValue as string)
    const flowKinds = scopedFlowKinds.length > 0
      ? scopedFlowKinds
      : includeFlowKinds ?? ["consumption_expense"]
    conditions.push(`fe.flow_kind IN (${flowKinds.map(() => "?").join(",")})`)
    params.push(...flowKinds)

    const categoryIds = scopes
      .filter((scope) => (scope.scopeKind === "category" || scope.scopeKind === "category_tree") && scope.scopeValue != null)
      .map((scope) => Number(scope.scopeValue))
      .filter((value) => Number.isFinite(value))
    if (categoryIds.length > 0) {
      conditions.push(`fe.category_id IN (${categoryIds.map(() => "?").join(",")})`)
      params.push(...categoryIds)
    }

    const sources = scopes
      .filter((scope) => scope.scopeKind === "source" && scope.scopeValue != null && scope.scopeValue.length > 0)
      .map((scope) => scope.scopeValue as string)
    if (sources.length > 0) {
      conditions.push(`fe.source IN (${sources.map(() => "?").join(",")})`)
      params.push(...sources)
    }

    const tags = scopes
      .filter((scope) => scope.scopeKind === "tag" && scope.scopeValue != null && scope.scopeValue.length > 0)
      .map((scope) => scope.scopeValue as string)
    if (tags.length > 0) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM json_each(fe.explanation_tags)
          WHERE json_each.value IN (${tags.map(() => "?").join(",")})
        )`,
      )
      params.push(...tags)
    }

    return { conditions, params }
  }

  private async rebuildFinancialEventsCore(batchId?: number): Promise<{ created: number; skipped: number }> {
    const conds = batchId == null ? "" : "WHERE imported_entries.batch_id = ?"
    const params: SqlParam[] = batchId == null ? [] : [batchId]
    const entries = await this.all<SqlRow>(
      `SELECT imported_entries.*, import_batches.source_name
       FROM imported_entries
       JOIN import_batches ON import_batches.id = imported_entries.batch_id
       ${conds}
       ORDER BY imported_entries.date ASC, imported_entries.id ASC`,
      params,
    )
    const categoryRows = await this.all<{ id: number; name: string }>(
      "select id, name from categories where archived = 0",
    )
    const categoryIds = new Map(categoryRows.map((row) => [row.name, Number(row.id)]))
    const now = new Date().toISOString()
    let created = 0
    let skipped = 0
    for (const entry of entries) {
      const flowKind = classifyImportedEntry(
        entry.classification as string | null,
        entry.direction as string | null,
      )
      const direction = normalizeDirection(entry.direction as string | null)
      const categoryName = defaultCategoryNameForImportedEntry(entry, flowKind)
      const categoryId = categoryName == null ? null : categoryIds.get(categoryName) ?? null
      const existing = await this.one<SqlRow>(
        "SELECT id, classification_source FROM financial_events WHERE source_entry_id = ?",
        [entry.id as number],
      )
      if (existing != null) {
        skipped += 1
        if (existing.classification_source !== "manual") {
          await this.run(
            `UPDATE financial_events SET
              source = ?, date = ?, occurred_at = ?, counterparty = ?, description = ?,
              account_hint = ?, flow_kind = ?, category_id = ?, amount = ?, currency = ?,
              direction = ?, confidence = ?, classification_source = 'system_rule',
              raw_meta = ?, updated_at = ?
             WHERE id = ?`,
            [
              entry.source_name,
              entry.date,
              entry.occurred_at ?? null,
              entry.payee ?? null,
              entry.narration ?? null,
              entry.account_name ?? null,
              flowKind,
              categoryId,
              entry.amount_number,
              entry.currency,
              direction,
              entry.confidence ?? null,
              json({ importedEntryMeta: parseJsonObject(entry.meta as string | null) }),
              now,
              existing.id as number,
            ],
          )
        }
        continue
      }
      const eventId = await this.insertOne(
        `INSERT INTO financial_events
         (source, source_entry_id, date, occurred_at, counterparty, description,
          account_hint, flow_kind, category_id, amount, currency, direction, confidence,
          classification_source, raw_meta, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'system_rule', ?, ?, ?)`,
        [
          entry.source_name,
          entry.id,
          entry.date,
          entry.occurred_at ?? null,
          entry.payee ?? null,
          entry.narration ?? null,
          entry.account_name ?? null,
          flowKind,
          categoryId,
          entry.amount_number,
          entry.currency,
          direction,
          entry.confidence ?? null,
          json({ importedEntryMeta: parseJsonObject(entry.meta as string | null) }),
          now,
          now,
        ],
      )
      await this.run("update imported_entries set generated_event_id = ? where id = ?", [
        eventId,
        entry.id as number,
      ])
      created += 1
    }
    return { created, skipped }
  }

  private async one<T extends SqlRow>(sql: string, params: SqlParam[] = []) {
    const result = await this.executor.executeSingleSql({ sql, params })
    return (result.rows[0] as T | undefined) ?? null
  }

  private async all<T extends SqlRow = SqlRow>(sql: string, params: SqlParam[] = []): Promise<T[]> {
    const result = await this.executor.executeSingleSql({ sql, params })
    return result.rows as T[]
  }

  private async run(sql: string, params: SqlParam[] = []) {
    return this.executor.executeSingleSql({ sql, params })
  }

  private async insertOne(sql: string, params: SqlParam[] = []) {
    const result = await this.executor.executeSingleSql({ sql, params })
    if (result.lastInsertId == null) throw new Error("SQLite did not return an id")
    return result.lastInsertId
  }
}

let defaultApi: FlowmApi | null = null

export function createFlowmApi(executor: SqlExecutor, options: FlowmApiOptions = {}): FlowmApi {
  return new FlowmSqliteApi(executor, options)
}

export function getFlowmApi(): FlowmApi {
  if (!isElectron()) {
    throw new Error("Flowm API requires the Electron SQLite runtime")
  }
  defaultApi ??= createFlowmApi(new ElectronSqlExecutor())
  return defaultApi
}
