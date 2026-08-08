/**
 * @purpose Describe ledger lifecycle operations consumed by the desktop tRPC router.
 * @role    Runtime-neutral contract implemented by the Tauri data sidecar.
 * @deps    Ledger-facing value types only.
 * @gotcha  Native picker and reveal behavior may differ by runtime, but data semantics must not.
 */

export interface LedgerRecord {
  id: string
  name: string
  /** Filename relative to userData for built-in/created ledgers, or an absolute imported path. */
  file: string
  isDemo: boolean
  createdAt: string
}

export interface LedgerListEntry {
  id: string
  name: string
  isDemo: boolean
  active: boolean
}

export interface ActiveLedger {
  id: string
  name: string
  isDemo: boolean
}

export interface LedgerService {
  list(): LedgerListEntry[]
  getActive(): ActiveLedger
  create(name: string): Promise<LedgerRecord>
  switchTo(id: string): void
  switchToPersonal(): void
  rename(id: string, name: string): void
  remove(id: string): void
  setDemo(id: string, isDemo: boolean): void
  importFromFile(): Promise<LedgerRecord | null>
  revealInFinder(id: string): void
}
