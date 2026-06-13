import { useEffect, useRef } from "react"
import type { QueryClient } from "@tanstack/react-query"

type PerfPayload = Record<string, unknown>

type QueryLike = {
  data?: unknown
  dataUpdatedAt?: number
  error?: unknown
  errorUpdatedAt?: number
  fetchStatus?: string
  isFetching?: boolean
  isLoading?: boolean
  isPending?: boolean
  status?: string
}

type PageQuery = {
  name: string
  query: QueryLike
}

const installedQueryClients = new WeakSet<QueryClient>()
const queryProfiles = new WeakMap<object, { cycle: number; fetchStatus?: string; startedAt?: number; status?: string }>()

function flowmPerfEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    const flag = window.localStorage.getItem("flowm:perf")
    if (flag != null) return flag !== "0" && flag !== "false"
  } catch {
    return false
  }
  return import.meta.env.DEV
}

export function roundMs(value: number): number {
  return Math.round(value * 10) / 10
}

function jsonLine(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function flowmPerfLog(scope: string, event: string, payload: PerfPayload = {}): void {
  if (!flowmPerfEnabled()) return
  console.info(`[flowm-perf] ${scope}.${event} ${jsonLine({
    atMs: roundMs(performance.now()),
    ...payload,
  })}`)
}

export function flowmPerfMeasure(scope: string, event: string, startedAt: number, payload: PerfPayload = {}): void {
  flowmPerfLog(scope, event, {
    durationMs: roundMs(performance.now() - startedAt),
    ...payload,
  })
}

export function summarizeValue(value: unknown): unknown {
  if (value == null) return value
  if (Array.isArray(value)) return { type: "array", count: value.length }
  if (value instanceof Error) return { type: "error", message: value.message }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const keys = Object.keys(record)
    const summary: Record<string, unknown> = {
      type: "object",
      keys: keys.slice(0, 10),
    }

    for (const key of keys.slice(0, 6)) {
      const child = record[key]
      if (Array.isArray(child)) {
        summary[`${key}Count`] = child.length
      } else if (child == null || ["string", "number", "boolean"].includes(typeof child)) {
        summary[key] = child
      }
    }

    return summary
  }

  return value
}

function shortJson(value: unknown, maxLength = 420): string {
  try {
    const text = JSON.stringify(value)
    if (text == null) return String(value)
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  } catch {
    return String(value)
  }
}

function pageQuerySnapshot({ name, query }: PageQuery): Record<string, unknown> {
  return {
    name,
    status: query.status,
    fetchStatus: query.fetchStatus,
    isLoading: Boolean(query.isLoading),
    isFetching: Boolean(query.isFetching),
    isPending: Boolean(query.isPending),
    dataUpdatedAt: query.dataUpdatedAt,
    errorUpdatedAt: query.errorUpdatedAt,
    data: summarizeValue(query.data),
    error: query.error instanceof Error ? query.error.message : query.error == null ? null : String(query.error),
  }
}

function querySettled(query: QueryLike): boolean {
  return (
    !query.isLoading &&
    !query.isFetching &&
    !query.isPending &&
    query.fetchStatus !== "fetching" &&
    query.status !== "pending"
  )
}

export function usePagePerf(page: string, queries: PageQuery[] = [], meta: PerfPayload = {}): void {
  const startedAt = useRef(performance.now())
  const renderCount = useRef(0)
  const readyLogged = useRef(false)
  renderCount.current += 1

  const snapshots = queries.map(pageQuerySnapshot)
  const querySignature = snapshots.map((snapshot) => shortJson(snapshot, 700)).join("|")

  useEffect(() => {
    flowmPerfLog("page", "mount", { page, ...meta })
    return () => {
      flowmPerfMeasure("page", "unmount", startedAt.current, {
        page,
        renders: renderCount.current,
      })
    }
  }, [page])

  useEffect(() => {
    if (renderCount.current <= 6 || renderCount.current % 10 === 0) {
      flowmPerfLog("page", "commit", {
        page,
        render: renderCount.current,
        elapsedMs: roundMs(performance.now() - startedAt.current),
      })
    }
  })

  useEffect(() => {
    flowmPerfLog("page", "queries", {
      page,
      elapsedMs: roundMs(performance.now() - startedAt.current),
      queries: snapshots,
    })

    const allSettled = queries.every(({ query }) => querySettled(query))
    if (!allSettled) {
      readyLogged.current = false
      return
    }

    if (!readyLogged.current) {
      readyLogged.current = true
      flowmPerfMeasure("page", "ready", startedAt.current, {
        page,
        queries: snapshots,
      })
    }
  }, [page, querySignature])
}

export function installQueryClientPerfLogger(queryClient: QueryClient): void {
  if (installedQueryClients.has(queryClient)) return
  installedQueryClients.add(queryClient)

  queryClient.getQueryCache().subscribe((event) => {
    if (!flowmPerfEnabled()) return

    const query = event.query as unknown as {
      queryHash: string
      queryKey: readonly unknown[]
      state: QueryLike & { fetchFailureCount?: number }
    }
    if (query == null) return

    const profile = queryProfiles.get(query) ?? { cycle: 0 }
    const fetchStatus = query.state.fetchStatus
    const status = query.state.status
    const queryKey = shortJson(query.queryKey)

    if (fetchStatus === "fetching" && profile.fetchStatus !== "fetching") {
      profile.cycle += 1
      profile.startedAt = performance.now()
      flowmPerfLog("query", "fetch", {
        cycle: profile.cycle,
        queryHash: query.queryHash,
        queryKey,
        status,
      })
    }

    if (profile.fetchStatus === "fetching" && fetchStatus !== "fetching") {
      flowmPerfMeasure("query", "settle", profile.startedAt ?? performance.now(), {
        cycle: profile.cycle,
        queryHash: query.queryHash,
        queryKey,
        status,
        fetchStatus,
        failures: query.state.fetchFailureCount ?? 0,
        data: summarizeValue(query.state.data),
        error: query.state.error instanceof Error
          ? query.state.error.message
          : query.state.error == null
            ? null
            : String(query.state.error),
      })
    }

    if (status !== profile.status) {
      flowmPerfLog("query", "status", {
        cycle: profile.cycle,
        queryHash: query.queryHash,
        queryKey,
        status,
        fetchStatus,
      })
    }

    profile.fetchStatus = fetchStatus
    profile.status = status
    queryProfiles.set(query, profile)
  })
}
