import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const assetSnapshots = sqliteTable(
  "asset_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountName: text("account_name").notNull(),
    assetType: text("asset_type", {
      enum: ["cash", "bank", "wallet", "investment", "fixed_asset", "liability", "other"],
    }).notNull(),
    snapshotAt: text("snapshot_at").notNull(),
    quantityNumber: text("quantity_number"),
    quantityCurrency: text("quantity_currency"),
    valueNumber: text("value_number").notNull(),
    valueCurrency: text("value_currency").notNull(),
    source: text("source").notNull().default("manual"),
    note: text("note"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    accountIdx: index("idx_asset_snapshots_account").on(t.accountName),
    typeIdx: index("idx_asset_snapshots_type").on(t.assetType),
    snapshotIdx: index("idx_asset_snapshots_snapshot_at").on(t.snapshotAt),
    sourceIdx: index("idx_asset_snapshots_source").on(t.source),
  }),
)

export type AssetSnapshotRow = typeof assetSnapshots.$inferSelect
export type AssetSnapshotInsert = typeof assetSnapshots.$inferInsert
