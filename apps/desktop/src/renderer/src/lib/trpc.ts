import { QueryClient } from "@tanstack/react-query"
import { createTRPCClient } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../main/trpc/router"
import { installQueryClientPerfLogger } from "./debug/perf"
import { ipcTRPCLink } from "./ipc-trpc-link"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30_000,
    },
  },
})

installQueryClientPerfLogger(queryClient)

const trpcClient = createTRPCClient<AppRouter>({
  links: [ipcTRPCLink()],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

export type RouterOutputs = inferRouterOutputs<AppRouter>
