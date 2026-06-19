/**
 * @purpose Curated common-currency registry: codes, localized names, and display symbols.
 * @role    Platform-light currency reference for pickers, money formatting, and labels.
 * @deps    None (JS built-ins only).
 * @gotcha  Symbols disambiguate the yen/yuan glyph (CN¥ vs JP¥); unknown codes fall back to
 *          the raw uppercased code so foreign data never renders as a blank symbol.
 */

export interface CurrencyMeta {
  code: string
  /** Display name (Chinese, matching the app UI). */
  name: string
  /** Short display symbol; disambiguated where the glyph is shared. */
  symbol: string
}

// Curated common set. Array order is the picker's default ordering (most-used first).
// Keep this list short and intentional — it is not the full ISO 4217 table.
export const COMMON_CURRENCIES: readonly CurrencyMeta[] = [
  { code: "CNY", name: "人民币", symbol: "CN¥" },
  { code: "USD", name: "美元", symbol: "$" },
  { code: "EUR", name: "欧元", symbol: "€" },
  { code: "HKD", name: "港元", symbol: "HK$" },
  { code: "JPY", name: "日元", symbol: "JP¥" },
  { code: "GBP", name: "英镑", symbol: "£" },
  { code: "AUD", name: "澳元", symbol: "A$" },
  { code: "CAD", name: "加元", symbol: "C$" },
  { code: "CHF", name: "瑞士法郎", symbol: "CHF" },
  { code: "SGD", name: "新加坡元", symbol: "S$" },
  { code: "KRW", name: "韩元", symbol: "₩" },
  { code: "TWD", name: "新台币", symbol: "NT$" },
  { code: "THB", name: "泰铢", symbol: "฿" },
  { code: "MYR", name: "马来西亚林吉特", symbol: "RM" },
  { code: "MOP", name: "澳门元", symbol: "MOP$" },
]

const BY_CODE: ReadonlyMap<string, CurrencyMeta> = new Map(
  COMMON_CURRENCIES.map((c) => [c.code, c]),
)

/** Trim + uppercase a currency code; mirrors the API-side normalizeCurrency. */
export function normalizeCurrencyCode(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase()
}

/** Registry entry for a code, or undefined when it is outside the curated set. */
export function currencyMeta(code: string | null | undefined): CurrencyMeta | undefined {
  return BY_CODE.get(normalizeCurrencyCode(code))
}

/** Display symbol for a code; falls back to the raw uppercased code when unknown. */
export function currencySymbol(code: string | null | undefined): string {
  const normalized = normalizeCurrencyCode(code)
  return BY_CODE.get(normalized)?.symbol ?? normalized
}

export interface FormatMoneyOptions {
  /** Append the ISO code after the amount (e.g. "$9.99 USD"). Default false. */
  code?: boolean
  /** Fraction digits. Default 2. */
  decimals?: number
  /** Group thousands. Default true. */
  grouping?: boolean
}

/**
 * Format an amount with its currency symbol. Presentation only — callers decide which
 * currency to pass (original for single items, base currency for converted totals).
 */
export function formatMoney(
  amount: number | string,
  code: string | null | undefined,
  opts: FormatMoneyOptions = {},
): string {
  const { decimals = 2, grouping = true, code: showCode = false } = opts
  const value = typeof amount === "string" ? Number(amount) : amount
  const safe = Number.isFinite(value) ? value : 0
  const body = safe.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  })
  const symbol = currencySymbol(code)
  return showCode ? `${symbol}${body} ${normalizeCurrencyCode(code)}` : `${symbol}${body}`
}
