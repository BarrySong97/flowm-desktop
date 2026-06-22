/**
 * @purpose Lightweight money formatter for the marketing-site mock.
 * @role    Stand-in for the desktop app's useMoney() in static previews.
 */

export function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
