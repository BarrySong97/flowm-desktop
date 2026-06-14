/**
 * @purpose Define the tRPC IPC router that exposes Flowm product operations to the renderer.
 * @role    Main-process API boundary between preload IPC and @flowm/api services.
 * @deps    @trpc/server, @flowm/api, @flowm/db, and main-process context.
 * @gotcha  Keep renderer-facing contracts aligned with preload types and React callers.
 */

import { TRPCError } from "@trpc/server"
import type { FlowmApi } from "@flowm/api"
import type { Result } from "@flowm/shared"
import { publicProcedure, router, type TrpcContext } from "./trpc"

type ApiMethod<Key extends keyof FlowmApi> = FlowmApi[Key] extends (...args: never[]) => unknown ? FlowmApi[Key] : never
type ApiInput<Key extends keyof FlowmApi> = Parameters<ApiMethod<Key>>[0]

function unwrap<T>(result: Result<T>): T {
  if (!result.success) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error })
  }
  return result.data
}

function inputOrEmpty<Key extends keyof FlowmApi>(input: unknown): ApiInput<Key> {
  return (input ?? {}) as ApiInput<Key>
}

function requiredInput<Key extends keyof FlowmApi>(input: unknown): NonNullable<ApiInput<Key>> {
  return input as unknown as NonNullable<ApiInput<Key>>
}

function apiInput<Key extends keyof FlowmApi>() {
  return (input: unknown) => input as ApiInput<Key>
}

async function callApi<T>(ctx: TrpcContext, action: (api: FlowmApi) => Promise<Result<T>>): Promise<T> {
  return unwrap(await action(ctx.api))
}

