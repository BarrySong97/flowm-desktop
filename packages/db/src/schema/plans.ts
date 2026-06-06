import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const plans = sqliteTable(
  "plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    planType: text("plan_type", {
      enum: ["subscription", "loan_repayment", "salary", "rent", "insurance", "recurring_transfer", "investment_plan", "other"],
    }).notNull(),
    name: text("name").notNull(),
    counterparty: text("counterparty"),
    amount: text("amount").notNull(),
    currency: text("currency").notNull().default("CNY"),
    scheduleRule: text("schedule_rule").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    nextDueDate: text("next_due_date"),
    status: text("status", {
      enum: ["active", "paused", "completed", "cancelled"],
    }).notNull().default("active"),
    categoryId: integer("category_id"),
    flowKind: text("flow_kind", {
      enum: [
        "income", "consumption_expense", "financial_cost", "asset_movement",
        "debt_repayment", "debt_drawdown", "transfer", "adjustment", "ignored", "ambiguous",
      ],
    }),
    accountHint: text("account_hint"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    planTypeIdx: index("idx_plans_type").on(t.planType),
    statusIdx: index("idx_plans_status").on(t.status),
    nextDueIdx: index("idx_plans_next_due").on(t.nextDueDate),
    categoryIdx: index("idx_plans_category").on(t.categoryId),
  }),
)

export type PlanRow = typeof plans.$inferSelect
export type PlanInsert = typeof plans.$inferInsert
