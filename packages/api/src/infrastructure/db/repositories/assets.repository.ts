/**
 * @purpose Encapsulate SQLite persistence for asset items and snapshots.
 * @role    Infrastructure repository used by asset use cases and the API facade.
 * @deps    @flowm/db schema and Drizzle query builder.
 * @gotcha  Repositories persist snapshots only; they must not infer balances from cashflow imports.
 */

import { and, asc, desc, eq, getTableColumns, isNull, lte, sql, type SQL } from "drizzle-orm"
import {
  assetItems,
  assetSnapshots,
  type AssetItemInsert,
  type AssetItemRow,
  type AssetSnapshotInsert,
  type AssetSnapshotRow,
  type Database,
} from "@flowm/db"
import type { FlowmId, ListAssetItemsInput, ListAssetSnapshotsInput } from "@flowm/shared/contracts"
import { toSqlId } from "../../../shared/api-helpers"

export type AssetSnapshotWithItem = AssetSnapshotRow & {
  assetName: string
  assetType: AssetItemRow["assetType"]
  institution: string | null
  defaultCurrency: string
}

export type AssetSparklineRow = {
  assetItemId: string
  snapshotAt: string
  valueAmount: string
}

export type AssetChangeRow = AssetSnapshotRow & {
  assetType: AssetItemRow["assetType"]
  assetName: string
}

export function createAssetsRepository(db: Database) {
  return {
    listItems(input: ListAssetItemsInput = {}): AssetItemRow[] {
      const conds: SQL[] = []
      if (input.assetType) conds.push(eq(assetItems.assetType, input.assetType))
      if (!input.includeArchived) conds.push(isNull(assetItems.archivedAt))
      return db
        .select()
        .from(assetItems)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(asc(assetItems.displayOrder), asc(assetItems.name))
        .all()
    },

    findActiveItemByName(name: string): Pick<AssetItemRow, "id"> | undefined {
      return db
        .select({ id: assetItems.id })
        .from(assetItems)
        .where(and(eq(assetItems.name, name), isNull(assetItems.archivedAt)))
        .orderBy(desc(assetItems.createdAt))
        .limit(1)
        .get()
    },

    getItem(id: FlowmId): AssetItemRow | undefined {
      return db
        .select()
        .from(assetItems)
        .where(eq(assetItems.id, toSqlId(id)))
        .get()
    },

    insertItem(values: AssetItemInsert): void {
      db.insert(assetItems).values(values).run()
    },

    updateItem(id: FlowmId, values: Partial<AssetItemInsert>): void {
      db.update(assetItems)
        .set(values)
        .where(eq(assetItems.id, toSqlId(id)))
        .run()
    },

    archiveItem(id: FlowmId, timestamp: string): void {
      db.update(assetItems)
        .set({ archivedAt: timestamp, updatedAt: timestamp })
        .where(eq(assetItems.id, toSqlId(id)))
        .run()
    },

    listSnapshots(input: ListAssetSnapshotsInput = {}): AssetSnapshotWithItem[] {
      const conds: SQL[] = []
      if (input.assetItemId) conds.push(eq(assetSnapshots.assetItemId, toSqlId(input.assetItemId)))
      if (input.accountName) conds.push(eq(assetItems.name, input.accountName))
      return db
        .select({
          ...getTableColumns(assetSnapshots),
          assetName: assetItems.name,
          assetType: assetItems.assetType,
          institution: assetItems.institution,
          defaultCurrency: assetItems.defaultCurrency,
        })
        .from(assetSnapshots)
        .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(assetSnapshots.snapshotAt), desc(assetSnapshots.createdAt))
        .all()
    },

    listLatestSnapshots(input: ListAssetSnapshotsInput = {}): AssetSnapshotWithItem[] {
      const latestId = sql`(
        select s2.id from ${assetSnapshots} s2
        where s2.asset_item_id = ${assetSnapshots.assetItemId}
        order by s2.snapshot_at desc, s2.created_at desc, s2.id desc
        limit 1
      )`
      const conds: SQL[] = [sql`${assetSnapshots.id} = ${latestId}`]
      if (input.assetItemId) conds.push(eq(assetSnapshots.assetItemId, toSqlId(input.assetItemId)))
      if (input.accountName) conds.push(eq(assetItems.name, input.accountName))
      return db
        .select({
          ...getTableColumns(assetSnapshots),
          assetName: assetItems.name,
          assetType: assetItems.assetType,
          institution: assetItems.institution,
          defaultCurrency: assetItems.defaultCurrency,
        })
        .from(assetSnapshots)
        .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
        .where(and(...conds))
        .orderBy(asc(assetItems.displayOrder), asc(assetItems.name))
        .all()
    },

    getSnapshot(id: FlowmId): AssetSnapshotWithItem | null {
      const row = db
        .select({
          ...getTableColumns(assetSnapshots),
          assetName: assetItems.name,
          assetType: assetItems.assetType,
          institution: assetItems.institution,
          defaultCurrency: assetItems.defaultCurrency,
        })
        .from(assetSnapshots)
        .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
        .where(eq(assetSnapshots.id, toSqlId(id)))
        .get()
      return row ?? null
    },

    insertSnapshot(values: AssetSnapshotInsert): void {
      db.insert(assetSnapshots).values(values).run()
    },

    updateSnapshot(id: FlowmId, values: Partial<AssetSnapshotInsert>): void {
      db.update(assetSnapshots)
        .set(values)
        .where(eq(assetSnapshots.id, toSqlId(id)))
        .run()
    },

    deleteSnapshot(id: FlowmId): void {
      db.delete(assetSnapshots)
        .where(eq(assetSnapshots.id, toSqlId(id)))
        .run()
    },

    listSparklinePoints(limitPerAsset: number): AssetSparklineRow[] {
      const ranked = db
        .select({
          assetItemId: assetSnapshots.assetItemId,
          snapshotAt: assetSnapshots.snapshotAt,
          valueAmount: assetSnapshots.valueAmount,
          rn: sql<number>`row_number() over (partition by ${assetSnapshots.assetItemId} order by ${assetSnapshots.snapshotAt} desc, ${assetSnapshots.createdAt} desc, ${assetSnapshots.id} desc)`.as(
            "rn",
          ),
        })
        .from(assetSnapshots)
        .as("ranked")
      return db
        .select({
          assetItemId: ranked.assetItemId,
          snapshotAt: ranked.snapshotAt,
          valueAmount: ranked.valueAmount,
        })
        .from(ranked)
        .where(lte(ranked.rn, limitPerAsset))
        .orderBy(asc(ranked.assetItemId), asc(ranked.snapshotAt))
        .all()
    },

    listSnapshotsForChange(assetItemId: FlowmId): AssetChangeRow[] {
      return db
        .select({
          ...getTableColumns(assetSnapshots),
          assetType: assetItems.assetType,
          assetName: assetItems.name,
        })
        .from(assetSnapshots)
        .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
        .where(eq(assetSnapshots.assetItemId, toSqlId(assetItemId)))
        .orderBy(
          desc(assetSnapshots.snapshotAt),
          desc(assetSnapshots.createdAt),
          desc(assetSnapshots.id),
        )
        .all()
    },
  }
}
