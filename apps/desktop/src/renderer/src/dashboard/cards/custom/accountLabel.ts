import { useMemo } from "react"

export function useAccountLabelMap(): Map<string, string> {
  // In the No-Ledger model there is no account_labels table; return an empty map
  // so that resolveAccountLabel falls back to the raw account name.
  return useMemo(() => new Map<string, string>(), [])
}

export function resolveAccountLabel(value: unknown, map: Map<string, string>): unknown {
  if (typeof value !== "string") return value
  if (!value.includes(":")) return value
  const hit = map.get(value)
  return hit ?? value
}
