// Storage adapter contract for the beancount-shaped ledger.
//
// We intentionally don't expose Drizzle row types directly across this boundary:
// the contract is in terms of domain objects (an Account, a Transaction with its
// Postings as a value), so an adapter is free to back it with anything — Electron
// + SQLite today, IndexedDB in a future browser build, an in-memory fake in
// tests.

import type {
  AccountType,
  Amount,
  BookingMethod,
  Cost,
  Flag,
  ISODate,
  Result,
  TxnOrigin,
} from "@flowm/shared"

export interface AccountRecord {
  id: number
  name: string
  type: AccountType
  openedAt: ISODate
  closedAt: ISODate | null
  booking: BookingMethod
  allowedCurrencies: string[] // empty array = no restriction
  meta: Record<string, unknown> | null
}

export interface CommodityRecord {
  currency: string
  declaredAt: ISODate | null // null = implicit (first-use)
  meta: Record<string, unknown> | null
}

// A Posting as we accept it on the write side: identifies its account by *name*
// because the parser doesn't know IDs. The adapter resolves the name → id and
// rejects the write if the account isn't open at the txn date.
export interface PostingInput {
  account: string
  flag?: Flag | null
  units: Amount | null // null = elided leg (auto-balance)
  cost?: Cost | null
  // Price annotation. `total` distinguishes `@ price` (per-unit, false) from
  // `@@ total` (true). When absent, the posting has no price annotation.
  price?: { amount: Amount; total: boolean } | null
  meta?: Record<string, unknown> | null
}

export interface PostingRecord extends PostingInput {
  id: number
  txnId: number
  ordinal: number
  // On read, `account` is the name; the row's account_id is resolved out.
}

export interface TransactionInput {
  date: ISODate
  flag?: Flag
  payee?: string | null
  narration?: string
  origin?: TxnOrigin
  postings: PostingInput[]
  meta?: Record<string, unknown> | null
}

export interface TransactionRecord {
  id: number
  date: ISODate
  flag: Flag
  payee: string | null
  narration: string
  origin: TxnOrigin
  postings: PostingRecord[]
  meta: Record<string, unknown> | null
}

export interface OpenAccountInput {
  name: string
  openedAt: ISODate
  booking?: BookingMethod
  allowedCurrencies?: string[]
  meta?: Record<string, unknown> | null
}

export interface ListTransactionsOptions {
  // Inclusive date range, both optional.
  from?: ISODate
  to?: ISODate
  // Filter to postings that touch this account (or any descendant if includeChildren).
  account?: string
  includeChildren?: boolean
  limit?: number
  offset?: number
}

export interface StorageAdapter {
  // Idempotent: creates tables / runs migrations if needed.
  initialize(): Promise<Result<void>>

  // --- Commodities ---
  upsertCommodity(input: {
    currency: string
    declaredAt?: ISODate | null
    meta?: Record<string, unknown> | null
  }): Promise<Result<CommodityRecord>>
  listCommodities(): Promise<Result<CommodityRecord[]>>

  // --- Accounts ---
  // Maps to a beancount `open` directive. Fails if the account already exists.
  openAccount(input: OpenAccountInput): Promise<Result<AccountRecord>>
  // Maps to `close`. Fails if the account is already closed.
  closeAccount(name: string, closedAt: ISODate): Promise<Result<AccountRecord>>
  findAccountByName(name: string): Promise<Result<AccountRecord | null>>
  listAccounts(): Promise<Result<AccountRecord[]>>

  // --- Transactions ---
  // Validates the double-entry invariant before writing: postings grouped by
  // currency (with cost-bearing legs converted to their cost currency) must sum
  // to zero, allowing at most one elided posting per currency to absorb the
  // residual.
  createTransaction(
    input: TransactionInput,
  ): Promise<Result<TransactionRecord>>
  getTransaction(id: number): Promise<Result<TransactionRecord | null>>
  listTransactions(
    opts?: ListTransactionsOptions,
  ): Promise<Result<TransactionRecord[]>>
}
