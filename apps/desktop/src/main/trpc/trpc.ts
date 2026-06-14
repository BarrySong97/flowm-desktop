/**
 * @purpose Create shared tRPC primitives for the Electron main-process router.
 * @role    Small infrastructure helper for router and procedure definitions.
 * @deps    @trpc/server.
 * @gotcha  Keep this file framework glue only; product logic belongs in @flowm/api.
 */

import { initTRPC } from "@trpc/server"
import type { FlowmApi } from "@flowm/api"
import type { LedgerStore } from "../ledgers"

export interface TrpcContext {
  api: FlowmApi
  ledgers: LedgerStore
}

const t = initTRPC.context<TrpcContext>().create({ isServer: true })

export const router = t.router
export const publicProcedure = t.procedure

