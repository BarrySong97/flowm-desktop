/**
 * @purpose Provide masking-aware money formatters bound to the hide-amounts preference.
 * @role    Renderer hook layer so every amount can be blanked for demos/screenshots/onlookers.
 * @deps    Jotai amountsHiddenAtom and the pure formatters in @mock/lib/format.
 * @gotcha  Components must source their formatter from these hooks (not the pure format.ts
 *          functions) so toggling "hide amounts" re-renders them. Symbols/signs stay visible;
 *          only the digits become the mask.
 */

import { useAtomValue } from "jotai"
import { useCallback } from "react"
import { amountsHiddenAtom } from "@mock/lib/state/uiAtoms"
import { formatCurrency, formatNumber, formatSignedCurrency } from "@mock/lib/format"

export const AMOUNT_MASK = "⋯⋯"

export function useAmountsHidden(): boolean {
  return useAtomValue(amountsHiddenAtom)
}

/** Drop-in replacement for `formatNumber`; masks the digits when amounts are hidden. */
export function useMoney(): (value: number, decimals?: number) => string {
  const hidden = useAtomValue(amountsHiddenAtom)
  return useCallback(
    (value: number, decimals = 0) => (hidden ? AMOUNT_MASK : formatNumber(value, decimals)),
    [hidden],
  )
}

/** Drop-in replacement for `formatSignedCurrency`; keeps the sign + symbol, masks the digits. */
export function useSignedMoney(): (value: number, decimals?: number) => string {
  const hidden = useAtomValue(amountsHiddenAtom)
  return useCallback(
    (value: number, decimals = 0) =>
      hidden ? `${value >= 0 ? "+" : "−"}¥${AMOUNT_MASK}` : formatSignedCurrency(value, decimals),
    [hidden],
  )
}

/** Drop-in replacement for `formatCurrency`; keeps the symbol, masks the digits. */
export function useCurrencyMoney(): (value: number, decimals?: number, symbol?: string) => string {
  const hidden = useAtomValue(amountsHiddenAtom)
  return useCallback(
    (value: number, decimals = 0, symbol = "¥") =>
      hidden ? `${symbol}${AMOUNT_MASK}` : formatCurrency(value, decimals, symbol),
    [hidden],
  )
}
