import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const loans = sqliteTable(
  "loans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    principalNumber: text("principal_number").notNull(),
    currency: text("currency").notNull(),
    annualRateBps: integer("annual_rate_bps").notNull(),
    termMonths: integer("term_months").notNull(),
    startDate: text("start_date").notNull(),
    paymentDay: integer("payment_day").notNull(),
    liabilityAccount: text("liability_account").notNull(),
    paymentAccount: text("payment_account").notNull(),
    interestAccount: text("interest_account").notNull(),
    feeAccount: text("fee_account"),
    status: text("status", { enum: ["active", "closed"] })
      .notNull()
      .default("active"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    statusIdx: index("idx_loans_status").on(t.status),
    startDateIdx: index("idx_loans_start_date").on(t.startDate),
  }),
)

export type LoanRow = typeof loans.$inferSelect
export type LoanInsert = typeof loans.$inferInsert
