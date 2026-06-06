import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { recurringRules } from "./recurring_rules"

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    merchant: text("merchant"),
    recurringRuleId: integer("recurring_rule_id")
      .notNull()
      .references(() => recurringRules.id, { onDelete: "cascade" }),
    model: text("model", { enum: ["cash_expense", "prepaid_amortized"] })
      .notNull()
      .default("cash_expense"),
    amountNumber: text("amount_number").notNull(),
    currency: text("currency").notNull(),
    cashAccount: text("cash_account").notNull(),
    expenseAccount: text("expense_account").notNull(),
    prepaidAccount: text("prepaid_account"),
    status: text("status", { enum: ["active", "paused", "canceled"] })
      .notNull()
      .default("active"),
    lastGeneratedDate: text("last_generated_date"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    ruleIdx: index("idx_subscriptions_rule").on(t.recurringRuleId),
    statusIdx: index("idx_subscriptions_status").on(t.status),
  }),
)

export type SubscriptionRow = typeof subscriptions.$inferSelect
export type SubscriptionInsert = typeof subscriptions.$inferInsert
