/**
 * @purpose Implement loans persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, eq, gte, inArray, lte, type SQL } from "drizzle-orm"
import {
  loanPaymentOccurrences,
  loans,
  subscriptionOccurrences,
  subscriptions,
  type LoanInsert,
  type LoanRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CreateLoanInput,
  FlowmId,
  FuturePressureInput,
  FuturePressureSummary,
  GenerateOccurrenceInput,
  ListLoanPaymentOccurrencesInput,
  ListLoansInput,
  LoanPaymentOccurrenceSummary,
  LoanSummary,
  UpdateLoanInput,
} from "../../../index"
import { SubscriptionsApiRepository } from "./subscriptions-api.repository"
import {
  DEFAULT_CURRENCY,
  addInterval,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  sumReal,
  toSqlId,
  todayKey,
} from "../../../shared/api-helpers"

export abstract class LoansApiRepository extends SubscriptionsApiRepository {
  async listLoans(input: ListLoansInput = {}): Promise<Result<LoanSummary[]>> {
    try {
      const rows = this.db
        .select()
        .from(loans)
        .where(input.status ? eq(loans.status, input.status as LoanRow["status"]) : undefined)
        .orderBy(asc(loans.startDate))
        .all()
      return ok(rows.map((row) => this.mapLoan(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async getLoan(input: { id: FlowmId }): Promise<Result<LoanSummary | null>> {
    try {
      const row = this.db
        .select()
        .from(loans)
        .where(eq(loans.id, toSqlId(input.id)))
        .get()
      return ok(row ? this.mapLoan(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createLoan(input: CreateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const id = newId("loan")
      const timestamp = nowIso()
      this.db
        .insert(loans)
        .values({
          id,
          name: input.name,
          lender: input.lender ?? null,
          currency: normalizeCurrency(input.currency),
          principalAmount: input.principalAmount ?? null,
          currentPrincipalEstimate: input.currentPrincipalEstimate ?? null,
          annualRateBps: input.annualRateBps ?? null,
          repaymentMethod: input.repaymentMethod ?? null,
          paymentAmount: input.paymentAmount,
          paymentDay: input.paymentDay ?? null,
          startDate: input.startDate,
          termMonths: input.termMonths ?? null,
          note: input.note ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      return ok(this.mapLoan(this.db.select().from(loans).where(eq(loans.id, id)).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateLoan(input: UpdateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const set: Partial<LoanInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.lender !== undefined) set.lender = input.lender
      if (input.currency !== undefined) set.currency = normalizeCurrency(input.currency)
      if (input.principalAmount !== undefined) set.principalAmount = input.principalAmount
      if (input.currentPrincipalEstimate !== undefined)
        set.currentPrincipalEstimate = input.currentPrincipalEstimate
      if (input.annualRateBps !== undefined) set.annualRateBps = input.annualRateBps
      if (input.repaymentMethod !== undefined) set.repaymentMethod = input.repaymentMethod
      if (input.paymentAmount !== undefined) set.paymentAmount = input.paymentAmount
      if (input.paymentDay !== undefined) set.paymentDay = input.paymentDay
      if (input.startDate !== undefined) set.startDate = input.startDate
      if (input.termMonths !== undefined) set.termMonths = input.termMonths
      if (input.status !== undefined) set.status = input.status as LoanRow["status"]
      if (input.note !== undefined) set.note = input.note
      this.db
        .update(loans)
        .set(set)
        .where(eq(loans.id, toSqlId(input.id)))
        .run()
      return ok(
        this.mapLoan(
          this.db
            .select()
            .from(loans)
            .where(eq(loans.id, toSqlId(input.id)))
            .get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async archiveLoan(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(loans)
        .set({ status: "closed", updatedAt: nowIso() })
        .where(eq(loans.id, toSqlId(input.id)))
        .run()
      // Drop unrealized future payments so a closed loan stops surfacing in
      // upcoming/pressure views. Paid occurrences stay as real history.
      this.db
        .delete(loanPaymentOccurrences)
        .where(
          and(
            eq(loanPaymentOccurrences.loanId, toSqlId(input.id)),
            eq(loanPaymentOccurrences.status, "forecast"),
          ),
        )
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async generateLoanPaymentOccurrences(
    input: GenerateOccurrenceInput,
  ): Promise<Result<{ generated: number }>> {
    try {
      const conds: SQL[] = [eq(loans.status, "active")]
      if (input.id) conds.push(eq(loans.id, toSqlId(input.id)))
      const activeLoans = this.db
        .select()
        .from(loans)
        .where(and(...conds))
        .all()
      let generated = 0
      for (const loan of activeLoans) {
        let due = loan.startDate
        let remaining = Number(loan.currentPrincipalEstimate ?? loan.principalAmount ?? 0)
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = this.db
            .select({ id: loanPaymentOccurrences.id })
            .from(loanPaymentOccurrences)
            .where(
              and(
                eq(loanPaymentOccurrences.loanId, loan.id),
                eq(loanPaymentOccurrences.dueDate, due),
              ),
            )
            .get()
          if (!exists) {
            const payment = Number(loan.paymentAmount ?? 0)
            const interest =
              loan.annualRateBps == null
                ? 0
                : (remaining * (Number(loan.annualRateBps) / 10000)) / 12
            const principal = Math.max(payment - interest, 0)
            remaining = Math.max(remaining - principal, 0)
            this.db
              .insert(loanPaymentOccurrences)
              .values({
                id: newId("loanocc"),
                loanId: loan.id,
                dueDate: due,
                paymentAmount: loan.paymentAmount,
                principalAmount: principal.toFixed(2),
                interestAmount: interest.toFixed(2),
                feeAmount: "0.00",
                remainingPrincipalEstimate: remaining.toFixed(2),
                createdAt: nowIso(),
              })
              .run()
            generated++
          }
          due = addInterval(due, "monthly", 1)
        }
      }
      return ok({ generated })
    } catch (error) {
      return fail(error)
    }
  }

  async listLoanPaymentOccurrences(
    input: ListLoanPaymentOccurrencesInput = {},
  ): Promise<Result<LoanPaymentOccurrenceSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.loanId) conds.push(eq(loanPaymentOccurrences.loanId, toSqlId(input.loanId)))
      // When listing across loans, exclude occurrences whose parent is no longer
      // active so closed loans never leak ghost payments.
      else
        conds.push(
          inArray(
            loanPaymentOccurrences.loanId,
            this.db.select({ id: loans.id }).from(loans).where(eq(loans.status, "active")),
          ),
        )
      if (input.dateFrom) conds.push(gte(loanPaymentOccurrences.dueDate, input.dateFrom))
      if (input.dateTo) conds.push(lte(loanPaymentOccurrences.dueDate, input.dateTo))
      const rows = this.db
        .select()
        .from(loanPaymentOccurrences)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(asc(loanPaymentOccurrences.dueDate))
        .all()
      return ok(rows.map((row) => this.mapLoanPaymentOccurrence(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async getFutureFixedPressure(
    input: FuturePressureInput = {},
  ): Promise<Result<FuturePressureSummary>> {
    try {
      const dateFrom = input.dateFrom ?? todayKey()
      const dateTo = input.dateTo ?? addInterval(dateFrom, "monthly", 1)
      const sub = this.db
        .select({ total: sumReal(subscriptionOccurrences.amount) })
        .from(subscriptionOccurrences)
        .where(
          and(
            gte(subscriptionOccurrences.dueDate, dateFrom),
            lte(subscriptionOccurrences.dueDate, dateTo),
            inArray(subscriptionOccurrences.status, ["forecast", "confirmed"]),
            inArray(
              subscriptionOccurrences.subscriptionId,
              this.db
                .select({ id: subscriptions.id })
                .from(subscriptions)
                .where(eq(subscriptions.status, "active")),
            ),
          ),
        )
        .get()
      const loan = this.db
        .select({ total: sumReal(loanPaymentOccurrences.paymentAmount) })
        .from(loanPaymentOccurrences)
        .where(
          and(
            gte(loanPaymentOccurrences.dueDate, dateFrom),
            lte(loanPaymentOccurrences.dueDate, dateTo),
            inArray(loanPaymentOccurrences.status, ["forecast", "paid"]),
            inArray(
              loanPaymentOccurrences.loanId,
              this.db.select({ id: loans.id }).from(loans).where(eq(loans.status, "active")),
            ),
          ),
        )
        .get()
      const subscriptionsTotal = Number(sub?.total ?? 0)
      const loansTotal = Number(loan?.total ?? 0)
      return ok({
        subscriptions: subscriptionsTotal.toFixed(2),
        loans: loansTotal.toFixed(2),
        total: (subscriptionsTotal + loansTotal).toFixed(2),
        currency: DEFAULT_CURRENCY,
      })
    } catch (error) {
      return fail(error)
    }
  }
}
