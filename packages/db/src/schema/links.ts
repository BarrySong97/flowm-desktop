import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const links = sqliteTable("links", {
  link: text("link").primaryKey(),
})

export type LinkRow = typeof links.$inferSelect
export type LinkInsert = typeof links.$inferInsert
