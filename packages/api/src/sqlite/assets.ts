import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { AddAssetSnapshotInput, AssetChangeInput, AssetChangeSummary, AssetItemSummary, AssetSnapshotSummary, AssetSparklinePoint, CreateAssetItemInput, FlowmId, ListAssetItemsInput, ListAssetSnapshotsInput, ListAssetSparklinesInput, NetWorthInput, NetWorthSnapshot, UpdateAssetItemInput, UpdateAssetSnapshotInput, UpsertAssetSnapshotInput } from "../index"
import { CashflowApi } from "./cashflow"
import { DEFAULT_CURRENCY, fail, newId, normalizeAssetType, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class AssetsApi extends CashflowApi {
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


}
