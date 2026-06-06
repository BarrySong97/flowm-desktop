import {
  FLAG,
  parseAccountName,
  parentAccountName,
  type Amount,
  type BookingMethod,
  type Flag,
  type ISODate,
  type Result,
  type TxnOrigin,
} from "@flowm/shared"
import type {
  AccountRecord,
  CommodityRecord,
  ListTransactionsOptions,
  OpenAccountInput,
  PostingInput,
  PostingRecord,
  StorageAdapter,
  TransactionInput,
  TransactionRecord,
} from "./types"
import {
  addScaled,
  decimalToScaled,
  isZero,
  multiplyDecimals,
  type ScaledDecimal,
} from "./sql/decimal"
import { MIGRATION_STATEMENTS } from "./sql/migrations"
import type { SqlExecutor, SqlParam, SqlRow } from "./sql/executor"

interface AccountSqlRow extends SqlRow {
  id: number
  name: string
  type: string
  opened_at: string
  closed_at: string | null
  booking: string
  meta: string | null
}

interface TransactionSqlRow extends SqlRow {
  id: number
  date: string
  flag: string
  payee: string | null
  narration: string
  origin: string
  meta: string | null
}

interface PostingSqlRow extends SqlRow {
  id: number
  txn_id: number
  ordinal: number
  account: string
  flag: string | null
  units_number: string | null
  units_currency: string | null
  cost_number: string | null
  cost_currency: string | null
  cost_date: string | null
  cost_label: string | null
  price_number: string | null
  price_currency: string | null
  price_is_total: number
  meta: string | null
}

function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

function fail<T>(error: unknown): Result<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

function stringifyMeta(meta: Record<string, unknown> | null | undefined) {
  return meta == null ? null : JSON.stringify(meta)
}

function parseMeta(input: string | null): Record<string, unknown> | null {
  if (input == null || input === "") return null
  const parsed = JSON.parse(input) as unknown
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null
  }
  return parsed as Record<string, unknown>
}

function amountFromColumns(
  number: string | null,
  currency: string | null,
): Amount | null {
  if (number == null && currency == null) return null
  if (number == null || currency == null) {
    throw new Error("Corrupt posting amount: number/currency must both be set")
  }
  return { number, currency }
}

