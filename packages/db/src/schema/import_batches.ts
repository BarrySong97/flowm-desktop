import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceName: text("source_name").notNull(),
    importedAt: text("imported_at").notNull(),
    fileName: text("file_name"),
    fileHash: text("file_hash"),
    status: text("status", { enum: ["imported", "confirmed", "archived"] })
      .notNull()
      .default("imported"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    sourceIdx: index("idx_import_batches_source").on(t.sourceName),
    statusIdx: index("idx_import_batches_status").on(t.status),
  }),
)

export type ImportBatchRow = typeof importBatches.$inferSelect
export type ImportBatchInsert = typeof importBatches.$inferInsert
