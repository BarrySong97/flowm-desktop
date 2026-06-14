/**
 * @purpose Implement base queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  like,
  lte,
  ne,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm"
import {
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
  type AssetItemRow,
  type AssetSnapshotRow,
  type BudgetItemRow,
  type BudgetPeriodRow,
  type BudgetSetRow,
  type CashflowEventRow,
  type CategoryRow,
  type CurrencySettingsRow,
  type Database,
  type ExchangeRateRow,
  type LoanPaymentOccurrenceRow,
  type LoanRow,
  type ObjectLinkRow,
  type StatementImportRow,
  type StatementLineRow,
  type SubscriptionOccurrenceRow,
  type SubscriptionRow,
  type TagRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { ActiveStatus, AssetItemSummary, AssetSnapshotSummary, AssetSnapshotType, AssetType, BudgetItemSummary, BudgetPeriodSummary, BudgetSetSummary, CashflowEventSummary, CashflowKind, CashflowSummaryInput, CategorySummary, CurrencySettingsSummary, Direction, ExchangeRateSummary, FlowmApiOptions, FlowmId, ListAssetSnapshotsInput, ListCashflowEventsInput, ListStatementLinesInput, LoanPaymentOccurrenceSummary, LoanSummary, ObjectLinkSummary, StatementImportSummary, StatementLineSummary, SubscriptionOccurrenceSummary, SubscriptionSummary, TagSummary } from "../index"

export const DEFAULT_CURRENCY = "CNY"
export const CURRENCY_SETTINGS_ID = "default"

// Joined row shapes returned by the shared query helpers below.
export type StatementLineWithSource = StatementLineRow & { sourceName: string; fileName: string | null }
export type CashflowEventWithCategory = CashflowEventRow & { categoryName: string | null }
export type AssetSnapshotWithItem = AssetSnapshotRow & {
  assetName: string
  assetType: AssetItemRow["assetType"]
  institution: string | null
  defaultCurrency: string
}

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function fail<T = never>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
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

// Sum a text "amount"-style column as a real number, defaulting to 0.
export function sumReal(column: SQLWrapper): SQL<number> {
  return sql<number>`coalesce(sum(cast(${column} as real)), 0)`
}

export abstract class FlowmApiBase {
  constructor(
    protected readonly db: Database,
    protected readonly options: FlowmApiOptions = {},
  ) {}

  async resetAllData(): Promise<Result<void>> {
    try {
      // Child tables before parents (FK-safe).
      const tables = [
        cashflowEventTags,
        budgetItemScopes,
        budgetItems,
        budgetPeriods,
        budgetSets,
        subscriptionOccurrences,
        subscriptions,
        loanPaymentOccurrences,
        loans,
        assetSnapshots,
        assetItems,
        statementLines,
        statementImports,
        objectLinks,
        exchangeRates,
        currencySettings,
        cashflowEvents,
        tags,
        categories,
      ]
      for (const table of tables) {
        this.db.delete(table).run()
      }
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  protected async ensureCurrencySettings(): Promise<void> {
    const row = this.db
      .select({ id: currencySettings.id })
      .from(currencySettings)
      .where(eq(currencySettings.id, CURRENCY_SETTINGS_ID))
      .get()
    if (row) return
    this.db
      .insert(currencySettings)
      .values({
        id: CURRENCY_SETTINGS_ID,
        displayCurrency: DEFAULT_CURRENCY,
        fxProvider: "manual",
        fxRequestPolicy: "manual_only",
        updatedAt: nowIso(),
        meta: null,
      })
      .run()
  }

  protected async statementLineRows(input: ListStatementLinesInput & { sourceName?: string } = {}): Promise<StatementLineWithSource[]> {
    const conds: SQL[] = []
    if (input.importId) conds.push(eq(statementLines.importId, toSqlId(input.importId)))
    if (input.status) conds.push(eq(statementLines.status, input.status as StatementLineRow["status"]))
    if (input.sourceName) conds.push(eq(statementImports.sourceName, input.sourceName))
    return this.db
      .select({ ...getTableColumns(statementLines), sourceName: statementImports.sourceName, fileName: statementImports.fileName })
      .from(statementLines)
      .innerJoin(statementImports, eq(statementImports.id, statementLines.importId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(statementLines.eventDate), desc(statementLines.createdAt))
      .limit(input.limit ?? 200)
      .all()
  }

  protected async cashflowRows(input: ListCashflowEventsInput): Promise<CashflowEventWithCategory[]> {
    const conds: SQL[] = []
    if (input.dateFrom) conds.push(gte(cashflowEvents.eventDate, input.dateFrom))
    if (input.dateTo) conds.push(lte(cashflowEvents.eventDate, input.dateTo))
    const flowKind = input.flowKind
    if (Array.isArray(flowKind) && flowKind.length > 0) {
      conds.push(inArray(cashflowEvents.flowKind, flowKind as CashflowEventRow["flowKind"][]))
    } else if (typeof flowKind === "string") {
      conds.push(eq(cashflowEvents.flowKind, flowKind as CashflowEventRow["flowKind"]))
    }
    if (input.direction) conds.push(eq(cashflowEvents.direction, input.direction))
    if (input.categoryId) conds.push(eq(cashflowEvents.categoryId, toSqlId(input.categoryId)))
    const sourceName = input.sourceName ?? input.source
    if (sourceName) conds.push(eq(cashflowEvents.sourceName, sourceName))
    if (input.status) conds.push(eq(cashflowEvents.status, input.status))
    else conds.push(ne(cashflowEvents.status, "deleted"))
    if (input.includeInAnalytics !== undefined) conds.push(eq(cashflowEvents.includeInAnalytics, input.includeInAnalytics))
    if (input.keyword) {
      const term = `%${input.keyword}%`
      conds.push(or(like(cashflowEvents.title, term), like(cashflowEvents.counterparty, term), like(cashflowEvents.description, term))!)
    }
    if (input.tagId) {
      conds.push(inArray(
        cashflowEvents.id,
        this.db.select({ id: cashflowEventTags.cashflowEventId }).from(cashflowEventTags).where(eq(cashflowEventTags.tagId, toSqlId(input.tagId))),
      ))
    }
    return this.db
      .select({ ...getTableColumns(cashflowEvents), categoryName: categories.name })
      .from(cashflowEvents)
      .leftJoin(categories, eq(categories.id, cashflowEvents.categoryId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(cashflowEvents.eventDate), desc(cashflowEvents.createdAt))
      .limit(input.limit ?? 200)
      .offset(input.offset ?? 0)
      .all()
  }

  protected cashflowMetricWhere(metric: string, input: CashflowSummaryInput): SQL {
    const conds: SQL[] = [eq(cashflowEvents.status, "active")]
    if (!input.includeIgnored) conds.push(eq(cashflowEvents.includeInAnalytics, true))
    if (input.dateFrom) conds.push(gte(cashflowEvents.eventDate, input.dateFrom))
    if (input.dateTo) conds.push(lte(cashflowEvents.eventDate, input.dateTo))
    switch (metric) {
      case "income":
        conds.push(eq(cashflowEvents.flowKind, "income"), eq(cashflowEvents.direction, "in"))
        break
      case "debt_payments":
        conds.push(eq(cashflowEvents.flowKind, "debt_payment"))
        break
      case "asset_movements":
        conds.push(eq(cashflowEvents.flowKind, "asset_movement"))
        break
      case "refunds":
        conds.push(eq(cashflowEvents.flowKind, "refund"))
        break
      case "all_activity":
        break
      case "everyday_spend":
      default:
        conds.push(eq(cashflowEvents.flowKind, "expense"), eq(cashflowEvents.direction, "out"))
        break
    }
    return and(...conds)!
  }

  protected sumCashflowAmount(where: SQL): number {
    const row = this.db.select({ total: sumReal(cashflowEvents.amount) }).from(cashflowEvents).where(where).get()
    return Number(row?.total ?? 0)
  }

  protected async assetSnapshotRows(input: ListAssetSnapshotsInput): Promise<AssetSnapshotWithItem[]> {
    const conds: SQL[] = []
    if (input.assetItemId) conds.push(eq(assetSnapshots.assetItemId, toSqlId(input.assetItemId)))
    if (input.accountName) conds.push(eq(assetItems.name, input.accountName))
    return this.db
      .select({ ...getTableColumns(assetSnapshots), assetName: assetItems.name, assetType: assetItems.assetType, institution: assetItems.institution, defaultCurrency: assetItems.defaultCurrency })
      .from(assetSnapshots)
      .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(assetSnapshots.snapshotAt), desc(assetSnapshots.createdAt))
      .all()
  }

  protected async latestAssetSnapshotRows(input: ListAssetSnapshotsInput): Promise<AssetSnapshotWithItem[]> {
    // Correlated scalar subquery: keep only the most recent snapshot per asset item.
    const latestId = sql`(
      select s2.id from ${assetSnapshots} s2
      where s2.asset_item_id = ${assetSnapshots.assetItemId}
      order by s2.snapshot_at desc, s2.created_at desc, s2.id desc
      limit 1
    )`
    const conds: SQL[] = [sql`${assetSnapshots.id} = ${latestId}`]
    if (input.assetItemId) conds.push(eq(assetSnapshots.assetItemId, toSqlId(input.assetItemId)))
    if (input.accountName) conds.push(eq(assetItems.name, input.accountName))
    return this.db
      .select({ ...getTableColumns(assetSnapshots), assetName: assetItems.name, assetType: assetItems.assetType, institution: assetItems.institution, defaultCurrency: assetItems.defaultCurrency })
      .from(assetSnapshots)
      .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
      .where(and(...conds))
      .orderBy(asc(assetItems.displayOrder), asc(assetItems.name))
      .all()
  }

  protected async oneAssetSnapshot(id: FlowmId): Promise<AssetSnapshotWithItem | null> {
    const row = this.db
      .select({ ...getTableColumns(assetSnapshots), assetName: assetItems.name, assetType: assetItems.assetType, institution: assetItems.institution, defaultCurrency: assetItems.defaultCurrency })
      .from(assetSnapshots)
      .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
      .where(eq(assetSnapshots.id, toSqlId(id)))
      .get()
    return row ?? null
  }

  protected async budgetUsageWhere(item: BudgetItemRow, period: BudgetPeriodRow): Promise<SQL> {
    const conds: SQL[] = [
      eq(cashflowEvents.status, "active"),
      eq(cashflowEvents.includeInAnalytics, true),
      gte(cashflowEvents.eventDate, period.periodStart),
      lte(cashflowEvents.eventDate, period.periodEnd),
    ]
    if (item.categoryId != null) conds.push(eq(cashflowEvents.categoryId, item.categoryId))
    const scopes = this.db.select().from(budgetItemScopes).where(eq(budgetItemScopes.budgetItemId, item.id)).all()
    for (const scope of scopes) {
      const value = scope.scopeValue ?? ""
      if (scope.scopeKind === "category" || scope.scopeKind === "category_tree") {
        conds.push(eq(cashflowEvents.categoryId, value))
      } else if (scope.scopeKind === "source") {
        conds.push(eq(cashflowEvents.sourceName, value))
      } else if (scope.scopeKind === "flow_kind") {
        conds.push(eq(cashflowEvents.flowKind, value as CashflowEventRow["flowKind"]))
      } else if (scope.scopeKind === "tag") {
        conds.push(inArray(
          cashflowEvents.id,
          this.db.select({ id: cashflowEventTags.cashflowEventId }).from(cashflowEventTags).where(eq(cashflowEventTags.tagId, value)),
        ))
      }
    }
    if (item.categoryId == null && scopes.length === 0) {
      conds.push(eq(cashflowEvents.flowKind, "expense"))
    }
    return and(...conds)!
  }

  protected async convertAmount(amount: number, fromCurrency: string, toCurrency: string, date: string): Promise<number | null> {
    const row = this.db
      .select({ rate: exchangeRates.rate })
      .from(exchangeRates)
      .where(and(eq(exchangeRates.fromCurrency, fromCurrency), eq(exchangeRates.toCurrency, toCurrency), eq(exchangeRates.rateDate, date)))
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(1)
      .get()
    if (row?.rate != null) return amount * Number(row.rate)
    const provider = this.options.fxProvider
    if (provider == null) return null
    const fetched = await provider.fetchRate({ fromCurrency, toCurrency, date })
    if (fetched == null) return null
    this.db
      .insert(exchangeRates)
      .values({
        id: newId("fx"),
        fromCurrency: normalizeCurrency(fetched.fromCurrency),
        toCurrency: normalizeCurrency(fetched.toCurrency),
        rateDate: fetched.rateDate,
        rate: fetched.rate,
        provider: fetched.provider,
        fetchedAt: nowIso(),
        sourceDate: fetched.sourceDate ?? fetched.rateDate,
        meta: fetched.meta ?? null,
      })
      .run()
    return amount * Number(fetched.rate)
  }

  protected mapCurrencySettings(row: CurrencySettingsRow): CurrencySettingsSummary {
    return {
      displayCurrency: row.displayCurrency,
      fxProvider: row.fxProvider,
      fxRequestPolicy: row.fxRequestPolicy,
      updatedAt: row.updatedAt,
      meta: row.meta ?? null,
    }
  }

  protected mapExchangeRate(row: ExchangeRateRow): ExchangeRateSummary {
    return {
      id: row.id,
      fromCurrency: row.fromCurrency,
      toCurrency: row.toCurrency,
      rateDate: row.rateDate,
      rate: row.rate,
      provider: row.provider,
      fetchedAt: row.fetchedAt,
      sourceDate: row.sourceDate,
      meta: row.meta ?? null,
    }
  }

  protected mapCategory(row: CategoryRow): CategorySummary {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      categoryKind: row.categoryKind,
      kind: row.categoryKind,
      color: row.color,
      icon: row.icon,
      sortOrder: row.displayOrder,
      displayOrder: row.displayOrder,
      archived: row.archivedAt != null,
      archivedAt: row.archivedAt,
    }
  }

  protected mapTag(row: TagRow): TagSummary {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      archived: row.archivedAt != null,
    }
  }

  protected mapStatementImport(row: StatementImportRow): StatementImportSummary {
    return {
      id: row.id,
      sourceName: row.sourceName,
      fileName: row.fileName,
      fileHash: row.fileHash,
      importedAt: row.importedAt,
      status: row.status,
    }
  }

  protected mapStatementLine(row: StatementLineRow): StatementLineSummary {
    return {
      id: row.id,
      importId: row.importId,
      externalId: row.externalId,
      eventDate: row.eventDate,
      occurredAt: row.occurredAt,
      counterparty: row.counterparty,
      description: row.description,
      amount: row.amount,
      currency: row.currency,
      direction: row.direction,
      status: row.status,
    }
  }

  protected async mapCashflowEvent(row: CashflowEventWithCategory): Promise<CashflowEventSummary> {
    const tagRows = this.db
      .select(getTableColumns(tags))
      .from(tags)
      .innerJoin(cashflowEventTags, eq(cashflowEventTags.tagId, tags.id))
      .where(eq(cashflowEventTags.cashflowEventId, row.id))
      .orderBy(asc(tags.name))
      .all()
    return {
      id: row.id,
      statementLineId: row.statementLineId,
      eventDate: row.eventDate,
      date: row.eventDate,
      occurredAt: row.occurredAt,
      title: row.title,
      counterparty: row.counterparty,
      description: row.description,
      userNote: row.userNote,
      amount: row.amount,
      currency: row.currency,
      direction: row.direction as Direction,
      flowKind: row.flowKind,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      sourceKind: row.sourceKind,
      sourceName: row.sourceName,
      source: row.sourceName,
      includeInAnalytics: row.includeInAnalytics,
      status: row.status as ActiveStatus,
      classificationSource: row.classificationSource,
      tags: tagRows.map((tag) => this.mapTag(tag)),
      createdAt: row.createdAt,
    }
  }

  protected mapAssetItem(row: AssetItemRow): AssetItemSummary {
    return {
      id: row.id,
      name: row.name,
      assetType: row.assetType,
      institution: row.institution,
      defaultCurrency: row.defaultCurrency,
      valuationMethod: row.valuationMethod,
      archived: row.archivedAt != null,
      note: row.note,
    }
  }

  protected mapAssetSnapshot(row: AssetSnapshotWithItem): AssetSnapshotSummary {
    return {
      id: row.id,
      assetItemId: row.assetItemId,
      accountName: row.assetName,
      assetType: row.assetType === "brokerage" ? "investment" : row.assetType as AssetSnapshotType,
      snapshotAt: row.snapshotAt,
      quantityNumber: row.quantityAmount,
      quantityCurrency: row.quantityUnit,
      quantityAmount: row.quantityAmount,
      quantityUnit: row.quantityUnit,
      valueNumber: row.valueAmount,
      valueCurrency: row.valueCurrency,
      source: row.sourceKind,
      note: row.note,
      meta: {
        costBasisAmount: row.costBasisAmount,
        costBasisCurrency: row.costBasisCurrency,
        institution: row.institution,
      },
    }
  }

  protected mapSubscription(row: SubscriptionRow): SubscriptionSummary {
    return {
      id: row.id,
      name: row.name,
      merchant: row.merchant,
      amount: row.amount,
      currency: row.currency,
      billingCycle: row.billingCycle,
      intervalCount: row.intervalCount,
      nextChargeDate: row.nextChargeDate,
      autoRenew: row.autoRenew,
      categoryId: row.categoryId,
      status: row.status,
      note: row.note,
    }
  }

  protected mapSubscriptionOccurrence(row: SubscriptionOccurrenceRow): SubscriptionOccurrenceSummary {
    return {
      id: row.id,
      subscriptionId: row.subscriptionId,
      dueDate: row.dueDate,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
    }
  }

  protected mapLoan(row: LoanRow): LoanSummary {
    return {
      id: row.id,
      name: row.name,
      lender: row.lender,
      currency: row.currency,
      principalAmount: row.principalAmount,
      currentPrincipalEstimate: row.currentPrincipalEstimate,
      annualRateBps: row.annualRateBps,
      repaymentMethod: row.repaymentMethod,
      paymentAmount: row.paymentAmount,
      paymentDay: row.paymentDay,
      startDate: row.startDate,
      termMonths: row.termMonths,
      status: row.status,
      note: row.note,
    }
  }

  protected mapLoanPaymentOccurrence(row: LoanPaymentOccurrenceRow): LoanPaymentOccurrenceSummary {
    return {
      id: row.id,
      loanId: row.loanId,
      dueDate: row.dueDate,
      paymentAmount: row.paymentAmount,
      principalAmount: row.principalAmount,
      interestAmount: row.interestAmount,
      feeAmount: row.feeAmount,
      remainingPrincipalEstimate: row.remainingPrincipalEstimate,
      status: row.status,
    }
  }

  protected mapBudgetSet(row: BudgetSetRow): BudgetSetSummary {
    return { id: row.id, name: row.name, status: row.status }
  }

  protected mapBudgetPeriod(row: BudgetPeriodRow): BudgetPeriodSummary {
    return {
      id: row.id,
      budgetSetId: row.budgetSetId,
      periodKind: row.periodKind,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      currency: row.currency,
      status: row.status,
    }
  }

  protected mapBudgetItem(row: BudgetItemRow): BudgetItemSummary {
    return {
      id: row.id,
      budgetPeriodId: row.budgetPeriodId,
      name: row.name,
      itemKind: row.itemKind,
      plannedAmount: row.plannedAmount,
      currency: row.currency,
      categoryId: row.categoryId,
      color: row.color ?? null,
      status: row.status,
    }
  }

  protected mapObjectLink(row: ObjectLinkRow): ObjectLinkSummary {
    return {
      id: row.id,
      fromType: row.fromType,
      fromId: row.fromId,
      toType: row.toType,
      toId: row.toId,
      linkType: row.linkType,
      confidence: row.confidence,
      createdBy: row.createdBy,
      note: row.note,
    }
  }
}
