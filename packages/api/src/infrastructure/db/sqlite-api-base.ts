/**
 * @purpose Provide shared SQLite-backed infrastructure for the Flowm API facade.
 * @role    Infrastructure base class for database helpers, cross-domain queries, and transitional mapper wrappers.
 * @deps    @flowm/db schema, Drizzle query builder, presentation mappers, and shared API helpers.
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
  type SQL,
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
import type {
  ActiveStatus,
  BudgetItemSummary,
  BudgetPeriodSummary,
  BudgetSetSummary,
  CashflowEventSummary,
  CashflowSummaryInput,
  CategorySummary,
  CurrencySettingsSummary,
  Direction,
  ExchangeRateSummary,
  FlowmApiOptions,
  ListCashflowEventsInput,
  ListStatementLinesInput,
  LoanPaymentOccurrenceSummary,
  LoanSummary,
  ObjectLinkSummary,
  StatementImportSummary,
  StatementLineSummary,
  SubscriptionOccurrenceSummary,
  SubscriptionSummary,
  TagSummary,
} from "../../index"
import {
  mapBudgetItem,
  mapBudgetPeriod,
  mapBudgetSet,
  mapCategory,
  mapCurrencySettings,
  mapExchangeRate,
  mapLoan,
  mapLoanPaymentOccurrence,
  mapObjectLink,
  mapStatementImport,
  mapStatementLine,
  mapSubscription,
  mapSubscriptionOccurrence,
  mapTag,
} from "../../presentation/mappers/sqlite-row-mappers"
import {
  CURRENCY_SETTINGS_ID,
  DEFAULT_CURRENCY,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  sumReal,
  toSqlId,
} from "../../shared/api-helpers"

export {
  addInterval,
  CURRENCY_SETTINGS_ID,
  DEFAULT_CURRENCY,
  fail,
  monthBounds,
  newId,
  normalizeCashflowKind,
  normalizeCurrency,
  normalizeDirection,
  nowIso,
  ok,
  sumReal,
  todayKey,
  toSqlId,
} from "../../shared/api-helpers"

// Joined row shapes returned by the shared query helpers below.
export type StatementLineWithSource = StatementLineRow & {
  sourceName: string
  fileName: string | null
}
export type CashflowEventWithCategory = CashflowEventRow & { categoryName: string | null }

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

  protected async statementLineRows(
    input: ListStatementLinesInput & { sourceName?: string } = {},
  ): Promise<StatementLineWithSource[]> {
    const conds: SQL[] = []
    if (input.importId) conds.push(eq(statementLines.importId, toSqlId(input.importId)))
    if (input.status)
      conds.push(eq(statementLines.status, input.status as StatementLineRow["status"]))
    if (input.sourceName) conds.push(eq(statementImports.sourceName, input.sourceName))
    return this.db
      .select({
        ...getTableColumns(statementLines),
        sourceName: statementImports.sourceName,
        fileName: statementImports.fileName,
      })
      .from(statementLines)
      .innerJoin(statementImports, eq(statementImports.id, statementLines.importId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(statementLines.eventDate), desc(statementLines.createdAt))
      .limit(input.limit ?? 200)
      .all()
  }

  protected async cashflowRows(
    input: ListCashflowEventsInput,
  ): Promise<CashflowEventWithCategory[]> {
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
    if (input.sourceExternalId)
      conds.push(eq(cashflowEvents.sourceExternalId, input.sourceExternalId))
    if (input.status) conds.push(eq(cashflowEvents.status, input.status))
    else conds.push(ne(cashflowEvents.status, "deleted"))
    if (input.includeInAnalytics !== undefined)
      conds.push(eq(cashflowEvents.includeInAnalytics, input.includeInAnalytics))
    if (input.keyword) {
      const term = `%${input.keyword}%`
      conds.push(
        or(
          like(cashflowEvents.title, term),
          like(cashflowEvents.counterparty, term),
          like(cashflowEvents.description, term),
        )!,
      )
    }
    if (input.tagId) {
      conds.push(
        inArray(
          cashflowEvents.id,
          this.db
            .select({ id: cashflowEventTags.cashflowEventId })
            .from(cashflowEventTags)
            .where(eq(cashflowEventTags.tagId, toSqlId(input.tagId))),
        ),
      )
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
    const row = this.db
      .select({ total: sumReal(cashflowEvents.amount) })
      .from(cashflowEvents)
      .where(where)
      .get()
    return Number(row?.total ?? 0)
  }

  protected async budgetUsageWhere(item: BudgetItemRow, period: BudgetPeriodRow): Promise<SQL> {
    const conds: SQL[] = [
      eq(cashflowEvents.status, "active"),
      eq(cashflowEvents.includeInAnalytics, true),
      gte(cashflowEvents.eventDate, period.periodStart),
      lte(cashflowEvents.eventDate, period.periodEnd),
    ]
    if (item.categoryId != null) conds.push(eq(cashflowEvents.categoryId, item.categoryId))
    const scopes = this.db
      .select()
      .from(budgetItemScopes)
      .where(eq(budgetItemScopes.budgetItemId, item.id))
      .all()
    for (const scope of scopes) {
      const value = scope.scopeValue ?? ""
      if (scope.scopeKind === "category" || scope.scopeKind === "category_tree") {
        conds.push(eq(cashflowEvents.categoryId, value))
      } else if (scope.scopeKind === "source") {
        conds.push(eq(cashflowEvents.sourceName, value))
      } else if (scope.scopeKind === "flow_kind") {
        conds.push(eq(cashflowEvents.flowKind, value as CashflowEventRow["flowKind"]))
      } else if (scope.scopeKind === "tag") {
        conds.push(
          inArray(
            cashflowEvents.id,
            this.db
              .select({ id: cashflowEventTags.cashflowEventId })
              .from(cashflowEventTags)
              .where(eq(cashflowEventTags.tagId, value)),
          ),
        )
      }
    }
    if (item.categoryId == null && scopes.length === 0) {
      conds.push(eq(cashflowEvents.flowKind, "expense"))
    }
    return and(...conds)!
  }

  protected async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: string,
  ): Promise<number | null> {
    // Current-rate model: value everything at the most recent cached rate for the pair,
    // not the rate on `date`. Foreign holdings then reflect today's rate once the daily
    // refresh runs, and old snapshots stop forcing per-date historical lookups.
    const row = this.db
      .select({ rate: exchangeRates.rate })
      .from(exchangeRates)
      .where(
        and(eq(exchangeRates.fromCurrency, fromCurrency), eq(exchangeRates.toCurrency, toCurrency)),
      )
      .orderBy(desc(exchangeRates.rateDate), desc(exchangeRates.fetchedAt))
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
    return mapCurrencySettings(row)
  }

  protected mapExchangeRate(row: ExchangeRateRow): ExchangeRateSummary {
    return mapExchangeRate(row)
  }

  protected mapCategory(row: CategoryRow): CategorySummary {
    return mapCategory(row)
  }

  protected mapTag(row: TagRow): TagSummary {
    return mapTag(row)
  }

  protected mapStatementImport(row: StatementImportRow): StatementImportSummary {
    return mapStatementImport(row)
  }

  protected mapStatementLine(row: StatementLineRow): StatementLineSummary {
    return mapStatementLine(row)
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
      sourceExternalId: row.sourceExternalId,
      sourceFileHash: row.sourceFileHash,
      importedAt: row.importedAt,
      source: row.sourceName,
      includeInAnalytics: row.includeInAnalytics,
      status: row.status as ActiveStatus,
      classificationSource: row.classificationSource,
      tags: tagRows.map((tag) => this.mapTag(tag)),
      createdAt: row.createdAt,
    }
  }

  protected mapSubscription(row: SubscriptionRow): SubscriptionSummary {
    return mapSubscription(row)
  }

  protected mapSubscriptionOccurrence(
    row: SubscriptionOccurrenceRow,
  ): SubscriptionOccurrenceSummary {
    return mapSubscriptionOccurrence(row)
  }

  protected mapLoan(row: LoanRow): LoanSummary {
    return mapLoan(row)
  }

  protected mapLoanPaymentOccurrence(row: LoanPaymentOccurrenceRow): LoanPaymentOccurrenceSummary {
    return mapLoanPaymentOccurrence(row)
  }

  protected mapBudgetSet(row: BudgetSetRow): BudgetSetSummary {
    return mapBudgetSet(row)
  }

  protected mapBudgetPeriod(row: BudgetPeriodRow): BudgetPeriodSummary {
    return mapBudgetPeriod(row)
  }

  protected mapBudgetItem(row: BudgetItemRow): BudgetItemSummary {
    return mapBudgetItem(row)
  }

  protected mapObjectLink(row: ObjectLinkRow): ObjectLinkSummary {
    return mapObjectLink(row)
  }
}
