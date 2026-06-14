/**
 * @purpose Implement assets queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, desc, eq, getTableColumns, isNull, lte, sql, type SQL } from "drizzle-orm"
import { assetItems, assetSnapshots, type AssetItemInsert, type AssetSnapshotInsert } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { AddAssetSnapshotInput, AssetChangeInput, AssetChangeSummary, AssetItemSummary, AssetSnapshotSummary, AssetSparklinePoint, CreateAssetItemInput, FlowmId, ListAssetItemsInput, ListAssetSnapshotsInput, ListAssetSparklinesInput, NetWorthInput, NetWorthSnapshot, UpdateAssetItemInput, UpdateAssetSnapshotInput, UpsertAssetSnapshotInput } from "../index"
import { CashflowApi } from "./cashflow"
import { DEFAULT_CURRENCY, fail, newId, normalizeAssetType, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class AssetsApi extends CashflowApi {
  async listAssetItems(input: ListAssetItemsInput = {}): Promise<Result<AssetItemSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.assetType) conds.push(eq(assetItems.assetType, input.assetType))
      if (!input.includeArchived) conds.push(isNull(assetItems.archivedAt))
      const rows = this.db
        .select()
        .from(assetItems)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(asc(assetItems.displayOrder), asc(assetItems.name))
        .all()
      return ok(rows.map((row) => this.mapAssetItem(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createAssetItem(input: CreateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const id = newId("asset")
      const timestamp = nowIso()
      this.db
        .insert(assetItems)
        .values({
          id,
          name: input.name,
          assetType: normalizeAssetType(input.assetType),
          institution: input.institution ?? null,
          defaultCurrency: normalizeCurrency(input.defaultCurrency),
          valuationMethod: (input.valuationMethod ?? "manual_balance") as AssetItemInsert["valuationMethod"],
          displayOrder: input.displayOrder ?? 0,
          note: input.note ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      return ok(this.mapAssetItem(this.db.select().from(assetItems).where(eq(assetItems.id, id)).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetItem(input: UpdateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const set: Partial<AssetItemInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.assetType !== undefined) set.assetType = normalizeAssetType(input.assetType)
      if (input.institution !== undefined) set.institution = input.institution
      if (input.defaultCurrency !== undefined) set.defaultCurrency = normalizeCurrency(input.defaultCurrency)
      if (input.valuationMethod !== undefined) set.valuationMethod = input.valuationMethod as AssetItemInsert["valuationMethod"]
      if (input.displayOrder !== undefined) set.displayOrder = input.displayOrder
      if (input.note !== undefined) set.note = input.note
      this.db.update(assetItems).set(set).where(eq(assetItems.id, toSqlId(input.id))).run()
      return ok(this.mapAssetItem(this.db.select().from(assetItems).where(eq(assetItems.id, toSqlId(input.id))).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveAssetItem(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db.update(assetItems).set({ archivedAt: nowIso(), updatedAt: nowIso() }).where(eq(assetItems.id, toSqlId(input.id))).run()
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
      return ok(rows.map((row) => this.mapAssetSnapshot(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSparklines(input: ListAssetSparklinesInput = {}): Promise<Result<AssetSparklinePoint[]>> {
    try {
      const limitPerAsset = input.limitPerAsset ?? 30
      const ranked = this.db
        .select({
          assetItemId: assetSnapshots.assetItemId,
          snapshotAt: assetSnapshots.snapshotAt,
          valueAmount: assetSnapshots.valueAmount,
          rn: sql<number>`row_number() over (partition by ${assetSnapshots.assetItemId} order by ${assetSnapshots.snapshotAt} desc, ${assetSnapshots.createdAt} desc, ${assetSnapshots.id} desc)`.as("rn"),
        })
        .from(assetSnapshots)
        .as("ranked")
      const rows = this.db
        .select({ assetItemId: ranked.assetItemId, snapshotAt: ranked.snapshotAt, valueAmount: ranked.valueAmount })
        .from(ranked)
        .where(lte(ranked.rn, limitPerAsset))
        .orderBy(asc(ranked.assetItemId), asc(ranked.snapshotAt))
        .all()
      return ok(rows.map((row) => ({
        assetItemId: row.assetItemId,
        snapshotAt: row.snapshotAt,
        valueNumber: row.valueAmount,
      })))
    } catch (error) {
      return fail(error)
    }
  }

  async addAssetSnapshot(input: AddAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const id = newId("snap")
      const timestamp = nowIso()
      this.db
        .insert(assetSnapshots)
        .values({
          id,
          assetItemId: toSqlId(input.assetItemId),
          snapshotAt: input.snapshotAt ?? timestamp,
          valueAmount: input.valueAmount,
          valueCurrency: normalizeCurrency(input.valueCurrency),
          quantityAmount: input.quantityAmount ?? null,
          quantityUnit: input.quantityUnit ?? null,
          costBasisAmount: input.costBasisAmount ?? null,
          costBasisCurrency: input.costBasisCurrency ? normalizeCurrency(input.costBasisCurrency) : null,
          sourceKind: (input.sourceKind ?? "manual") as AssetSnapshotInsert["sourceKind"],
          note: input.note ?? null,
          createdAt: timestamp,
        })
        .run()
      return ok(this.mapAssetSnapshot((await this.oneAssetSnapshot(id))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetSnapshot(input: UpdateAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const set: Partial<AssetSnapshotInsert> = {}
      if (input.snapshotAt !== undefined) set.snapshotAt = input.snapshotAt
      if (input.valueAmount !== undefined) set.valueAmount = input.valueAmount
      if (input.valueCurrency !== undefined) set.valueCurrency = normalizeCurrency(input.valueCurrency)
      if (input.quantityAmount !== undefined) set.quantityAmount = input.quantityAmount
      if (input.quantityUnit !== undefined) set.quantityUnit = input.quantityUnit
      if (input.costBasisAmount !== undefined) set.costBasisAmount = input.costBasisAmount
      if (input.costBasisCurrency !== undefined) set.costBasisCurrency = input.costBasisCurrency
      if (input.note !== undefined) set.note = input.note
      if (Object.keys(set).length > 0) {
        this.db.update(assetSnapshots).set(set).where(eq(assetSnapshots.id, toSqlId(input.id))).run()
      }
      return ok(this.mapAssetSnapshot((await this.oneAssetSnapshot(input.id))!))
    } catch (error) {
      return fail(error)
    }
  }

  async deleteAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db.delete(assetSnapshots).where(eq(assetSnapshots.id, toSqlId(input.id))).run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async upsertAssetSnapshot(input: UpsertAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      let assetItemId = input.assetItemId == null ? null : toSqlId(input.assetItemId)
      if (assetItemId == null) {
        const existing = this.db
          .select({ id: assetItems.id })
          .from(assetItems)
          .where(and(eq(assetItems.name, input.accountName), isNull(assetItems.archivedAt)))
          .orderBy(desc(assetItems.createdAt))
          .limit(1)
          .get()
        if (existing) {
          assetItemId = existing.id
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
        const amount = Number(row.valueAmount ?? 0)
        const currency = normalizeCurrency(row.valueCurrency)
        const date = String(row.snapshotAt).slice(0, 10)
        const converted = currency === displayCurrency
          ? amount
          : await this.convertAmount(amount, currency, displayCurrency, date)
        if (converted == null) {
          missingFx.push({ assetItemId: row.assetItemId, currency, date })
          continue
        }
        if (row.assetType === "liability") liabilityValue += converted
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
      const rows = this.db
        .select({ ...getTableColumns(assetSnapshots), assetType: assetItems.assetType, assetName: assetItems.name })
        .from(assetSnapshots)
        .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
        .where(eq(assetSnapshots.assetItemId, toSqlId(input.assetItemId)))
        .orderBy(desc(assetSnapshots.snapshotAt), desc(assetSnapshots.createdAt), desc(assetSnapshots.id))
        .all()
      if (rows.length < 2) return ok(null)
      const latest = rows[0]
      const comparison = rows[1]
      const latestValue = Number(latest.valueAmount)
      const comparisonValue = Number(comparison.valueAmount)
      const change = latestValue - comparisonValue
      const percent = comparisonValue === 0 ? 0 : change / comparisonValue
      return ok({
        assetItemId: input.assetItemId,
        changeAmount: change.toFixed(2),
        changePercent: percent.toFixed(6),
        comparisonLabel: "previous_snapshot",
        valueCurrency: latest.valueCurrency,
      })
    } catch (error) {
      return fail(error)
    }
  }
}
