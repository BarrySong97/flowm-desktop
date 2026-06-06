import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const classificationRules = sqliteTable(
  "classification_rules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    priority: integer("priority").notNull().default(0),
    conditionJson: text("condition_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    flowKind: text("flow_kind", {
      enum: [
        "income", "consumption_expense", "financial_cost", "asset_movement",
        "debt_repayment", "debt_drawdown", "transfer", "adjustment", "ignored", "ambiguous",
      ],
    }),
    categoryId: integer("category_id"),
    explanationTags: text("explanation_tags", { mode: "json" }).$type<string[]>(),
    source: text("source", {
      enum: ["user_rule", "system_rule"],
    }).notNull().default("system_rule"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    priorityIdx: index("idx_classification_rules_priority").on(t.priority),
    sourceIdx: index("idx_classification_rules_source").on(t.source),
    enabledIdx: index("idx_classification_rules_enabled").on(t.enabled),
  }),
)

export type ClassificationRuleRow = typeof classificationRules.$inferSelect
export type ClassificationRuleInsert = typeof classificationRules.$inferInsert
