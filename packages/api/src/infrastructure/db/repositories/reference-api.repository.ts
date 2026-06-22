/**
 * @purpose Implement reference persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, desc, eq, isNull, type SQL } from "drizzle-orm"
import {
  assetSnapshots,
  categories,
  currencySettings,
  exchangeRates,
  loans,
  subscriptions,
  type CategoryInsert,
  type CategoryRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CategorySummary,
  CreateCategoryInput,
  CurrencySettingsSummary,
  CurrentRates,
  ExchangeRateSummary,
  FlowmId,
  ListCategoriesInput,
  ListExchangeRatesInput,
  RefreshExchangeRatesInput,
  RefreshExchangeRatesResult,
  UpdateCategoryInput,
  UpdateCurrencySettingsInput,
} from "../../../index"
import { FlowmApiBase } from "../sqlite-api-base"
import {
  CURRENCY_SETTINGS_ID,
  DEFAULT_CURRENCY,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  todayKey,
  toSqlId,
} from "../../../shared/api-helpers"

// Pre-warmed on every daily refresh (even when not yet held) so adding a foreign-currency
// item later is instant rather than waiting on a first-time network fetch.
const WARM_CURRENCIES = ["USD", "EUR", "HKD", "JPY", "GBP", "TWD"]

export abstract class ReferenceApiRepository extends FlowmApiBase {
  async getCurrencySettings(): Promise<Result<CurrencySettingsSummary>> {
    try {
      await this.ensureCurrencySettings()
      const row = this.db
        .select()
        .from(currencySettings)
        .where(eq(currencySettings.id, CURRENCY_SETTINGS_ID))
        .get()
      return ok(this.mapCurrencySettings(row!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateCurrencySettings(
    input: UpdateCurrencySettingsInput,
  ): Promise<Result<CurrencySettingsSummary>> {
    try {
      await this.ensureCurrencySettings()
      const current = this.db
        .select()
        .from(currencySettings)
        .where(eq(currencySettings.id, CURRENCY_SETTINGS_ID))
        .get()
      this.db
        .update(currencySettings)
        .set({
          displayCurrency: normalizeCurrency(input.displayCurrency ?? current?.displayCurrency),
          fxProvider: input.fxProvider ?? current?.fxProvider ?? "manual",
          fxRequestPolicy: input.fxRequestPolicy ?? current?.fxRequestPolicy ?? "manual_only",
          meta: input.meta === undefined ? (current?.meta ?? null) : input.meta,
          updatedAt: nowIso(),
        })
        .where(eq(currencySettings.id, CURRENCY_SETTINGS_ID))
        .run()
      return this.getCurrencySettings()
    } catch (error) {
      return fail(error)
    }
  }

  async listExchangeRates(
    input: ListExchangeRatesInput = {},
  ): Promise<Result<ExchangeRateSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.fromCurrency)
        conds.push(eq(exchangeRates.fromCurrency, normalizeCurrency(input.fromCurrency)))
      if (input.toCurrency)
        conds.push(eq(exchangeRates.toCurrency, normalizeCurrency(input.toCurrency)))
      if (input.provider) conds.push(eq(exchangeRates.provider, input.provider))
      const rows = this.db
        .select()
        .from(exchangeRates)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(exchangeRates.rateDate))
        .limit(input.limit ?? 100)
        .all()
      return ok(rows.map((row) => this.mapExchangeRate(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async refreshExchangeRates(
    input: RefreshExchangeRatesInput = {},
  ): Promise<Result<RefreshExchangeRatesResult>> {
    try {
      const base = await this.resolveBaseCurrency()
      const today = todayKey()
      // Held currencies plus the common warm set, so newly added foreign items are instant.
      const currencies = new Set<string>([
        ...this.activeCurrencies(),
        ...WARM_CURRENCIES.map(normalizeCurrency),
      ])
      let requested = 0
      let fetched = 0
      let skipped = 0
      let failed = 0
      let unsupported = 0

      for (const currency of currencies) {
        if (currency === base) continue
        requested += 1
        if (this.options.fxProvider == null) {
          unsupported += 1
          continue
        }
        // Skip pairs already refreshed today unless a forced refresh was requested.
        if (!input.force && this.hasRateForDate(currency, base, today)) {
          skipped += 1
          continue
        }
        const rate = await this.fetchAndCacheRate(currency, base, today)
        if (rate == null) failed += 1
        else fetched += 1
      }
      return ok({ requested, fetched, skipped, failed, unsupported })
    } catch (error) {
      return fail(error)
    }
  }

  async getCurrentRates(): Promise<Result<CurrentRates>> {
    try {
      const base = await this.resolveBaseCurrency()
      const today = todayKey()
      const rates: Record<string, string> = { [base]: "1" }
      let asOf: string | null = null
      for (const currency of this.activeCurrencies()) {
        if (currency === base) continue
        let row = this.latestRateRow(currency, base)
        // Self-heal: a held currency with no cached rate gets fetched on demand, so totals
        // never silently drop it while waiting on the daily refresh.
        if (row?.rate == null) {
          await this.fetchAndCacheRate(currency, base, today)
          row = this.latestRateRow(currency, base)
        }
        if (row?.rate != null) {
          rates[currency] = row.rate
          if (asOf == null || (row.fetchedAt != null && row.fetchedAt > asOf)) asOf = row.fetchedAt
        }
      }
      return ok({ base, asOf, rates })
    } catch (error) {
      return fail(error)
    }
  }

  private hasRateForDate(currency: string, base: string, date: string): boolean {
    return (
      this.db
        .select({ id: exchangeRates.id })
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.fromCurrency, currency),
            eq(exchangeRates.toCurrency, base),
            eq(exchangeRates.rateDate, date),
          ),
        )
        .get() != null
    )
  }

  private latestRateRow(currency: string, base: string) {
    return this.db
      .select({ rate: exchangeRates.rate, fetchedAt: exchangeRates.fetchedAt })
      .from(exchangeRates)
      .where(and(eq(exchangeRates.fromCurrency, currency), eq(exchangeRates.toCurrency, base)))
      .orderBy(desc(exchangeRates.rateDate), desc(exchangeRates.fetchedAt))
      .limit(1)
      .get()
  }

  // Fetch a single currency->base rate from the provider and cache it; returns the rate or null.
  private async fetchAndCacheRate(
    currency: string,
    base: string,
    date: string,
  ): Promise<string | null> {
    const provider = this.options.fxProvider
    if (provider == null) return null
    const result = await provider.fetchRate({ fromCurrency: currency, toCurrency: base, date })
    if (result == null) return null
    this.db
      .insert(exchangeRates)
      .values({
        id: newId("fx"),
        fromCurrency: normalizeCurrency(result.fromCurrency),
        toCurrency: normalizeCurrency(result.toCurrency),
        rateDate: result.rateDate,
        rate: result.rate,
        provider: result.provider,
        fetchedAt: nowIso(),
        sourceDate: result.sourceDate ?? result.rateDate,
        meta: result.meta ?? null,
      })
      .onConflictDoUpdate({
        target: [
          exchangeRates.fromCurrency,
          exchangeRates.toCurrency,
          exchangeRates.rateDate,
          exchangeRates.provider,
        ],
        set: {
          rate: result.rate,
          fetchedAt: nowIso(),
          sourceDate: result.sourceDate ?? result.rateDate,
          meta: result.meta ?? null,
        },
      })
      .run()
    return result.rate
  }

  private async resolveBaseCurrency(): Promise<string> {
    const settings = await this.getCurrencySettings()
    return settings.success ? normalizeCurrency(settings.data.displayCurrency) : DEFAULT_CURRENCY
  }

  // Distinct currencies stored on holdings and obligations — the only pairs worth fetching.
  private activeCurrencies(): string[] {
    const seen = new Set<string>()
    const add = (rows: { c: string | null }[]) => {
      for (const row of rows) seen.add(normalizeCurrency(row.c))
    }
    add(this.db.selectDistinct({ c: assetSnapshots.valueCurrency }).from(assetSnapshots).all())
    add(this.db.selectDistinct({ c: subscriptions.currency }).from(subscriptions).all())
    add(this.db.selectDistinct({ c: loans.currency }).from(loans).all())
    return [...seen]
  }

  async listCategories(input: ListCategoriesInput = {}): Promise<Result<CategorySummary[]>> {
    try {
      const conds: SQL[] = []
      if (!input.includeArchived) conds.push(isNull(categories.archivedAt))
      if (input.categoryKind)
        conds.push(eq(categories.categoryKind, input.categoryKind as CategoryRow["categoryKind"]))
      const rows = this.db
        .select()
        .from(categories)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(asc(categories.displayOrder), asc(categories.name))
        .all()
      return ok(rows.map((row) => this.mapCategory(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createCategory(input: CreateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const id = newId("cat")
      const timestamp = nowIso()
      const kind = (input.categoryKind ?? input.kind ?? "expense") as CategoryRow["categoryKind"]
      const order = input.displayOrder ?? input.sortOrder ?? 0
      this.db
        .insert(categories)
        .values({
          id,
          name: input.name,
          parentId: input.parentId == null ? null : toSqlId(input.parentId),
          categoryKind: kind,
          color: input.color ?? null,
          icon: input.icon ?? null,
          displayOrder: order,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      return ok(
        this.mapCategory(this.db.select().from(categories).where(eq(categories.id, id)).get()!),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Result<CategorySummary>> {
    try {
      const set: Partial<CategoryInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.parentId !== undefined)
        set.parentId = input.parentId == null ? null : toSqlId(input.parentId)
      if (input.categoryKind !== undefined || input.kind !== undefined)
        set.categoryKind = (input.categoryKind ??
          input.kind ??
          "expense") as CategoryRow["categoryKind"]
      if (input.color !== undefined) set.color = input.color
      if (input.icon !== undefined) set.icon = input.icon
      if (input.displayOrder !== undefined || input.sortOrder !== undefined)
        set.displayOrder = input.displayOrder ?? input.sortOrder ?? 0
      this.db
        .update(categories)
        .set(set)
        .where(eq(categories.id, toSqlId(input.id)))
        .run()
      return ok(
        this.mapCategory(
          this.db
            .select()
            .from(categories)
            .where(eq(categories.id, toSqlId(input.id)))
            .get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async archiveCategory(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(categories)
        .set({ archivedAt: nowIso(), updatedAt: nowIso() })
        .where(eq(categories.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }
}
