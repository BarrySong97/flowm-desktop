/**
 * @purpose Define browser-safe Flowm contract primitives shared by renderer and API.
 * @role    Common DTO foundation for transport inputs and summaries.
 * @deps    TypeScript type-only declarations.
 * @gotcha  Keep this file free of Electron, DOM, SQLite, and API runtime imports.
 */

export type FlowmId = string | number

export type Direction = "in" | "out" | "neutral"

export type CashflowKind =
  | "income"
  | "expense"
  | "transfer"
  | "asset_movement"
  | "debt_payment"
  | "refund"
  | "adjustment"

export type ActiveStatus = "active" | "ignored" | "deleted"

export interface MoneyAmount {
  number: string
  currency: string
}
