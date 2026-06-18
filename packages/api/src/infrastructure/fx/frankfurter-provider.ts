/**
 * @purpose Fetch FX rates from the free Frankfurter API for net-worth conversion.
 * @role    Infrastructure adapter implementing the FxRateProvider port.
 * @deps    global fetch and the FxRateProvider contract from the API index.
 * @gotcha  Returns null on any failure so convertAmount degrades to missingFx, never throws.
 */

import type { FxRateFetchInput, FxRateFetchResult, FxRateProvider } from "../../index"

// Frankfurter is free, key-less, and serves ECB daily reference rates with
// historical lookups by date (https://www.frankfurter.app). Rates are only
// published on ECB working days; weekend/holiday requests resolve to the most
// recent working day, which the response echoes back in its `date` field.
const DEFAULT_BASE_URL = "https://api.frankfurter.app"
const DEFAULT_TIMEOUT_MS = 8000

export interface FrankfurterProviderOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

interface FrankfurterResponse {
  base?: string
  date?: string
  rates?: Record<string, number>
}

export function createFrankfurterFxProvider(
  options: FrankfurterProviderOptions = {},
): FxRateProvider {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "")
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  return {
    id: "frankfurter",
    async fetchRate(input: FxRateFetchInput): Promise<FxRateFetchResult | null> {
      const from = input.fromCurrency.toUpperCase()
      const to = input.toCurrency.toUpperCase()
      // Same-currency conversions never need a network round-trip.
      if (from === to) {
        return {
          fromCurrency: from,
          toCurrency: to,
          rateDate: input.date,
          rate: "1",
          provider: "frankfurter",
          sourceDate: input.date,
        }
      }
      if (typeof fetchImpl !== "function") return null

      const url = `${baseUrl}/${encodeURIComponent(input.date)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      const data = await request(fetchImpl, url, timeoutMs)
      if (data == null) return null
      const rate = data.rates?.[to]
      if (rate == null || !Number.isFinite(Number(rate)) || Number(rate) <= 0) return null

      return {
        fromCurrency: from,
        toCurrency: to,
        // Cache under the requested date so subsequent lookups for that date
        // hit the cache; the actual ECB publication date is kept in sourceDate.
        rateDate: input.date,
        rate: String(rate),
        provider: "frankfurter",
        sourceDate: typeof data.date === "string" ? data.date : input.date,
        meta: { base: data.base ?? from },
      }
    },
  }
}

async function request(
  fetchImpl: typeof fetch,
  url: string,
  timeoutMs: number,
): Promise<FrankfurterResponse | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, { signal: controller.signal })
    if (!response.ok) return null
    return (await response.json()) as FrankfurterResponse
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
