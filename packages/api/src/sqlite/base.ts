import { type Database, type SqlParam, type SqlRow } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { ActiveStatus, AssetItemSummary, AssetSnapshotSummary, AssetSnapshotType, AssetType, BudgetItemSummary, BudgetPeriodSummary, BudgetSetSummary, CashflowEventSummary, CashflowKind, CashflowSummaryInput, CategorySummary, CurrencySettingsSummary, Direction, ExchangeRateSummary, FlowmApiOptions, FlowmId, ListAssetSnapshotsInput, ListCashflowEventsInput, ListStatementLinesInput, LoanPaymentOccurrenceSummary, LoanSummary, ObjectLinkSummary, StatementImportSummary, StatementLineSummary, SubscriptionOccurrenceSummary, SubscriptionSummary, TagSummary } from "../index"

export const DEFAULT_CURRENCY = "CNY"
export const CURRENCY_SETTINGS_ID = "default"

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

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function fail<T = never>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

export function json(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value)
}

export function parseJsonObject(value: unknown): Record<string, unknown> | null {
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

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${random.replace(/-/g, "")}`
}

export function normalizeCurrency(currency: string | null | undefined): string {
  return (currency ?? DEFAULT_CURRENCY).trim().toUpperCase()
}

export function normalizeDirection(direction: string | null | undefined): Direction {
  if (direction === "income" || direction === "in") return "in"
  if (direction === "expense" || direction === "out") return "out"
  return "neutral"
}

export function normalizeAssetType(type: string): AssetType {
  return type === "investment" ? "brokerage" : type as AssetType
}

export function normalizeCashflowKind(kind: string): CashflowKind {
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

export function toSqlId(id: FlowmId): string {
  return String(id)
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addInterval(date: string, cycle: string, interval: number): string {
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

export function monthBounds(ym?: string): { start: string; end: string } {
  const source = ym ?? new Date().toISOString().slice(0, 7)
  const [year, month] = source.split("-").map(Number)
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
  return { start, end: endDate }
}


export abstract class FlowmApiBase {

  protected initialized = false
  protected initializing: Promise<Result<void>> | null = null

  constructor(
    protected readonly db: Database,
    protected readonly options: FlowmApiOptions = {},
  ) {}

  async initializeFlowm(): Promise<Result<void>> {
    if (this.initialized) return ok(undefined)
    this.initializing ??= this.initializeFlowmCore()
    const result = await this.initializing
    if (result.success) this.initialized = true
    this.initializing = null
    return result
  }

  protected async initializeFlowmCore(): Promise<Result<void>> {
    try {
      await this.seedDefaults()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  protected async seedDefaults(): Promise<void> {
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

  protected async ensureCurrencySettings(): Promise<void> {
    const row = await this.one("select id from currency_settings where id = ?", [CURRENCY_SETTINGS_ID])
    if (row) return
    await this.run(
      `insert into currency_settings (id, display_currency, fx_provider, fx_request_policy, updated_at, meta)
       values (?, ?, 'manual', 'manual_only', ?, null)`,
      [CURRENCY_SETTINGS_ID, DEFAULT_CURRENCY, nowIso()],
    )
  }

  protected async statementLineRows(input: ListStatementLinesInput & { sourceName?: string } = {}): Promise<SqlRow[]> {
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

  protected async cashflowRows(input: ListCashflowEventsInput): Promise<SqlRow[]> {
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

  protected cashflowMetricWhere(metric: string, input: CashflowSummaryInput): { where: string; params: SqlParam[] } {
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

  protected async assetSnapshotRows(input: ListAssetSnapshotsInput): Promise<SqlRow[]> {
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

  protected async latestAssetSnapshotRows(input: ListAssetSnapshotsInput): Promise<SqlRow[]> {
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

  protected async oneAssetSnapshot(id: FlowmId): Promise<SqlRow | null> {
    return this.one(
      `select s.*, a.name as asset_name, a.asset_type, a.institution, a.default_currency from asset_snapshots s
       join asset_items a on a.id = s.asset_item_id
       where s.id = ?`,
      [toSqlId(id)],
    )
  }

  protected occurrenceWhere(column: string, id?: FlowmId, dateFrom?: string, dateTo?: string): { where: string; params: SqlParam[] } {
    const conds: string[] = []
    const params: SqlParam[] = []
    if (id) { conds.push(`${column} = ?`); params.push(toSqlId(id)) }
    if (dateFrom) { conds.push("due_date >= ?"); params.push(dateFrom) }
    if (dateTo) { conds.push("due_date <= ?"); params.push(dateTo) }
    return { where: conds.length ? `where ${conds.join(" and ")}` : "", params }
  }

  protected async budgetUsageWhere(item: SqlRow, period: SqlRow): Promise<{ where: string; params: SqlParam[] }> {
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

  protected async convertAmount(amount: number, fromCurrency: string, toCurrency: string, date: string): Promise<number | null> {
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

  protected mapCurrencySettings(row: SqlRow): CurrencySettingsSummary {
    return {
      displayCurrency: row.display_currency as string,
      fxProvider: row.fx_provider as string,
      fxRequestPolicy: row.fx_request_policy as string,
      updatedAt: row.updated_at as string,
      meta: parseJsonObject(row.meta),
    }
  }

  protected mapExchangeRate(row: SqlRow): ExchangeRateSummary {
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

  protected mapCategory(row: SqlRow): CategorySummary {
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

  protected mapTag(row: SqlRow): TagSummary {
    return {
      id: row.id as string,
      name: row.name as string,
      color: row.color as string | null,
      archived: row.archived_at != null,
    }
  }

  protected mapStatementImport(row: SqlRow): StatementImportSummary {
    return {
      id: row.id as string,
      sourceName: row.source_name as string,
      fileName: row.file_name as string | null,
      fileHash: row.file_hash as string | null,
      importedAt: row.imported_at as string,
      status: row.status as string,
    }
  }

  protected mapStatementLine(row: SqlRow): StatementLineSummary {
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

  protected async mapCashflowEvent(row: SqlRow): Promise<CashflowEventSummary> {
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

  protected mapAssetItem(row: SqlRow): AssetItemSummary {
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

  protected mapAssetSnapshot(row: SqlRow): AssetSnapshotSummary {
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

  protected mapSubscription(row: SqlRow): SubscriptionSummary {
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

  protected mapSubscriptionOccurrence(row: SqlRow): SubscriptionOccurrenceSummary {
    return {
      id: row.id as string,
      subscriptionId: row.subscription_id as string,
      dueDate: row.due_date as string,
      amount: row.amount as string,
      currency: row.currency as string,
      status: row.status as string,
    }
  }

  protected mapLoan(row: SqlRow): LoanSummary {
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

  protected mapLoanPaymentOccurrence(row: SqlRow): LoanPaymentOccurrenceSummary {
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

  protected mapBudgetSet(row: SqlRow): BudgetSetSummary {
    return { id: row.id as string, name: row.name as string, status: row.status as string }
  }

  protected mapBudgetPeriod(row: SqlRow): BudgetPeriodSummary {
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

  protected mapBudgetItem(row: SqlRow): BudgetItemSummary {
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

  protected mapObjectLink(row: SqlRow): ObjectLinkSummary {
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

  protected async one(sql: string, params: SqlParam[] = []): Promise<SqlRow | null> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    return this.db.$client.prepare(sql).get(...bound) as SqlRow | null
  }

  protected async all(sql: string, params: SqlParam[] = []): Promise<SqlRow[]> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    return this.db.$client.prepare(sql).all(...bound) as SqlRow[]
  }

  protected async run(sql: string, params: SqlParam[] = []): Promise<void> {
    const bound = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
    this.db.$client.prepare(sql).run(...bound)
  }
}
