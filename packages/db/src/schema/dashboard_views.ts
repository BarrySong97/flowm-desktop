import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

export const dashboardViews = sqliteTable(
  "dashboard_views",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    position: integer("position").notNull(),
    isDefault: integer("is_default").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    slugUnique: unique("dashboard_views_slug_unique").on(t.slug),
    positionIdx: index("idx_dashboard_views_position").on(t.position),
  }),
)

export type DashboardViewRow = typeof dashboardViews.$inferSelect
export type DashboardViewInsert = typeof dashboardViews.$inferInsert
