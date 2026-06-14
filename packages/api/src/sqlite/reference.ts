/**
 * @purpose Implement reference queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CategorySummary, CreateCategoryInput, CreateTagInput, CurrencySettingsSummary, ExchangeRateSummary, FlowmId, ListCategoriesInput, ListExchangeRatesInput, ListTagsInput, RefreshExchangeRatesResult, TagSummary, UpdateCategoryInput, UpdateCurrencySettingsInput } from "../index"
import { FlowmApiBase } from "./base"
import { CURRENCY_SETTINGS_ID, fail, json, newId, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class ReferenceApi extends FlowmApiBase {
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


}
