import type { NormalizedStatementEntry, StatementParseSummary } from "./types"

export function summarizeEntries(entries: NormalizedStatementEntry[]): StatementParseSummary {
  const byClassification = {} as StatementParseSummary["byClassification"]
  const byAccount: Record<string, number> = {}
  let income = 0
  let expense = 0
  let neutral = 0
  let ignored = 0
  for (const entry of entries) {
    if (entry.direction === "income") income += 1
    else if (entry.direction === "expense") expense += 1
    else neutral += 1
    if (entry.classification === "closed_or_failed") ignored += 1
    byClassification[entry.classification] = (byClassification[entry.classification] ?? 0) + 1
    byAccount[entry.sourceAccountName] = (byAccount[entry.sourceAccountName] ?? 0) + 1
  }
  return {
    total: entries.length,
    income,
    expense,
    neutral,
    ignored,
    byClassification,
    byAccount,
  }
}
