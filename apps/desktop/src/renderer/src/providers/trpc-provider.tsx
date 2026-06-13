import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import { queryClient } from "@/lib/trpc"

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  )
}
