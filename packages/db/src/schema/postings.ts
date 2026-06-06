import {
  sqliteTable,
  text,
  integer,
  index,
  unique,
} from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"
import { commodities } from "./commodities"
import { transactions } from "./transactions"

// One row per posting (a "leg") of a transaction. Beancount allows exactly one
// posting per transaction to elide its units, which the booking engine infers
// to balance the txn — we represent that with NULL `units_number`/`units_currency`.
//
// All decimal numbers are stored as TEXT to preserve arbitrary precision. They
// must be parsed with a Decimal library (decimal.js / big.js) — never `parseFloat`.
export const postings = sqliteTable(
  "postings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    txnId: integer("txn_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    // Preserves the order postings were written in the source file. Required
    // because beancount's `compare` machinery treats postings as a set, but the
    // dumper needs deterministic order to round-trip text faithfully.
    ordinal: integer("ordinal").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    flag: text("flag"), // posting-level flag override, e.g. '!' on a single leg

    // units (Amount). Both columns NULL iff this is the elided leg.
    unitsNumber: text("units_number"),
    unitsCurrency: text("units_currency").references(() => commodities.currency),

    // cost {N CCY [, DATE [, "LABEL"]]} — held-at-cost lot identity.
    costNumber: text("cost_number"),
    costCurrency: text("cost_currency"),
    costDate: text("cost_date"),
    costLabel: text("cost_label"),

    // price @ N CCY (per-unit) or @@ N CCY (total). Informational; does not
    // affect transaction balancing.
    priceNumber: text("price_number"),
    priceCurrency: text("price_currency"),
    priceIsTotal: integer("price_is_total").notNull().default(0), // 0=@, 1=@@

    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    txnOrdinal: unique("postings_txn_ordinal").on(t.txnId, t.ordinal),
    accountIdx: index("idx_postings_account").on(t.accountId),
    txnIdx: index("idx_postings_txn").on(t.txnId),
  }),
)

export type PostingRow = typeof postings.$inferSelect
export type PostingInsert = typeof postings.$inferInsert
