import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { dashboardViews } from "./dashboard_views"

export const dashboardCards = sqliteTable(
  "dashboard_cards",
  {
    id: text("id").primaryKey(),
    viewId: text("view_id")
      .notNull()
      .default("overview")
      .references(() => dashboardViews.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title"),
    code: text("code"),
    configJson: text("config_json").notNull().default("{}"),
    position: integer("position").notNull().default(0),
    hidden: integer("hidden").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    viewIdx: index("idx_dashboard_cards_view").on(t.viewId),
    positionIdx: index("idx_dashboard_cards_position").on(t.position),
  }),
)

export const dashboardLayouts = sqliteTable(
  "dashboard_layouts",
  {
    cardId: text("card_id")
      .notNull()
      .references(() => dashboardCards.id, { onDelete: "cascade" }),
    breakpoint: text("breakpoint", { enum: ["lg", "md", "sm", "xs", "xxs"] }).notNull(),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    w: integer("w").notNull(),
    h: integer("h").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cardId, t.breakpoint] }),
    breakpointIdx: index("idx_dashboard_layouts_breakpoint").on(t.breakpoint),
  }),
)

export type DashboardCardRow = typeof dashboardCards.$inferSelect
export type DashboardCardInsert = typeof dashboardCards.$inferInsert
export type DashboardLayoutRow = typeof dashboardLayouts.$inferSelect
export type DashboardLayoutInsert = typeof dashboardLayouts.$inferInsert
