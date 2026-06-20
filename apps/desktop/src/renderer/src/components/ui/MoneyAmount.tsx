/**
 * @purpose Inline money display that shows the full ISO currency code without widening the row.
 * @role    Renderer-local UI atom for subscription/loan/asset amounts.
 * @deps    @flowm/shared currency registry and the local number formatter.
 * @gotcha  Base-currency amounts render with the base symbol; foreign amounts render the ISO
 *          code as a plain prefix ("USD 100.00") so the full code stays visible. Always nowrap so
 *          the number never breaks mid-digits; the row layout gives the amount the width it needs.
 */

import { currencySymbol, normalizeCurrencyCode } from "@flowm/shared"
import { formatNumber } from "@/lib/format"

interface MoneyAmountProps {
  amount: number
  /** The amount's own currency code. */
  currency: string
  /** The display/base currency; matching codes render with the base symbol, no superscript. */
  base: string
  /** Fraction digits; defaults to 0 for base amounts and 2 for foreign amounts. */
  decimals?: number
}

export function MoneyAmount({ amount, currency, base, decimals }: MoneyAmountProps) {
  const cur = normalizeCurrencyCode(currency)
  const isBase = cur === "" || cur === normalizeCurrencyCode(base)

  if (isBase) {
    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {currencySymbol(base)}
        {formatNumber(amount, decimals ?? 0)}
      </span>
    )
  }

  return (
    <span style={{ whiteSpace: "nowrap" }}>
      {cur} {formatNumber(amount, decimals ?? 2)}
    </span>
  )
}
