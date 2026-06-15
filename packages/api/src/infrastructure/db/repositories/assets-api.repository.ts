/**
 * @purpose Implement assets persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { type AssetItemInsert, type AssetSnapshotInsert } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  AddAssetSnapshotInput,
  AssetChangeInput,
  AssetChangeSummary,
  AssetItemSummary,
  AssetSnapshotSummary,
  AssetSparklinePoint,
  CreateAssetItemInput,
  FlowmId,
  ListAssetItemsInput,
  ListAssetSnapshotsInput,
  ListAssetSparklinesInput,
  NetWorthInput,
  NetWorthSnapshot,
  UpdateAssetItemInput,
  UpdateAssetSnapshotInput,
} from "../../../index"
import { normalizeAssetType } from "../../../domain/assets/asset-rules"
import { createAssetsRepository } from "./assets.repository"
import { mapAssetItem, mapAssetSnapshot } from "../../../presentation/mappers/sqlite-row-mappers"
import { CashflowApiRepository } from "./cashflow-api.repository"
import { fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "../../../shared/api-helpers"

export abstract class AssetsApiRepository extends CashflowApiRepository {
  protected assetRepository(): ReturnType<typeof createAssetsRepository> {
    return createAssetsRepository(this.db)
  }

  async listAssetItems(input: ListAssetItemsInput = {}): Promise<Result<AssetItemSummary[]>> {
    try {
      const repository = this.assetRepository()
      return ok(repository.listItems(input).map((row) => mapAssetItem(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createAssetItem(input: CreateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const repository = this.assetRepository()
      const id = newId("asset")
      const timestamp = nowIso()
      repository.insertItem({
        id,
        name: input.name,
        assetType: normalizeAssetType(input.assetType),
        institution: input.institution ?? null,
        defaultCurrency: normalizeCurrency(input.defaultCurrency),
        valuationMethod: (input.valuationMethod ??
          "manual_balance") as AssetItemInsert["valuationMethod"],
        displayOrder: input.displayOrder ?? 0,
        note: input.note ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      return ok(mapAssetItem(repository.getItem(id)!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetItem(input: UpdateAssetItemInput): Promise<Result<AssetItemSummary>> {
    try {
      const repository = this.assetRepository()
      const set: Partial<AssetItemInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.assetType !== undefined) set.assetType = normalizeAssetType(input.assetType)
      if (input.institution !== undefined) set.institution = input.institution
      if (input.defaultCurrency !== undefined)
        set.defaultCurrency = normalizeCurrency(input.defaultCurrency)
      if (input.valuationMethod !== undefined)
        set.valuationMethod = input.valuationMethod as AssetItemInsert["valuationMethod"]
      if (input.displayOrder !== undefined) set.displayOrder = input.displayOrder
      if (input.note !== undefined) set.note = input.note
      repository.updateItem(input.id, set)
      return ok(mapAssetItem(repository.getItem(input.id)!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveAssetItem(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.assetRepository().archiveItem(input.id, nowIso())
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSnapshots(
    input: ListAssetSnapshotsInput = {},
  ): Promise<Result<AssetSnapshotSummary[]>> {
    try {
      const repository = this.assetRepository()
      const rows = input.latestOnly
        ? repository.listLatestSnapshots(input)
        : repository.listSnapshots(input)
      return ok(rows.map((row) => mapAssetSnapshot(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async listAssetSparklines(
    input: ListAssetSparklinesInput = {},
  ): Promise<Result<AssetSparklinePoint[]>> {
    try {
      const limitPerAsset = input.limitPerAsset ?? 30
      const rows = this.assetRepository().listSparklinePoints(limitPerAsset)
      return ok(
        rows.map((row) => ({
          assetItemId: row.assetItemId,
          snapshotAt: row.snapshotAt,
          valueNumber: row.valueAmount,
        })),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async addAssetSnapshot(input: AddAssetSnapshotInput): Promise<Result<AssetSnapshotSummary>> {
    try {
      const repository = this.assetRepository()
      const id = newId("snap")
      const timestamp = nowIso()
      repository.insertSnapshot({
        id,
        assetItemId: toSqlId(input.assetItemId),
        snapshotAt: input.snapshotAt ?? timestamp,
        valueAmount: input.valueAmount,
        valueCurrency: normalizeCurrency(input.valueCurrency),
        quantityAmount: input.quantityAmount ?? null,
        quantityUnit: input.quantityUnit ?? null,
        costBasisAmount: input.costBasisAmount ?? null,
        costBasisCurrency: input.costBasisCurrency
          ? normalizeCurrency(input.costBasisCurrency)
          : null,
        sourceKind: (input.sourceKind ?? "manual") as AssetSnapshotInsert["sourceKind"],
        note: input.note ?? null,
        createdAt: timestamp,
      })
      return ok(mapAssetSnapshot(repository.getSnapshot(id)!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateAssetSnapshot(
    input: UpdateAssetSnapshotInput,
  ): Promise<Result<AssetSnapshotSummary>> {
    try {
      const repository = this.assetRepository()
      const set: Partial<AssetSnapshotInsert> = {}
      if (input.snapshotAt !== undefined) set.snapshotAt = input.snapshotAt
      if (input.valueAmount !== undefined) set.valueAmount = input.valueAmount
      if (input.valueCurrency !== undefined)
        set.valueCurrency = normalizeCurrency(input.valueCurrency)
      if (input.quantityAmount !== undefined) set.quantityAmount = input.quantityAmount
      if (input.quantityUnit !== undefined) set.quantityUnit = input.quantityUnit
      if (input.costBasisAmount !== undefined) set.costBasisAmount = input.costBasisAmount
      if (input.costBasisCurrency !== undefined) set.costBasisCurrency = input.costBasisCurrency
      if (input.note !== undefined) set.note = input.note
      if (Object.keys(set).length > 0) {
        repository.updateSnapshot(input.id, set)
      }
      return ok(mapAssetSnapshot(repository.getSnapshot(input.id)!))
    } catch (error) {
      return fail(error)
    }
  }

  async deleteAssetSnapshot(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.assetRepository().deleteSnapshot(input.id)
      return ok(undefined)
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
      const displayCurrency = normalizeCurrency(
        input.displayCurrency ?? settings.data.displayCurrency,
      )
      const rows = this.assetRepository().listLatestSnapshots({})
      let assetValue = 0
      let liabilityValue = 0
      const missingFx: NetWorthSnapshot["missingFx"] = []
      for (const row of rows) {
        const amount = Number(row.valueAmount ?? 0)
        const currency = normalizeCurrency(row.valueCurrency)
        const date = String(row.snapshotAt).slice(0, 10)
        const converted =
          currency === displayCurrency
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
      const rows = this.assetRepository().listSnapshotsForChange(input.assetItemId)
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
