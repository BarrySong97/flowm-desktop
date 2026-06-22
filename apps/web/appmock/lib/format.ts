/**
 * @purpose Provide renderer format helper functions.
 * @role    Shared utility module for React feature code.
 * @deps    Browser-safe TypeScript utilities and local domain types.
 * @gotcha  Keep Node, Electron main, and SQLite access behind preload/tRPC.
 */

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCurrency(value: number, decimals = 0, symbol = "¥"): string {
  return `${symbol}${formatNumber(value, decimals)}`
}

export function formatSignedCurrency(value: number, decimals = 0): string {
  return `${value >= 0 ? "+" : "−"}${formatCurrency(Math.abs(value), decimals)}`
}
