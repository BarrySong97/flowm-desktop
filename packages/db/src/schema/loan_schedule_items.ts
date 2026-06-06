import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { loans } from "./loans"
import { transactions } from "./transactions"

export const loanScheduleItems = sqliteTable(
  "loan_schedule_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    loanId: integer("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    installmentNumber: integer("installment_number").notNull(),
    dueDate: text("due_date").notNull(),
    paymentNumber: text("payment_number").notNull(),
    principalNumber: text("principal_number").notNull(),
    interestNumber: text("interest_number").notNull(),
    feeNumber: text("fee_number").notNull().default("0.00"),
    remainingPrincipalNumber: text("remaining_principal_number").notNull(),
    transactionId: integer("transaction_id").references(() => transactions.id),
    status: text("status", { enum: ["pending", "paid", "skipped"] })
      .notNull()
      .default("pending"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => ({
    loanIdx: index("idx_loan_schedule_items_loan").on(t.loanId),
    dueDateIdx: index("idx_loan_schedule_items_due_date").on(t.dueDate),
    loanInstallmentUnique: unique("loan_schedule_items_loan_installment_unique").on(
      t.loanId,
      t.installmentNumber,
    ),
  }),
)

export type LoanScheduleItemRow = typeof loanScheduleItems.$inferSelect
export type LoanScheduleItemInsert = typeof loanScheduleItems.$inferInsert
