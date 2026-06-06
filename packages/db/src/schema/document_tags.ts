import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { documents } from "./documents"
import { tags } from "./tags"

export const documentTags = sqliteTable(
  "document_tags",
  {
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tag: text("tag")
      .notNull()
      .references(() => tags.tag, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.documentId, t.tag] }),
  }),
)

export type DocumentTagRow = typeof documentTags.$inferSelect
export type DocumentTagInsert = typeof documentTags.$inferInsert
