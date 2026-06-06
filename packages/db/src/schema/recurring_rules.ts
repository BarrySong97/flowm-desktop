import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const recurringRules = sqliteTable(
  "recurring_rules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    frequency: text("frequency", {
      enum: ["weekly", "monthly", "yearly", "custom"],
    }).notNull(),
    intervalCount: integer("interval_count").notNull().default(1),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    nextDueDate: text("next_due_date").notNull(),
    status: text("status", { enum: ["active", "paused", "canceled"] })
      .notNull()
      .default("active"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    statusIdx: index("idx_recurring_rules_status").on(t.status),
    nextDueIdx: index("idx_recurring_rules_next_due").on(t.nextDueDate),
  }),
)

export type RecurringRuleRow = typeof recurringRules.$inferSelect
export type RecurringRuleInsert = typeof recurringRules.$inferInsert
