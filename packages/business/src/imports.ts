import type { ISODate } from "@flowm/shared"

export interface ImportedEntryInput {
  sourceName: string
  externalId?: string | null
  date: ISODate
  payee?: string | null
  narration?: string | null
  amountNumber: string
  currency: string
  accountName: string
}

export interface ImportMapping {
  cashAccount: string
  expenseAccount: string
  incomeAccount: string
}

function stablePayload(entry: ImportedEntryInput): string {
  return [
    entry.sourceName,
    entry.externalId ?? "",
    entry.date,
    entry.payee ?? "",
    entry.narration ?? "",
    entry.amountNumber,
    entry.currency,
    entry.accountName,
  ].join("\u001f")
}

export class ImportReconciliationService {
  hashImportedEntry(entry: ImportedEntryInput): string {
    let hash = 0x811c9dc5
    for (const char of stablePayload(entry)) {
      hash ^= char.charCodeAt(0)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
    return hash.toString(16).padStart(8, "0")
  }

  dedupeImportedEntries(entries: ImportedEntryInput[]): ImportedEntryInput[] {
    const seen = new Set<string>()
    return entries.filter((entry) => {
      const hash = this.hashImportedEntry(entry)
      if (seen.has(hash)) return false
      seen.add(hash)
      return true
    })
  }

}
