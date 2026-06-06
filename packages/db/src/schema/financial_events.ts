import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const financialEvents = sqliteTable(
  "financial_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source"),
    sourceEntryId: integer("source_entry_id"),
    occurredAt: text("occurred_at"),
    date: text("date").notNull(),
    counterparty: text("counterparty"),
    description: text("description"),
    accountHint: text("account_hint"),
    flowKind: text("flow_kind", {
      enum: [
        "income", "consumption_expense", "financial_cost", "asset_movement",
        "debt_repayment", "debt_drawdown", "transfer", "adjustment", "ignored", "ambiguous",
      ],
    }).notNull().default("ambiguous"),
    categoryId: integer("category_id"),
    amount: text("amount").notNull(),
    currency: text("currency").notNull().default("CNY"),
    direction: text("direction", { enum: ["in", "out"] }),
    confidence: integer("confidence"),
    classificationSource: text("classification_source", {
      enum: ["manual", "user_rule", "system_rule", "ai_suggestion", "fallback"],
    }).notNull().default("fallback"),
    classificationReason: text("classification_reason"),
    explanationTags: text("explanation_tags", { mode: "json" }).$type<string[]>(),
    rawMeta: text("raw_meta", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    dateIdx: index("idx_financial_events_date").on(t.date),
    flowKindIdx: index("idx_financial_events_flow_kind").on(t.flowKind),
    categoryIdx: index("idx_financial_events_category").on(t.categoryId),
    sourceIdx: index("idx_financial_events_source").on(t.source),
    sourceEntryIdx: index("idx_financial_events_source_entry").on(t.sourceEntryId),
    sourceEntryUnique: uniqueIndex("financial_events_source_entry_unique")
      .on(t.sourceEntryId)
      .where(sql`source_entry_id IS NOT NULL`),
    classificationSourceIdx: index("idx_financial_events_classification_source").on(t.classificationSource),
  }),
)

export type FinancialEventRow = typeof financialEvents.$inferSelect
export type FinancialEventInsert = typeof financialEvents.$inferInsert
