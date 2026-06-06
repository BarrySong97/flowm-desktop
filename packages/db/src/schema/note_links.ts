import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { links } from "./links"
import { notes } from "./notes"

export const noteLinks = sqliteTable(
  "note_links",
  {
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    link: text("link")
      .notNull()
      .references(() => links.link, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.link] }),
  }),
)

export type NoteLinkRow = typeof noteLinks.$inferSelect
export type NoteLinkInsert = typeof noteLinks.$inferInsert