export const appRouter = router({
  dashboard: router({
    snapshot: publicProcedure.query(({ ctx }) => callApi(ctx, (api) => api.getDashboardSnapshot())),
  }),
  reference: router({
    categories: publicProcedure.input(apiInput<"listCategories">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listCategories(inputOrEmpty<"listCategories">(input)))),
    tags: publicProcedure.input(apiInput<"listTags">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listTags(inputOrEmpty<"listTags">(input)))),
    currencySettings: publicProcedure.query(({ ctx }) => callApi(ctx, (api) => api.getCurrencySettings())),
    exchangeRates: publicProcedure.input(apiInput<"listExchangeRates">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listExchangeRates(inputOrEmpty<"listExchangeRates">(input)))),
  }),
  imports: router({
    statementImports: publicProcedure.input(apiInput<"listStatementImports">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listStatementImports(inputOrEmpty<"listStatementImports">(input)))),
    statementLines: publicProcedure.input(apiInput<"listStatementLines">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listStatementLines(inputOrEmpty<"listStatementLines">(input)))),
    importedEntries: publicProcedure.input(apiInput<"listImportedEntries">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listImportedEntries(inputOrEmpty<"listImportedEntries">(input)))),
    convertStatementLines: publicProcedure.input(apiInput<"convertStatementLinesToCashflowEvents">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.convertStatementLinesToCashflowEvents(inputOrEmpty<"convertStatementLinesToCashflowEvents">(input)))),
  }),
  cashflow: router({
    list: publicProcedure.input(apiInput<"listCashflowEvents">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listCashflowEvents(inputOrEmpty<"listCashflowEvents">(input)))),
    summary: publicProcedure.input(apiInput<"getCashflowSummary">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getCashflowSummary(inputOrEmpty<"getCashflowSummary">(input)))),
    breakdown: publicProcedure.input(apiInput<"getCashflowBreakdown">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getCashflowBreakdown(inputOrEmpty<"getCashflowBreakdown">(input)))),
    create: publicProcedure.input(apiInput<"createCashflowEvent">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createCashflowEvent(requiredInput<"createCashflowEvent">(input)))),
    update: publicProcedure.input(apiInput<"updateCashflowEvent">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateCashflowEvent(requiredInput<"updateCashflowEvent">(input)))),
    ignore: publicProcedure.input(apiInput<"ignoreCashflowEvent">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.ignoreCashflowEvent(requiredInput<"ignoreCashflowEvent">(input)))),
    delete: publicProcedure.input(apiInput<"deleteCashflowEvent">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.deleteCashflowEvent(requiredInput<"deleteCashflowEvent">(input)))),
    setAnalyticsIncluded: publicProcedure.input(apiInput<"setCashflowEventAnalyticsIncluded">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.setCashflowEventAnalyticsIncluded(requiredInput<"setCashflowEventAnalyticsIncluded">(input)))),
  }),
  assets: router({
    items: publicProcedure.input(apiInput<"listAssetItems">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listAssetItems(inputOrEmpty<"listAssetItems">(input)))),
    snapshots: publicProcedure.input(apiInput<"listAssetSnapshots">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listAssetSnapshots(inputOrEmpty<"listAssetSnapshots">(input)))),
    sparklines: publicProcedure.input(apiInput<"listAssetSparklines">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listAssetSparklines(inputOrEmpty<"listAssetSparklines">(input)))),
    netWorth: publicProcedure.input(apiInput<"getNetWorthSnapshot">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getNetWorthSnapshot(inputOrEmpty<"getNetWorthSnapshot">(input)))),
    change: publicProcedure.input(apiInput<"getAssetChange">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getAssetChange(requiredInput<"getAssetChange">(input)))),
    createItem: publicProcedure.input(apiInput<"createAssetItem">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createAssetItem(requiredInput<"createAssetItem">(input)))),
    updateItem: publicProcedure.input(apiInput<"updateAssetItem">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateAssetItem(requiredInput<"updateAssetItem">(input)))),
    archiveItem: publicProcedure.input(apiInput<"archiveAssetItem">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.archiveAssetItem(requiredInput<"archiveAssetItem">(input)))),
    addSnapshot: publicProcedure.input(apiInput<"addAssetSnapshot">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.addAssetSnapshot(requiredInput<"addAssetSnapshot">(input)))),
    updateSnapshot: publicProcedure.input(apiInput<"updateAssetSnapshot">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateAssetSnapshot(requiredInput<"updateAssetSnapshot">(input)))),
    deleteSnapshot: publicProcedure.input(apiInput<"deleteAssetSnapshot">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.deleteAssetSnapshot(requiredInput<"deleteAssetSnapshot">(input)))),
  }),
  subscriptions: router({
    list: publicProcedure.input(apiInput<"listSubscriptions">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listSubscriptions(inputOrEmpty<"listSubscriptions">(input)))),
    occurrences: publicProcedure.input(apiInput<"listSubscriptionOccurrences">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listSubscriptionOccurrences(inputOrEmpty<"listSubscriptionOccurrences">(input)))),
    create: publicProcedure.input(apiInput<"createSubscription">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createSubscription(requiredInput<"createSubscription">(input)))),
    update: publicProcedure.input(apiInput<"updateSubscription">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateSubscription(requiredInput<"updateSubscription">(input)))),
    archive: publicProcedure.input(apiInput<"archiveSubscription">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.archiveSubscription(requiredInput<"archiveSubscription">(input)))),
    generateOccurrences: publicProcedure.input(apiInput<"generateSubscriptionOccurrences">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.generateSubscriptionOccurrences(requiredInput<"generateSubscriptionOccurrences">(input)))),
  }),
  loans: router({
    list: publicProcedure.input(apiInput<"listLoans">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listLoans(inputOrEmpty<"listLoans">(input)))),
    get: publicProcedure.input(apiInput<"getLoan">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getLoan(requiredInput<"getLoan">(input)))),
    occurrences: publicProcedure.input(apiInput<"listLoanPaymentOccurrences">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listLoanPaymentOccurrences(inputOrEmpty<"listLoanPaymentOccurrences">(input)))),
    futurePressure: publicProcedure.input(apiInput<"getFutureFixedPressure">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getFutureFixedPressure(inputOrEmpty<"getFutureFixedPressure">(input)))),
    create: publicProcedure.input(apiInput<"createLoan">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createLoan(requiredInput<"createLoan">(input)))),
    update: publicProcedure.input(apiInput<"updateLoan">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateLoan(requiredInput<"updateLoan">(input)))),
    archive: publicProcedure.input(apiInput<"archiveLoan">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.archiveLoan(requiredInput<"archiveLoan">(input)))),
    generateOccurrences: publicProcedure.input(apiInput<"generateLoanPaymentOccurrences">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.generateLoanPaymentOccurrences(requiredInput<"generateLoanPaymentOccurrences">(input)))),
  }),
  budgets: router({
    sets: publicProcedure.query(({ ctx }) => callApi(ctx, (api) => api.listBudgetSets())),
    periods: publicProcedure.input(apiInput<"listBudgetPeriods">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listBudgetPeriods(inputOrEmpty<"listBudgetPeriods">(input)))),
    items: publicProcedure.input(apiInput<"listBudgetItems">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listBudgetItems(inputOrEmpty<"listBudgetItems">(input)))),
    progress: publicProcedure.input(apiInput<"getBudgetReferenceProgress">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getBudgetReferenceProgress(requiredInput<"getBudgetReferenceProgress">(input)))),
    legacyProgress: publicProcedure.input(apiInput<"getBudgetProgress">()).query(({ ctx, input }) => callApi(ctx, (api) => api.getBudgetProgress(inputOrEmpty<"getBudgetProgress">(input)))),
    createSet: publicProcedure.input(apiInput<"createBudgetSet">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createBudgetSet(requiredInput<"createBudgetSet">(input)))),
    createPeriod: publicProcedure.input(apiInput<"createBudgetPeriod">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createBudgetPeriod(requiredInput<"createBudgetPeriod">(input)))),
    createItem: publicProcedure.input(apiInput<"createBudgetItem">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createBudgetItem(requiredInput<"createBudgetItem">(input)))),
    updateItem: publicProcedure.input(apiInput<"updateBudgetItem">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.updateBudgetItem(requiredInput<"updateBudgetItem">(input)))),
  }),
  links: router({
    list: publicProcedure.input(apiInput<"listObjectLinks">()).query(({ ctx, input }) => callApi(ctx, (api) => api.listObjectLinks(inputOrEmpty<"listObjectLinks">(input)))),
    create: publicProcedure.input(apiInput<"createObjectLink">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.createObjectLink(requiredInput<"createObjectLink">(input)))),
    confirm: publicProcedure.input(apiInput<"confirmObjectLink">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.confirmObjectLink(requiredInput<"confirmObjectLink">(input)))),
    remove: publicProcedure.input(apiInput<"removeObjectLink">()).mutation(({ ctx, input }) => callApi(ctx, (api) => api.removeObjectLink(requiredInput<"removeObjectLink">(input)))),
  }),
})

export type AppRouter = typeof appRouter
