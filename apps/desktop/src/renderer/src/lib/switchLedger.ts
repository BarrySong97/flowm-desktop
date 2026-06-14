/**
 * @purpose Provide renderer switch ledger helper functions.
 * @role    Shared utility module for React feature code.
 * @deps    Browser-safe TypeScript utilities and local domain types.
 * @gotcha  Keep Node, Electron main, and SQLite access behind preload/tRPC.
 */

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

/**
 * Returns a function that runs a ledger-switching mutation, then clears the react-query
 * cache and routes home so every page remounts and refetches against the now-active
 * ledger. No window reload — the active SQLite is swapped in the main process and the
 * next request transparently hits it.
 */
export function useLedgerSwitch(): (run: () => Promise<unknown>) => Promise<void> {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useCallback(
    async (run: () => Promise<unknown>) => {
      await run()
      queryClient.clear()
      await router.navigate({ to: "/" })
    },
    [queryClient, router],
  )
}
