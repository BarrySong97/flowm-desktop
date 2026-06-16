/**
 * @purpose Implement reference persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, desc, eq, isNull, type SQL } from "drizzle-orm"
import {
  categories,
  currencySettings,
  exchangeRates,
  tags,
  type CategoryInsert,
  type CategoryRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CategorySummary,
  CreateCategoryInput,
  CreateTagInput,
  CurrencySettingsSummary,
  ExchangeRateSummary,
  FlowmId,
  ListCategoriesInput,
  ListExchangeRatesInput,
  ListTagsInput,
  RefreshExchangeRatesResult,
  TagSummary,
  UpdateCategoryInput,
  UpdateCurrencySettingsInput,
  UpdateTagInput,
} from "../../../index"
import { FlowmApiBase } from "../sqlite-api-base"
import {
  CURRENCY_SETTINGS_ID,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  toSqlId,
} from "../../../shared/api-helpers"

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

  async refreshExchangeRates(): Promise<Result<RefreshExchangeRatesResult>> {
    return ok({ requested: 0, fetched: 0, skipped: 0, failed: 0, unsupported: 0 })
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

  async listTags(input: ListTagsInput = {}): Promise<Result<TagSummary[]>> {
    try {
      const rows = this.db
        .select()
        .from(tags)
        .where(input.includeArchived ? undefined : isNull(tags.archivedAt))
        .orderBy(asc(tags.name))
        .all()
      return ok(rows.map((row) => this.mapTag(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createTag(input: CreateTagInput): Promise<Result<TagSummary>> {
    try {
      const id = newId("tag")
      const timestamp = nowIso()
      this.db
        .insert(tags)
        .values({
          id,
          name: input.name,
          color: input.color ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      return ok(this.mapTag(this.db.select().from(tags).where(eq(tags.id, id)).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateTag(input: UpdateTagInput): Promise<Result<TagSummary>> {
    try {
      const set: Partial<typeof tags.$inferInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.color !== undefined) set.color = input.color
      this.db
        .update(tags)
        .set(set)
        .where(eq(tags.id, toSqlId(input.id)))
        .run()
      return ok(
        this.mapTag(
          this.db
            .select()
            .from(tags)
            .where(eq(tags.id, toSqlId(input.id)))
            .get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async archiveTag(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(tags)
        .set({ archivedAt: nowIso(), updatedAt: nowIso() })
        .where(eq(tags.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }
}
