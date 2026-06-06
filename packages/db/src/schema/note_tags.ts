import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { notes } from "./notes"
import { tags } from "./tags"

export const noteTags = sqliteTable(
  "note_tags",
  {
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tag: text("tag")
      .notNull()
      .references(() => tags.tag, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.tag] }),
  }),
)

export type NoteTagRow = typeof noteTags.$inferSelect
export type NoteTagInsert = typeof noteTags.$inferInsert
