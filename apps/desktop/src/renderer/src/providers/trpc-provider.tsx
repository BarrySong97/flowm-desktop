/**
 * @purpose Provide trpc provider wiring for renderer React context.
 * @role    Top-level renderer provider used by App.
 * @deps    React context, tRPC client, and preload IPC link.
 * @gotcha  Keep provider setup browser-safe and typed against preload APIs.
 */

import { useEffect, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import { queryClient } from "@/lib/trpc"

export function TRPCProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return window.flowm.onLedgerChanged(() => {
      void queryClient.invalidateQueries()
    })
  }, [])

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  )
}
