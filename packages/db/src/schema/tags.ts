import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const tags = sqliteTable("tags", {
  tag: text("tag").primaryKey(),
})

export type TagRow = typeof tags.$inferSelect
export type TagInsert = typeof tags.$inferInsert
