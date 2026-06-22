/**
 * @purpose Expose current FX rates and a base-currency conversion helper to the renderer.
 * @role    Renderer hook backing every cross-currency total (assets, subscriptions, loans).
 * @deps    tRPC reference.currentRates query and the @flowm/shared currency registry.
 * @gotcha  toDisplay returns null when no rate is known so callers can drop or flag the bucket
 *          instead of silently mixing currencies; same-currency amounts pass through unchanged.
 */

import { currencySymbol, normalizeCurrencyCode } from "@flowm/shared"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { trpc } from "@mock/lib/trpc"

export interface CurrentRatesApi {
  /** Base/display currency code that totals convert into. */
  base: string
  /** Display symbol for the base currency (use on aggregated totals). */
  baseSymbol: string
  /** Rates have loaded at least once. */
  ready: boolean
  /** Latest fetchedAt across cached rates, or null. */
  asOf: string | null
  /** Convert an amount in `currency` into the base currency; null when no rate is known. */
  toDisplay: (amount: number | string, currency?: string | null) => number | null
  /** Whether a usable rate (or base identity) exists for the currency. */
  hasRate: (currency?: string | null) => boolean
}

export function useCurrentRates(): CurrentRatesApi {
  const ratesQuery = useQuery(trpc.reference.currentRates.queryOptions())
  const data = ratesQuery.data
  const ready = ratesQuery.isSuccess

  return useMemo(() => {
    const base = normalizeCurrencyCode(data?.base) || "CNY"
    const rates = data?.rates ?? {}

    const hasRate = (currency?: string | null) => {
      const cur = normalizeCurrencyCode(currency) || base
      return cur === base || rates[cur] != null
    }

    const toDisplay = (amount: number | string, currency?: string | null): number | null => {
      const amt = typeof amount === "string" ? Number(amount) : amount
      if (!Number.isFinite(amt)) return null
      const cur = normalizeCurrencyCode(currency) || base
      if (cur === base) return amt
      const rate = rates[cur]
      if (rate == null) return null
      return amt * Number(rate)
    }

    return {
      base,
      baseSymbol: currencySymbol(base),
      ready,
      asOf: data?.asOf ?? null,
      toDisplay,
      hasRate,
    }
  }, [data, ready])
}
