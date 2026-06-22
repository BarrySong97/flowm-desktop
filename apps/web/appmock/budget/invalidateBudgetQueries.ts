/**
 * @purpose Inert stub of the desktop budget query invalidator for the app mock.
 * @role    The mock never mutates, so cache invalidation is a no-op here.
 * @gotcha  Keeps the original signature so the verbatim-copied page compiles.
 */

import type { QueryClient } from "@tanstack/react-query"

export async function invalidateBudgetQueries(_queryClient: QueryClient): Promise<void> {
  // No-op: the mock serves static data and never mutates.
}
