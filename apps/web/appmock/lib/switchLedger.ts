/**
 * @purpose Inert ledger-switch helper for the marketing app mock.
 * @role    Stubs the renderer's useLedgerSwitch so the verbatim-copied LedgerSection compiles.
 * @gotcha  Switching is a no-op here — the mock has a single static ledger and no real data.
 */

import { useCallback } from "react"

/**
 * Returns a function that "runs" a ledger-switching mutation. In the mock it
 * simply awaits the passed work and never navigates or reloads.
 */
export function useLedgerSwitch(): (run: () => Promise<unknown>) => Promise<void> {
  return useCallback(async (run: () => Promise<unknown>) => {
    await run()
  }, [])
}
