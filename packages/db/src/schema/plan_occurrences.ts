import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const planOccurrences = sqliteTable(
  "plan_occurrences",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    planId: integer("plan_id").notNull(),
    dueDate: text("due_date").notNull(),
    amount: text("amount").notNull(),
    currency: text("currency").notNull().default("CNY"),
    flowKind: text("flow_kind", {
      enum: [
        "income", "consumption_expense", "financial_cost", "asset_movement",
        "debt_repayment", "debt_drawdown", "transfer", "adjustment", "ignored", "ambiguous",
      ],
    }),
    categoryId: integer("category_id"),
    status: text("status", {
      enum: ["forecast", "due", "paid", "skipped"],
    }).notNull().default("forecast"),
    generatedAt: text("generated_at").notNull(),
  },
  (t) => ({
    planIdx: index("idx_plan_occurrences_plan").on(t.planId),
    dueDateIdx: index("idx_plan_occurrences_due_date").on(t.dueDate),
    statusIdx: index("idx_plan_occurrences_status").on(t.status),
  }),
)

export type PlanOccurrenceRow = typeof planOccurrences.$inferSelect
export type PlanOccurrenceInsert = typeof planOccurrences.$inferInsert
