import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { documents } from "./documents"
import { links } from "./links"

export const documentLinks = sqliteTable(
  "document_links",
  {
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    link: text("link")
      .notNull()
      .references(() => links.link, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.documentId, t.link] }),
  }),
)

export type DocumentLinkRow = typeof documentLinks.$inferSelect
export type DocumentLinkInsert = typeof documentLinks.$inferInsert
