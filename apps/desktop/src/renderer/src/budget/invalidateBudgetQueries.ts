/**
 * @purpose Render and manage the budget invalidate budget queries workflow.
 * @role    Renderer feature surface for budget review and editing.
 * @deps    React, tRPC queries, and budget UI helpers.
 * @gotcha  Budget views summarize cashflow without turning plans into actual expenses.
 */

import type { QueryClient } from "@tanstack/react-query"
import { trpc } from "@/lib/trpc"

export async function invalidateBudgetQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries(trpc.budgets.sets.queryFilter()),
    queryClient.invalidateQueries(trpc.budgets.periods.queryFilter()),
    queryClient.invalidateQueries(trpc.budgets.items.queryFilter()),
    queryClient.invalidateQueries(trpc.budgets.progress.queryFilter()),
  ])
}
