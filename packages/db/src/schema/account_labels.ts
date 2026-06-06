import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accounts } from "./accounts"

export const accountLabels = sqliteTable(
  "account_labels",
  {
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    label: text("label").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.accountId, t.locale] }),
    accountIdx: index("idx_account_labels_account").on(t.accountId),
  }),
)

export type AccountLabelRow = typeof accountLabels.$inferSelect
export type AccountLabelInsert = typeof accountLabels.$inferInsert
