/**
 * @purpose Mock tRPC option proxy + provider so verbatim-copied renderer pages render with static data.
 * @role    Replaces the real IPC-backed tRPC client with an in-memory registry of canned responses.
 * @gotcha  Each page wraps itself in <MockProvider data={...}> which registers that page's datasets
 *          (keyed by dotted tRPC path) and gets its own QueryClient, so pages never share data.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { useState } from "react"
import type { ReactNode } from "react"
import { setMockPathname } from "@mock/_shim/router"

const registry = new Map<string, unknown>()

export function registerMock(path: string, data: unknown): void {
  registry.set(path, data)
}

export function getMock(path: string): unknown {
  return registry.get(path)
}

// Strip the trailing tRPC helper name to recover the data path, e.g.
// "cashflow.list.queryOptions" -> "cashflow.list".
const HELPER_RE =
  /\.(queryOptions|mutationOptions|infiniteQueryOptions|queryKey|queryFilter|pathKey)$/

/**
 * Recursive callable proxy. Any path resolves to a function; calling it (as
 * `.queryOptions(args)` / `.mutationOptions(args)`) yields options carrying both a
 * queryFn (with initialData) and a no-op mutationFn so useQuery AND useMutation work.
 */
function makeProxy(prefix: string): any {
  const target = () => {}
  return new Proxy(target, {
    get(_t, key) {
      if (typeof key !== "string") return undefined
      return makeProxy(prefix ? `${prefix}.${key}` : key)
    },
    apply() {
      const dataPath = prefix.replace(HELPER_RE, "")
      const options: UseQueryOptions<any, Error, any, any> & {
        mutationFn: () => Promise<unknown>
      } = {
        queryKey: [dataPath],
        queryFn: async () => getMock(dataPath) as any,
        initialData: getMock(dataPath) as any,
        mutationFn: async () => undefined,
      }
      return options
    },
  })
}

/**
 * Typed shape so `useQuery`/`useMutation` infer `data` as `any` (not `{}`) without
 * enumerating every endpoint. Each leaf accepts queryOptions/mutationOptions/queryKey.
 */
type Endpoint = {
  queryOptions: (args?: unknown) => UseQueryOptions<any, Error, any, any>
  mutationOptions: (args?: unknown) => UseQueryOptions<any, Error, any, any>
  queryKey: (args?: unknown) => unknown[]
}
type MockNode = Endpoint & { [key: string]: MockNode }

export const trpc = makeProxy("") as unknown as MockNode

/**
 * Wrap a page with its own dataset. The data map is keyed by dotted tRPC path
 * (e.g. "cashflow.list"). A fresh QueryClient per provider keeps page caches isolated.
 */
export function MockProvider({
  data,
  path,
  children,
}: {
  data?: Record<string, unknown>
  /** Drives the mock router pathname so page route-guards render their default view. */
  path?: string
  children: ReactNode
}) {
  if (data) {
    for (const [key, value] of Object.entries(data)) registerMock(key, value)
  }
  if (path) setMockPathname(path)
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