function assertIsoDate(date: ISODate, field: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${field} must be an ISO date (YYYY-MM-DD)`)
  }
}

function addToBucket(
  buckets: Map<string, ScaledDecimal>,
  currency: string,
  amount: ScaledDecimal,
) {
  buckets.set(currency, addScaled(buckets.get(currency) ?? { value: 0n, scale: 0 }, amount))
}

function validateDoubleEntryInvariant(postings: PostingInput[]) {
  if (postings.length < 2) {
    throw new Error("A transaction must contain at least two postings")
  }

  let elidedCount = 0
  const buckets = new Map<string, ScaledDecimal>()

  for (const posting of postings) {
    if (posting.units == null) {
      elidedCount += 1
      continue
    }

    const contribution =
      posting.cost == null
        ? decimalToScaled(posting.units.number)
        : multiplyDecimals(posting.units.number, posting.cost.number)
    const currency = posting.cost?.currency ?? posting.units.currency
    addToBucket(buckets, currency, contribution)
  }

  if (elidedCount > 1) {
    throw new Error("Only one elided posting is allowed per transaction")
  }

  const residuals = [...buckets.entries()].filter(([, amount]) => !isZero(amount))
  if (elidedCount === 0 && residuals.length > 0) {
    throw new Error(
      `Transaction is not balanced: ${residuals.map(([c]) => c).join(", ")}`,
    )
  }
  if (elidedCount === 1 && residuals.length !== 1) {
    throw new Error(
      "An elided posting can infer exactly one residual currency",
    )
  }
}

function rowToAccount(
  row: AccountSqlRow,
  allowedCurrencies: string[],
): AccountRecord {
  return {
    id: Number(row.id),
    name: row.name,
    type: parseAccountName(row.name).type,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    booking: row.booking as BookingMethod,
    allowedCurrencies,
    meta: parseMeta(row.meta),
  }
}

function rowToCommodity(row: SqlRow): CommodityRecord {
  return {
    currency: String(row.currency),
    declaredAt: row.declared_at == null ? null : String(row.declared_at),
    meta: parseMeta(row.meta == null ? null : String(row.meta)),
  }
}

function rowToPosting(row: PostingSqlRow): PostingRecord {
  const priceAmount = amountFromColumns(row.price_number, row.price_currency)
  const units = amountFromColumns(row.units_number, row.units_currency)
  return {
    id: Number(row.id),
    txnId: Number(row.txn_id),
    ordinal: Number(row.ordinal),
    account: row.account,
    flag: row.flag as Flag | null,
    units,
    cost:
      row.cost_number == null
        ? null
        : {
            number: row.cost_number,
            currency: String(row.cost_currency),
            date: String(row.cost_date),
            label: row.cost_label,
          },
    price:
      priceAmount == null
        ? null
        : { amount: priceAmount, total: Number(row.price_is_total) === 1 },
    meta: parseMeta(row.meta),
  }
}

export class SqliteStorageAdapter implements StorageAdapter {
  constructor(private readonly executor: SqlExecutor) {}

  async initialize(): Promise<Result<void>> {
    try {
      await this.dropOutdatedDashboardTables()
      await this.executor.executeBatchSql(
        MIGRATION_STATEMENTS.map((sql) => ({ sql })),
      )
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  private async dropOutdatedDashboardTables(): Promise<void> {
    const table = await this.one(
      "select name from sqlite_master where type = 'table' and name = 'dashboard_cards'",
    )
    if (table == null) return
    const result = await this.executor.executeSingleSql({
      sql: "pragma table_info(dashboard_cards)",
    })
    const hasViewId = result.rows.some((row) => row.name === "view_id")
    if (hasViewId) return
    await this.executor.executeBatchSql([
      { sql: "drop table if exists dashboard_layouts" },
      { sql: "drop table if exists dashboard_cards" },
      { sql: "drop table if exists dashboard_views" },
    ])
  }

  async upsertCommodity(input: {
    currency: string
    declaredAt?: ISODate | null
    meta?: Record<string, unknown> | null
  }): Promise<Result<CommodityRecord>> {
    try {
      await this.upsertCommodityOrThrow(input.currency, input.declaredAt ?? null, input.meta)
      const row = await this.one(
        "select currency, declared_at, meta from commodities where currency = ?",
        [input.currency],
      )
      if (row == null) throw new Error(`Commodity ${input.currency} was not written`)
      return ok(rowToCommodity(row))
    } catch (error) {
      return fail(error)
    }
  }

  async listCommodities(): Promise<Result<CommodityRecord[]>> {
    try {
      const rows = await this.all(
        "select currency, declared_at, meta from commodities order by currency",
      )
      return ok(rows.map(rowToCommodity))
    } catch (error) {
      return fail(error)
    }
  }

  async openAccount(input: OpenAccountInput): Promise<Result<AccountRecord>> {
    try {
      assertIsoDate(input.openedAt, "openedAt")
      const parsed = parseAccountName(input.name)
      if (await this.accountRowByName(input.name)) {
        throw new Error(`Account already exists: ${input.name}`)
      }

      const allowedCurrencies = input.allowedCurrencies ?? []
      await Promise.all(
        allowedCurrencies.map((currency) =>
          this.upsertCommodityOrThrow(currency, null, null),
        ),
      )

      const parentName = parentAccountName(input.name)
      const parent = parentName == null ? null : await this.accountRowByName(parentName)
      const result = await this.executor.executeSingleSql({
        sql: `insert into accounts (name, type, opened_at, booking, parent_id, meta)
              values (?, ?, ?, ?, ?, ?)`,
        params: [
          input.name,
          parsed.type,
          input.openedAt,
          input.booking ?? "STRICT",
          parent?.id ?? null,
          stringifyMeta(input.meta),
        ],
      })
      const accountId = result.lastInsertId
      if (accountId == null) {
        throw new Error("SQLite did not return an account id")
      }

      if (allowedCurrencies.length > 0) {
        await this.executor.executeBatchSql(
          allowedCurrencies.map((currency) => ({
            sql: "insert into account_currencies (account_id, currency) values (?, ?)",
            params: [accountId, currency],
          })),
        )
      }

      const account = await this.accountRecordByName(input.name)
      if (account == null) throw new Error(`Account ${input.name} was not written`)
      return ok(account)
    } catch (error) {
      return fail(error)
    }
  }

  async closeAccount(
    name: string,
    closedAt: ISODate,
  ): Promise<Result<AccountRecord>> {
    try {
      assertIsoDate(closedAt, "closedAt")
      const account = await this.accountRecordByName(name)
      if (account == null) throw new Error(`Account not found: ${name}`)
      if (account.closedAt != null) throw new Error(`Account is already closed: ${name}`)
      if (closedAt < account.openedAt) {
        throw new Error("closedAt cannot be earlier than openedAt")
      }
      await this.executor.executeSingleSql({
        sql: "update accounts set closed_at = ? where name = ?",
        params: [closedAt, name],
      })
      const updated = await this.accountRecordByName(name)
      if (updated == null) throw new Error(`Account ${name} disappeared`)
      return ok(updated)
    } catch (error) {
      return fail(error)
    }
  }

  async findAccountByName(
    name: string,
  ): Promise<Result<AccountRecord | null>> {
    try {
      return ok(await this.accountRecordByName(name))
    } catch (error) {
      return fail(error)
    }
  }

  async listAccounts(): Promise<Result<AccountRecord[]>> {
    try {
      const rows = (await this.all(
        `select id, name, type, opened_at, closed_at, booking, meta
         from accounts
         order by name`,
      )) as AccountSqlRow[]
      const records = await Promise.all(rows.map((row) => this.accountRecordFromRow(row)))
      return ok(records)
    } catch (error) {
      return fail(error)
    }
  }

  async createTransaction(
    input: TransactionInput,
  ): Promise<Result<TransactionRecord>> {
    try {
      assertIsoDate(input.date, "date")
      validateDoubleEntryInvariant(input.postings)

      const accountByName = new Map<string, AccountRecord>()
      for (const posting of input.postings) {
        const account = await this.accountRecordByName(posting.account)
        if (account == null) throw new Error(`Account is not open: ${posting.account}`)
        if (input.date < account.openedAt) {
          throw new Error(`Account ${posting.account} is not open on ${input.date}`)
        }
        if (account.closedAt != null && input.date > account.closedAt) {
          throw new Error(`Account ${posting.account} is closed on ${input.date}`)
        }
        if (
          posting.units != null &&
          account.allowedCurrencies.length > 0 &&
          !account.allowedCurrencies.includes(posting.units.currency)
        ) {
          throw new Error(
            `Account ${posting.account} does not allow ${posting.units.currency}`,
          )
        }
        accountByName.set(posting.account, account)
        await this.upsertPostingCommodities(posting)
      }

      const txResult = await this.executor.executeSingleSql({
        sql: `insert into transactions (date, flag, payee, narration, origin, meta)
              values (?, ?, ?, ?, ?, ?)`,
        params: [
          input.date,
          input.flag ?? FLAG.OKAY,
          input.payee ?? null,
          input.narration ?? "",
          input.origin ?? "user",
          stringifyMeta(input.meta),
        ],
      })
      const txnId = txResult.lastInsertId
      if (txnId == null) throw new Error("SQLite did not return a transaction id")

      try {
        await this.executor.executeBatchSql(
          input.postings.map((posting, index) => {
            const account = accountByName.get(posting.account)
            if (account == null) throw new Error(`Account not loaded: ${posting.account}`)
            return {
              sql: `insert into postings (
                txn_id, ordinal, account_id, flag,
                units_number, units_currency,
                cost_number, cost_currency, cost_date, cost_label,
                price_number, price_currency, price_is_total, meta
              ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              params: this.postingParams(txnId, index, account.id, posting),
            }
          }),
        )
      } catch (error) {
        await this.executor.executeSingleSql({
          sql: "delete from transactions where id = ?",
          params: [txnId],
        })
        throw error
      }

      const written = await this.transactionById(txnId)
      if (written == null) throw new Error(`Transaction ${txnId} was not written`)
      return ok(written)
    } catch (error) {
      return fail(error)
    }
  }

  async getTransaction(
    id: number,
  ): Promise<Result<TransactionRecord | null>> {
    try {
      return ok(await this.transactionById(id))
    } catch (error) {
      return fail(error)
    }
  }

  async listTransactions(
    opts: ListTransactionsOptions = {},
  ): Promise<Result<TransactionRecord[]>> {
    try {
      const where: string[] = []
      const params: SqlParam[] = []
      if (opts.from != null) {
        where.push("t.date >= ?")
        params.push(opts.from)
      }
      if (opts.to != null) {
        where.push("t.date <= ?")
        params.push(opts.to)
      }
      if (opts.account != null) {
        where.push(`exists (
          select 1
          from postings p
          join accounts a on a.id = p.account_id
          where p.txn_id = t.id
            and ${opts.includeChildren ? "(a.name = ? or a.name like ?)" : "a.name = ?"}
        )`)
        params.push(opts.account)
        if (opts.includeChildren) params.push(`${opts.account}:%`)
      }
      const limit = opts.limit == null ? "" : " limit ?"
      if (opts.limit != null) params.push(opts.limit)
      const offset = opts.offset == null ? "" : " offset ?"
      if (opts.offset != null) params.push(opts.offset)
      const rows = await this.all(
        `select t.id
         from transactions t
         ${where.length > 0 ? `where ${where.join(" and ")}` : ""}
         order by t.date, t.id${limit}${offset}`,
        params,
      )
      const transactions = await Promise.all(
        rows.map((row) => this.transactionById(Number(row.id))),
      )
      return ok(transactions.filter((txn): txn is TransactionRecord => txn != null))
    } catch (error) {
      return fail(error)
    }
  }

  private async upsertCommodityOrThrow(
    currency: string,
    declaredAt: ISODate | null,
    meta: Record<string, unknown> | null | undefined,
  ) {
    await this.executor.executeSingleSql({
      sql: `insert into commodities (currency, declared_at, meta)
            values (?, ?, ?)
            on conflict(currency) do update set
              declared_at = coalesce(excluded.declared_at, commodities.declared_at),
              meta = coalesce(excluded.meta, commodities.meta)`,
      params: [currency, declaredAt, stringifyMeta(meta)],
    })
  }

  private async upsertPostingCommodities(posting: PostingInput) {
    const currencies = [
      posting.units?.currency,
      posting.cost?.currency,
      posting.price?.amount.currency,
    ].filter((currency): currency is string => currency != null)
    for (const currency of currencies) {
      await this.upsertCommodityOrThrow(currency, null, null)
    }
  }

  private postingParams(
    txnId: number,
    ordinal: number,
    accountId: number,
    posting: PostingInput,
  ): SqlParam[] {
    return [
      txnId,
      ordinal,
      accountId,
      posting.flag ?? null,
      posting.units?.number ?? null,
      posting.units?.currency ?? null,
      posting.cost?.number ?? null,
      posting.cost?.currency ?? null,
      posting.cost?.date ?? null,
      posting.cost?.label ?? null,
      posting.price?.amount.number ?? null,
      posting.price?.amount.currency ?? null,
      posting.price?.total ? 1 : 0,
      stringifyMeta(posting.meta),
    ]
  }

  private async accountRecordByName(name: string) {
    const row = await this.accountRowByName(name)
    if (row == null) return null
    return this.accountRecordFromRow(row)
  }

  private async accountRecordFromRow(row: AccountSqlRow) {
    const currencies = await this.all(
      `select currency from account_currencies
       where account_id = ?
       order by currency`,
      [row.id],
    )
    return rowToAccount(
      row,
      currencies.map((currencyRow) => String(currencyRow.currency)),
    )
  }

  private async accountRowByName(name: string): Promise<AccountSqlRow | null> {
    return (await this.one(
      `select id, name, type, opened_at, closed_at, booking, meta
       from accounts
       where name = ?`,
      [name],
    )) as AccountSqlRow | null
  }

  private async transactionById(id: number): Promise<TransactionRecord | null> {
    const row = (await this.one(
      `select id, date, flag, payee, narration, origin, meta
       from transactions
       where id = ?`,
      [id],
    )) as TransactionSqlRow | null
    if (row == null) return null
    const postings = (await this.all(
      `select p.id, p.txn_id, p.ordinal, a.name as account, p.flag,
              p.units_number, p.units_currency,
              p.cost_number, p.cost_currency, p.cost_date, p.cost_label,
              p.price_number, p.price_currency, p.price_is_total, p.meta
       from postings p
       join accounts a on a.id = p.account_id
       where p.txn_id = ?
       order by p.ordinal`,
      [id],
    )) as PostingSqlRow[]

    return {
      id: Number(row.id),
      date: row.date,
      flag: row.flag as Flag,
      payee: row.payee,
      narration: row.narration,
      origin: row.origin as TxnOrigin,
      postings: postings.map(rowToPosting),
      meta: parseMeta(row.meta),
    }
  }

  private async one(sql: string, params: SqlParam[] = []) {
    const rows = await this.all(sql, params)
    return rows[0] ?? null
  }

  private async all(sql: string, params: SqlParam[] = []) {
    const result = await this.executor.executeSingleSql({ sql, params })
    return result.rows
  }
}
