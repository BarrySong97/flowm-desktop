import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const budgets = sqliteTable(
  "budgets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    periodKind: text("period_kind", {
      enum: ["monthly", "weekly", "yearly", "custom"],
    }).notNull().default("monthly"),
    periodStart: text("period_start"),
    periodEnd: text("period_end"),
    amount: text("amount").notNull(),
    currency: text("currency").notNull().default("CNY"),
    includeFlowKinds: text("include_flow_kinds", { mode: "json" }).$type<string[]>(),
    rolloverPolicy: text("rollover_policy", {
      enum: ["none", "rollover_unspent", "rollover_overspent"],
    }).notNull().default("none"),
    alertThresholds: text("alert_thresholds", { mode: "json" }).$type<Record<string, number>>(),
    status: text("status", { enum: ["active", "paused", "archived"] }).notNull().default("active"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    periodKindIdx: index("idx_budgets_period_kind").on(t.periodKind),
    statusIdx: index("idx_budgets_status").on(t.status),
  }),
)

export type BudgetRow = typeof budgets.$inferSelect
export type BudgetInsert = typeof budgets.$inferInsert
