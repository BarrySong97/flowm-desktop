import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { budgets } from "./budgets"

export const budgetScopes = sqliteTable(
  "budget_scopes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    budgetId: integer("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    scopeKind: text("scope_kind", {
      enum: ["category", "category_tree", "tag", "source", "flow_kind", "all_consumption"],
    }).notNull(),
    scopeValue: text("scope_value"),
  },
  (t) => ({
    budgetIdx: index("idx_budget_scopes_budget").on(t.budgetId),
    kindIdx: index("idx_budget_scopes_kind").on(t.scopeKind),
  }),
)

export type BudgetScopeRow = typeof budgetScopes.$inferSelect
export type BudgetScopeInsert = typeof budgetScopes.$inferInsert
