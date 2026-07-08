/**
 * @purpose Calculate dashboard net worth trend points from asset snapshot history.
 * @role    Pure renderer-domain helper used by Overview and regression tests.
 * @deps    Asset snapshot contracts and caller-provided FX conversion.
 * @gotcha  Trend points are as-of month-end values; balances carry forward until replaced.
 */

import type { AssetSnapshotSummary } from "@flowm/shared/contracts"

type ToDisplay = (amount: number, currency?: string | null) => number | null

function monthKey(value: string): string {
  return value.slice(0, 7)
}

function monthEndDateKey(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number)
  return new Date(Date.UTC(year, monthIndex, 0)).toISOString().slice(0, 10)
}

function addMonths(month: string, offset: number): string {
  const [year, monthIndex] = month.split("-").map(Number)
  const next = new Date(Date.UTC(year, monthIndex - 1 + offset, 1))
  return next.toISOString().slice(0, 7)
}

function latestSnapshotAsOf(
  snapshots: AssetSnapshotSummary[],
  assetItemId: string,
  dateTo: string,
): AssetSnapshotSummary | null {
  for (const snapshot of snapshots) {
    if (
      String(snapshot.assetItemId) === assetItemId &&
      snapshot.snapshotAt.slice(0, 10) <= dateTo
    ) {
      return snapshot
    }
  }
  return null
}

export function buildNetWorthTrend(
  snapshots: AssetSnapshotSummary[],
  toDisplay: ToDisplay,
  asOf = new Date(),
): number[] {
  if (snapshots.length === 0) return Array.from({ length: 12 }, () => 0)

  const orderedSnapshots = [...snapshots].sort((a, b) => {
    const byDate = b.snapshotAt.localeCompare(a.snapshotAt)
    return byDate !== 0 ? byDate : String(b.id).localeCompare(String(a.id))
  })
  const assetIds = [...new Set(orderedSnapshots.map((snapshot) => String(snapshot.assetItemId)))]
  const endMonth = monthKey(asOf.toISOString())
  const months = Array.from({ length: 12 }, (_, index) => addMonths(endMonth, index - 11))

  const values = months.map((month) => {
    const dateTo = monthEndDateKey(month)
    let hasSnapshot = false
    const value = assetIds.reduce((sum, assetItemId) => {
      const snapshot = latestSnapshotAsOf(orderedSnapshots, assetItemId, dateTo)
      if (!snapshot) return sum
      hasSnapshot = true
      const amount = Math.abs(
        toDisplay(Number(snapshot.valueNumber || 0), snapshot.valueCurrency) ?? 0,
      )
      return sum + (snapshot.assetType === "liability" ? -amount : amount)
    }, 0)
    return hasSnapshot ? value : null
  })
  const firstKnown = values.find((value) => value != null) ?? 0
  return values.map((value) => value ?? firstKnown)
}
