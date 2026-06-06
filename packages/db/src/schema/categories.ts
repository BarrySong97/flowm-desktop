import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    parentId: integer("parent_id"),
    kind: text("kind", {
      enum: ["expense", "income", "asset_movement", "debt", "transfer", "adjustment", "other"],
    }).notNull(),
    color: text("color"),
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    parentIdx: index("idx_categories_parent").on(t.parentId),
    kindIdx: index("idx_categories_kind").on(t.kind),
    sortIdx: index("idx_categories_sort").on(t.sortOrder),
  }),
)

export type CategoryRow = typeof categories.$inferSelect
export type CategoryInsert = typeof categories.$inferInsert
