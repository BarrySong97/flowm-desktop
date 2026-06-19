/**
 * @purpose Define browser-safe asset contracts shared by renderer and API.
 * @role    DTO and input type boundary for present asset snapshot workflows.
 * @deps    Shared Flowm contract primitives.
 * @gotcha  Asset snapshots are present-state records; do not infer them from imported cashflow.
 */

import type { FlowmId, MoneyAmount } from "../common/flowm-primitives.contract"

export type AssetType =
  | "cash"
  | "bank"
  | "wallet"
  | "brokerage"
  | "fund"
  | "stock"
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "fixed_asset"
  | "liability"
  | "other"

export type AssetSnapshotType = AssetType | "investment"

export interface AssetItemSummary {
  id: FlowmId
  name: string
  assetType: AssetType
  institution: string | null
  defaultCurrency: string
  valuationMethod: string
  archived: boolean
  archivedAt: string | null
  note: string | null
}

export interface ListAssetItemsInput {
  assetType?: AssetType
  includeArchived?: boolean
}

export interface CreateAssetItemInput {
  name: string
  assetType: AssetType | "investment"
  institution?: string | null
  defaultCurrency?: string
  valuationMethod?: string
  displayOrder?: number
  note?: string | null
}

export interface UpdateAssetItemInput extends Partial<CreateAssetItemInput> {
  id: FlowmId
}

export interface AssetSnapshotSummary {
  id: FlowmId
  assetItemId: FlowmId
  accountName: string
  assetType: AssetSnapshotType
  snapshotAt: string
  quantityNumber: string | null
  quantityCurrency: string | null
  quantityAmount: string | null
  quantityUnit: string | null
  valueNumber: string
  valueCurrency: string
  source: string
  note: string | null
  meta: Record<string, unknown> | null
}

export interface ListAssetSnapshotsInput {
  assetItemId?: FlowmId
  accountName?: string
  latestOnly?: boolean
  includeArchived?: boolean
}

export interface ListAssetSparklinesInput {
  limitPerAsset?: number
}

export interface AssetSparklinePoint {
  assetItemId: FlowmId
  snapshotAt: string
  valueNumber: string
}

export interface AddAssetSnapshotInput {
  assetItemId: FlowmId
  snapshotAt?: string
  valueAmount: string
  valueCurrency?: string
  quantityAmount?: string | null
  quantityUnit?: string | null
  costBasisAmount?: string | null
  costBasisCurrency?: string | null
  sourceKind?: string
  note?: string | null
}

export interface UpdateAssetSnapshotInput extends Partial<AddAssetSnapshotInput> {
  id: FlowmId
}

export interface UpsertAssetSnapshotInput {
  id?: FlowmId
  assetItemId?: FlowmId
  accountName: string
  assetType: AssetSnapshotType
  snapshotAt?: string
  quantityNumber?: string | null
  quantityCurrency?: string | null
  valueNumber: string
  valueCurrency?: string
  source?: string
  note?: string | null
  meta?: Record<string, unknown> | null
}

export interface NetWorthInput {
  asOf?: string
  displayCurrency?: string
}

export interface NetWorthSnapshot {
  netWorth: MoneyAmount
  assetValue: MoneyAmount
  liabilityValue: MoneyAmount
  missingFx: Array<{ assetItemId: FlowmId; currency: string; date: string }>
}

export interface AssetChangeInput {
  assetItemId: FlowmId
  comparison?: "previous" | "30d" | "90d" | "1y"
}

export interface AssetChangeSummary {
  assetItemId: FlowmId
  changeAmount: string
  changePercent: string
  comparisonLabel: string
  valueCurrency: string
}
