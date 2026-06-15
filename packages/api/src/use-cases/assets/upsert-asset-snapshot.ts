/**
 * @purpose Implement the multi-step workflow for creating or updating an asset snapshot.
 * @role    Asset use case called by the SQLite-backed API facade.
 * @deps    Asset repository, asset domain rules, and API utility helpers.
 * @gotcha  This workflow may create a missing asset item, but never derives values from cashflow.
 */

import type { UpsertAssetSnapshotInput } from "@flowm/shared/contracts"
import { normalizeAssetType } from "../../domain/assets/asset-rules"
import {
  DEFAULT_CURRENCY,
  newId,
  normalizeCurrency,
  nowIso,
  toSqlId,
} from "../../shared/api-helpers"

type AssetSnapshotSourceKind = "manual" | "import" | "system"

type UpsertAssetItem = {
  id: string
  name: string
  assetType: ReturnType<typeof normalizeAssetType>
  institution: string | null
  defaultCurrency: string
  valuationMethod: "manual_balance"
  displayOrder: number
  note: string | null
  createdAt: string
  updatedAt: string
}

type UpsertAssetSnapshot = {
  id: string
  assetItemId: string
  snapshotAt: string
  valueAmount: string
  valueCurrency: string
  quantityAmount: string | null
  quantityUnit: string | null
  costBasisAmount: string | null
  costBasisCurrency: string | null
  sourceKind: AssetSnapshotSourceKind
  note: string | null
  createdAt: string
}

type UpsertAssetSnapshotUpdate = Partial<
  Pick<
    UpsertAssetSnapshot,
    "snapshotAt" | "valueAmount" | "valueCurrency" | "quantityAmount" | "quantityUnit" | "note"
  >
>

export type UpsertAssetSnapshotResult = UpsertAssetSnapshot & {
  assetName: string
  assetType: ReturnType<typeof normalizeAssetType>
  institution: string | null
  defaultCurrency: string
}

export type UpsertAssetSnapshotRepository = {
  findActiveItemByName(name: string): Pick<UpsertAssetItem, "id"> | undefined
  insertItem(values: UpsertAssetItem): void
  insertSnapshot(values: UpsertAssetSnapshot): void
  updateSnapshot(id: string, values: UpsertAssetSnapshotUpdate): void
  getSnapshot(id: string): UpsertAssetSnapshotResult | null
}

export async function upsertAssetSnapshotUseCase(
  repository: UpsertAssetSnapshotRepository,
  input: UpsertAssetSnapshotInput,
): Promise<UpsertAssetSnapshotResult> {
  let assetItemId = input.assetItemId == null ? null : toSqlId(input.assetItemId)
  const timestamp = nowIso()
  if (assetItemId == null) {
    const existing = repository.findActiveItemByName(input.accountName)
    if (existing) {
      assetItemId = existing.id
    } else {
      assetItemId = newId("asset")
      const item: UpsertAssetItem = {
        id: assetItemId,
        name: input.accountName,
        assetType: normalizeAssetType(input.assetType),
        institution: null,
        defaultCurrency: normalizeCurrency(input.valueCurrency ?? DEFAULT_CURRENCY),
        valuationMethod: "manual_balance",
        displayOrder: 0,
        note: input.note ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      repository.insertItem(item)
    }
  }

  if (input.id != null) {
    const set: UpsertAssetSnapshotUpdate = {}
    if (input.snapshotAt !== undefined) set.snapshotAt = input.snapshotAt
    if (input.valueNumber !== undefined) set.valueAmount = input.valueNumber
    if (input.valueCurrency !== undefined)
      set.valueCurrency = normalizeCurrency(input.valueCurrency)
    if (input.quantityNumber !== undefined) set.quantityAmount = input.quantityNumber
    if (input.quantityCurrency !== undefined) set.quantityUnit = input.quantityCurrency
    if (input.note !== undefined) set.note = input.note
    const snapshotId = toSqlId(input.id)
    if (Object.keys(set).length > 0) repository.updateSnapshot(snapshotId, set)
    return repository.getSnapshot(snapshotId)!
  }

  const id = newId("snap")
  repository.insertSnapshot({
    id,
    assetItemId,
    snapshotAt: input.snapshotAt ?? timestamp,
    valueAmount: input.valueNumber,
    valueCurrency: normalizeCurrency(input.valueCurrency),
    quantityAmount: input.quantityNumber ?? null,
    quantityUnit: input.quantityCurrency ?? null,
    costBasisAmount: null,
    costBasisCurrency: null,
    sourceKind: (input.source ?? "manual") as AssetSnapshotSourceKind,
    note: input.note ?? null,
    createdAt: timestamp,
  })
  return repository.getSnapshot(id)!
}
