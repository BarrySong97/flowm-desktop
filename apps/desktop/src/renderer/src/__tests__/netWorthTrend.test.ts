/**
 * @purpose Verify dashboard net worth trend calculations in the renderer test suite.
 * @role    Regression test for Overview's month-end asset snapshot carry-forward behavior.
 * @deps    Vitest and the pure dashboard net worth trend helper.
 * @gotcha  Keep assertions independent of live SQLite data and current wall-clock time.
 */

import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/shared/contracts"
import { describe, expect, it } from "vitest"
import { buildNetWorthTrend } from "../dashboard/netWorthTrend"

function snapshot(input: {
  id: string
  assetItemId: string
  assetType?: AssetSnapshotType
  snapshotAt: string
  valueNumber: string
  valueCurrency?: string
}): AssetSnapshotSummary {
  return {
    id: input.id,
    assetItemId: input.assetItemId,
    accountName: input.assetItemId,
    assetType: input.assetType ?? "bank",
    snapshotAt: input.snapshotAt,
    quantityNumber: null,
    quantityCurrency: null,
    quantityAmount: null,
    quantityUnit: null,
    valueNumber: input.valueNumber,
    valueCurrency: input.valueCurrency ?? "CNY",
    source: "manual",
    note: null,
    meta: null,
  }
}

describe("buildNetWorthTrend", () => {
  const identityRate = (amount: number) => amount

  it("carries each account's latest known snapshot into later month-end totals", () => {
    const trend = buildNetWorthTrend(
      [
        snapshot({
          id: "snap_bank_may",
          assetItemId: "bank",
          snapshotAt: "2026-05-10T00:00:00.000Z",
          valueNumber: "10000",
        }),
        snapshot({
          id: "snap_wallet_may",
          assetItemId: "wallet",
          snapshotAt: "2026-05-20T00:00:00.000Z",
          valueNumber: "2000",
        }),
        snapshot({
          id: "snap_wallet_june",
          assetItemId: "wallet",
          snapshotAt: "2026-06-15T00:00:00.000Z",
          valueNumber: "3000",
        }),
      ],
      identityRate,
      new Date("2026-06-30T00:00:00.000Z"),
    )

    expect(trend[trend.length - 2]).toBe(12000)
    expect(trend[trend.length - 1]).toBe(13000)
  })

  it("subtracts liability snapshots from carried-forward asset totals", () => {
    const trend = buildNetWorthTrend(
      [
        snapshot({
          id: "snap_bank",
          assetItemId: "bank",
          snapshotAt: "2026-05-10T00:00:00.000Z",
          valueNumber: "10000",
        }),
        snapshot({
          id: "snap_card",
          assetItemId: "card",
          assetType: "liability",
          snapshotAt: "2026-05-12T00:00:00.000Z",
          valueNumber: "1500",
        }),
      ],
      identityRate,
      new Date("2026-06-30T00:00:00.000Z"),
    )

    expect(trend[trend.length - 2]).toBe(8500)
    expect(trend[trend.length - 1]).toBe(8500)
  })

  it("pads months before the first known snapshot with the first known net worth", () => {
    const trend = buildNetWorthTrend(
      [
        snapshot({
          id: "snap_bank",
          assetItemId: "bank",
          snapshotAt: "2026-06-10T00:00:00.000Z",
          valueNumber: "10000",
        }),
      ],
      identityRate,
      new Date("2026-06-30T00:00:00.000Z"),
    )

    expect(trend[0]).toBe(10000)
    expect(trend[trend.length - 1]).toBe(10000)
  })
})
