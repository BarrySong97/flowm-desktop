/**
 * @purpose Dispatch the renderer's compact tRPC request envelope against the desktop router.
 * @role    Private line-delimited transport logic for the Tauri Node sidecar.
 * @deps    Node performance timing, the app router, and runtime-neutral tRPC context.
 * @gotcha  Subscriptions are intentionally unsupported; callers must serialize errors as data.
 */

import { performance } from "node:perf_hooks"

import { appRouter } from "./router"
import type { TrpcContext } from "./trpc"

export type DesktopTrpcRequest = {
  type: "query" | "mutation" | "subscription"
  path: string
  input: unknown
}

export type DesktopTrpcResponse =
  | {
      ok: true
      data: unknown
      profile: DesktopTrpcProfile
    }
  | {
      ok: false
      error: { message: string }
      profile?: DesktopTrpcProfile
    }

type DesktopTrpcProfile = {
  requestId: string
  type: string
  path: string
  mainMs: number
}

function roundMs(value: number): number {
  return Math.round(value * 10) / 10
}

function getCallerProcedure(caller: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((target, segment) => {
    if (target && (typeof target === "object" || typeof target === "function")) {
      return (target as Record<string, unknown>)[segment]
    }
    return undefined
  }, caller)
}

function serializeError(error: unknown): { message: string } {
  return { message: error instanceof Error ? error.message : String(error) }
}

export function createDesktopTrpcHandler(
  context: () => TrpcContext,
  profilePrefix: string,
): (request: DesktopTrpcRequest) => Promise<DesktopTrpcResponse> {
  let requestSequence = 0

  return async (request) => {
    if (request.type === "subscription") {
      return {
        ok: false,
        error: { message: "Subscriptions are not supported over this IPC link" },
      }
    }

    let caller: ReturnType<typeof appRouter.createCaller>
    try {
      caller = appRouter.createCaller(context())
    } catch (error) {
      return { ok: false, error: serializeError(error) }
    }

    const procedure = getCallerProcedure(caller, request.path)
    if (typeof procedure !== "function") {
      return {
        ok: false,
        error: { message: `Unknown tRPC procedure: ${request.path}` },
      }
    }

    const startedAt = performance.now()
    const profile = (): DesktopTrpcProfile => ({
      requestId: `${profilePrefix}-${++requestSequence}`,
      type: request.type,
      path: request.path,
      mainMs: roundMs(performance.now() - startedAt),
    })

    try {
      const data = await procedure(request.input)
      return { ok: true, data, profile: profile() }
    } catch (error) {
      return { ok: false, error: serializeError(error), profile: profile() }
    }
  }
}
