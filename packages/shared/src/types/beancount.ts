// Domain primitives that mirror beancount's source-of-truth definitions.
// See: beancount/core/data.py, beancount/core/account_types.py, beancount/core/flags.py

export const ACCOUNT_TYPES = [
  "Assets",
  "Liabilities",
  "Equity",
  "Income",
  "Expenses",
] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

// All 7 booking methods recognized by beancount v3.
export const BOOKING_METHODS = [
  "STRICT",
  "STRICT_WITH_SIZE",
  "NONE",
  "AVERAGE",
  "FIFO",
  "LIFO",
  "HIFO",
] as const
export type BookingMethod = (typeof BOOKING_METHODS)[number]

// Reserved single-character transaction / posting flags.
// User-input: OKAY, WARNING. The rest are emitted by beancount's processing pipeline.
export const FLAG = {
  OKAY: "*",
  WARNING: "!",
  PADDING: "P",
  SUMMARIZE: "S",
  TRANSFER: "T",
  CONVERSIONS: "C",
  MERGING: "M",
} as const
export type Flag = (typeof FLAG)[keyof typeof FLAG] | (string & {})

// Whether a transaction was authored by the user or derived by the system
// (e.g. inserted by a Pad directive or summarization pass).
export type TxnOrigin = "user" | "auto"

// An ISO-8601 date string (YYYY-MM-DD). Beancount has no time component.
export type ISODate = string

// Amount: a (number, currency) pair. Number is stored as a string to preserve
// arbitrary precision through JS — never use `number` for monetary values.
export interface Amount {
  number: string
  currency: string
}

// Cost: held-at-cost lot identity. All fields except `number` may be missing
// for unresolved costs; the resolved form (post-booking) has number + currency + date.
export interface Cost {
  number: string
  currency: string
  date: ISODate
  label: string | null
}
