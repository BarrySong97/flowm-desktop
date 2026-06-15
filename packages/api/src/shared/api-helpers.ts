/**
 * @purpose Provide shared API helper primitives for IDs, dates, currency, SQL aggregates, and Result wrapping.
 * @role    Low-level utility layer reused by SQLite facade modules.
 * @deps    drizzle-orm SQL helpers, @flowm/shared Result, and shared contracts.
 * @gotcha  Keep helpers side-effect free except for ID/time generation at API boundaries.
 */

import { sql, type SQL, type SQLWrapper } from "drizzle-orm"
import type { Result } from "@flowm/shared"
import type { CashflowKind, Direction, FlowmId } from "@flowm/shared/contracts"

export const DEFAULT_CURRENCY = "CNY"
export const CURRENCY_SETTINGS_ID = "default"

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function fail<T = never>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(prefix: string): string {
  const random =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${random.replace(/-/g, "")}`
}

export function normalizeCurrency(currency: string | null | undefined): string {
  return (currency ?? DEFAULT_CURRENCY).trim().toUpperCase()
}

export function normalizeDirection(direction: string | null | undefined): Direction {
  if (direction === "income" || direction === "in") return "in"
  if (direction === "expense" || direction === "out") return "out"
  return "neutral"
}

export function normalizeCashflowKind(kind: string): CashflowKind {
  switch (kind) {
    case "consumption_expense":
    case "financial_cost":
      return "expense"
    case "debt_repayment":
      return "debt_payment"
    case "debt_drawdown":
      return "adjustment"
    case "ignored":
    case "ambiguous":
      return "adjustment"
    default:
      return kind as CashflowKind
  }
}

export function toSqlId(id: FlowmId): string {
  return String(id)
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addInterval(date: string, cycle: string, interval: number): string {
  const d = new Date(`${date}T00:00:00.000Z`)
  if (cycle === "weekly") {
    d.setUTCDate(d.getUTCDate() + 7 * interval)
  } else if (cycle === "yearly") {
    d.setUTCFullYear(d.getUTCFullYear() + interval)
  } else {
    const targetDay = d.getUTCDate()
    const month = d.getUTCMonth() + interval
    const year = d.getUTCFullYear() + Math.floor(month / 12)
    const normalizedMonth = month % 12
    const maxDay = new Date(Date.UTC(year, normalizedMonth + 1, 0)).getUTCDate()
    d.setUTCFullYear(year, normalizedMonth, Math.min(targetDay, maxDay))
  }
  return d.toISOString().slice(0, 10)
}

export function monthBounds(ym?: string): { start: string; end: string } {
  const source = ym ?? new Date().toISOString().slice(0, 7)
  const [year, month] = source.split("-").map(Number)
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
  return { start, end: endDate }
}

export function sumReal(column: SQLWrapper): SQL<number> {
  return sql<number>`coalesce(sum(cast(${column} as real)), 0)`
}
