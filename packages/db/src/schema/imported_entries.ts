import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { importBatches } from "./import_batches"

export const importedEntries = sqliteTable(
  "imported_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    batchId: integer("batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
    merchantOrderId: text("merchant_order_id"),
    occurredAt: text("occurred_at"),
    date: text("date").notNull(),
    payee: text("payee"),
    counterpartyAccount: text("counterparty_account"),
    narration: text("narration"),
    amountNumber: text("amount_number").notNull(),
    currency: text("currency").notNull(),
    accountName: text("account_name").notNull(),
    sourceSubAccountLabel: text("source_sub_account_label"),
    paymentMethod: text("payment_method"),
    direction: text("direction"),
    classification: text("classification"),
    confidence: integer("confidence"),
    hash: text("hash").notNull(),
    status: text("status", {
      enum: ["pending", "reviewed", "ignored"],
    })
      .notNull()
      .default("pending"),
    generatedEventId: integer("generated_event_id"),
    raw: text("raw", { mode: "json" }).$type<Record<string, unknown>>(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    batchIdx: index("idx_imported_entries_batch").on(t.batchId),
    dateIdx: index("idx_imported_entries_date").on(t.date),
    statusIdx: index("idx_imported_entries_status").on(t.status),
    batchHashUnique: unique("imported_entries_batch_hash_unique").on(
      t.batchId,
      t.hash,
    ),
  }),
)

export type ImportedEntryRow = typeof importedEntries.$inferSelect
export type ImportedEntryInsert = typeof importedEntries.$inferInsert
