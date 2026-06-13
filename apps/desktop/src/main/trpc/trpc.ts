import { initTRPC } from "@trpc/server"
import type { FlowmApi } from "@flowm/api"

export interface TrpcContext {
  api: FlowmApi
}

const t = initTRPC.context<TrpcContext>().create({ isServer: true })

export const router = t.router
export const publicProcedure = t.procedure

