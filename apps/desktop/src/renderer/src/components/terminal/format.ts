export function money(number: string, currency = "CNY") {
  const value = Number(number)
  const absolute = Number.isFinite(value) ? Math.abs(value) : 0
  const symbol = currency === "CNY" ? "¥" : `${currency} `
  const sign = value < 0 ? "-" : ""
  return `${sign}${symbol}${absolute.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function shortMoney(number: string, currency = "CNY") {
  const value = Number(number)
  if (!Number.isFinite(value)) return money(number, currency)
  const symbol = currency === "CNY" ? "¥" : `${currency} `
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  return money(number, currency)
}

export function signedClass(number: string, positiveIsGreen = true) {
  const value = Number(number)
  if (!Number.isFinite(value) || value === 0) return "text-[var(--term-ink-2)]"
  const green = positiveIsGreen ? value > 0 : value < 0
  return green ? "text-[var(--term-accent)]" : "text-[var(--term-red)]"
}
