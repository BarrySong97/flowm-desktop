import { TRPCClientError, type TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import type { AppRouter } from "../../../main/trpc/router"
import { flowmPerfLog, flowmPerfMeasure, summarizeValue } from "./debug/perf"

type IPCProfile = {
  requestId: string
  type: string
  path: string
  mainMs: number
}

type IPCResponse =
  | {
      ok: true
      data: unknown
      profile?: IPCProfile
    }
  | {
      ok: false
      error: {
        message: string
      }
      profile?: IPCProfile
    }

let rendererRequestSeq = 0

export function ipcTRPCLink(): TRPCLink<AppRouter> {
  return () => ({ op }) =>
    observable((observer) => {
      if (op.signal?.aborted) {
        observer.error(TRPCClientError.from(new Error("Request aborted")))
        return
      }

      let isActive = true
      if (op.type === "subscription") {
        observer.error(TRPCClientError.from(new Error("Subscriptions are not supported over Flowm IPC")))
        return () => {
          isActive = false
        }
      }

      const requestId = `renderer-${++rendererRequestSeq}`
      const startedAt = performance.now()
      flowmPerfLog("trpc", "start", {
        requestId,
        type: op.type,
        path: op.path,
        input: summarizeValue(op.input),
      })

      window.flowm
        .trpcRequest({
          type: op.type,
          path: op.path,
          input: op.input,
        })
        .then((response) => {
          if (!isActive) return
          const result = response as IPCResponse
          flowmPerfMeasure("trpc", "end", startedAt, {
            requestId,
            type: op.type,
            path: op.path,
            ok: result.ok,
            result: result.ok ? summarizeValue(result.data) : null,
            error: result.ok ? null : result.error.message,
            main: result.profile ?? null,
          })
          if (!result.ok) {
            observer.error(TRPCClientError.from(new Error(result.error.message)))
            return
          }
          observer.next({
            context: op.context,
            result: {
              data: result.data,
            },
          })
          observer.complete()
        })
        .catch((error: unknown) => {
          if (!isActive) return
          flowmPerfMeasure("trpc", "error", startedAt, {
            requestId,
            type: op.type,
            path: op.path,
            error: error instanceof Error ? error.message : String(error),
          })
          observer.error(TRPCClientError.from(error instanceof Error ? error : new Error(String(error))))
        })

      return () => {
        isActive = false
      }
    })
}
