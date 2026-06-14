/**
 * @purpose Implement loans queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CreateLoanInput, FlowmId, FuturePressureInput, FuturePressureSummary, GenerateOccurrenceInput, ListLoanPaymentOccurrencesInput, ListLoansInput, LoanPaymentOccurrenceSummary, LoanSummary, UpdateLoanInput } from "../index"
import { SubscriptionsApi } from "./subscriptions"
import { DEFAULT_CURRENCY, addInterval, fail, newId, normalizeCurrency, nowIso, ok, toSqlId, todayKey } from "./base"

export abstract class LoansApi extends SubscriptionsApi {
  async listLoans(input: ListLoansInput = {}): Promise<Result<LoanSummary[]>> {
    try {
      const where = input.status ? "where status = ?" : ""
      const rows = await this.all(`select * from loans ${where} order by start_date asc`, input.status ? [input.status] : [])
      return ok(rows.map(this.mapLoan))
    } catch (error) {
      return fail(error)
    }
  }

  async getLoan(input: { id: FlowmId }): Promise<Result<LoanSummary | null>> {
    try {
      const row = await this.one("select * from loans where id = ?", [toSqlId(input.id)])
      return ok(row ? this.mapLoan(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createLoan(input: CreateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const id = newId("loan")
      const timestamp = nowIso()
      await this.run(
        `insert into loans
          (id, name, lender, currency, principal_amount, current_principal_estimate, annual_rate_bps,
           repayment_method, payment_amount, payment_day, start_date, term_months, note, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.lender ?? null,
          normalizeCurrency(input.currency),
          input.principalAmount ?? null,
          input.currentPrincipalEstimate ?? null,
          input.annualRateBps ?? null,
          input.repaymentMethod ?? null,
          input.paymentAmount,
          input.paymentDay ?? null,
          input.startDate,
          input.termMonths ?? null,
          input.note ?? null,
          timestamp,
          timestamp,
        ],
      )
      return ok(this.mapLoan((await this.one("select * from loans where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateLoan(input: UpdateLoanInput): Promise<Result<LoanSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      const map: Record<string, string> = {
        name: "name",
        lender: "lender",
        currency: "currency",
        principalAmount: "principal_amount",
        currentPrincipalEstimate: "current_principal_estimate",
        annualRateBps: "annual_rate_bps",
        repaymentMethod: "repayment_method",
        paymentAmount: "payment_amount",
        paymentDay: "payment_day",
        startDate: "start_date",
        termMonths: "term_months",
        status: "status",
        note: "note",
      }
      for (const [key, column] of Object.entries(map)) {
        const value = input[key as keyof UpdateLoanInput]
        if (value !== undefined) {
          fields.push(`${column} = ?`)
          params.push(key === "currency" ? normalizeCurrency(value as string) : value as SqlParam)
        }
      }
      params.push(toSqlId(input.id))
      await this.run(`update loans set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapLoan((await this.one("select * from loans where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveLoan(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update loans set status = 'closed', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async generateLoanPaymentOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>> {
    try {
      const params: SqlParam[] = input.id ? [toSqlId(input.id)] : []
      const where = input.id ? "where id = ? and status = 'active'" : "where status = 'active'"
      const loans = await this.all(`select * from loans ${where}`, params)
      let generated = 0
      for (const loan of loans) {
        let due = loan.start_date as string
        let remaining = Number(loan.current_principal_estimate ?? loan.principal_amount ?? 0)
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = await this.one("select id from loan_payment_occurrences where loan_id = ? and due_date = ?", [loan.id as string, due])
          if (!exists) {
            const payment = Number(loan.payment_amount ?? 0)
            const interest = loan.annual_rate_bps == null ? 0 : remaining * (Number(loan.annual_rate_bps) / 10000) / 12
            const principal = Math.max(payment - interest, 0)
            remaining = Math.max(remaining - principal, 0)
            await this.run(
              `insert into loan_payment_occurrences
                (id, loan_id, due_date, payment_amount, principal_amount, interest_amount, fee_amount,
                 remaining_principal_estimate, created_at)
               values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [newId("loanocc"), loan.id as string, due, loan.payment_amount as string, principal.toFixed(2), interest.toFixed(2), "0.00", remaining.toFixed(2), nowIso()],
            )
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

  async listLoanPaymentOccurrences(input: ListLoanPaymentOccurrencesInput = {}): Promise<Result<LoanPaymentOccurrenceSummary[]>> {
    try {
      const { where, params } = this.occurrenceWhere("loan_id", input.loanId, input.dateFrom, input.dateTo)
      const rows = await this.all(`select * from loan_payment_occurrences ${where} order by due_date asc`, params)
      return ok(rows.map(this.mapLoanPaymentOccurrence))
    } catch (error) {
      return fail(error)
    }
  }

  async getFutureFixedPressure(input: FuturePressureInput = {}): Promise<Result<FuturePressureSummary>> {
    try {
      const dateFrom = input.dateFrom ?? todayKey()
      const dateTo = input.dateTo ?? addInterval(dateFrom, "monthly", 1)
      const sub = await this.one(
        `select coalesce(sum(cast(amount as real)), 0) as total from subscription_occurrences
         where due_date >= ? and due_date <= ? and status in ('forecast', 'confirmed')`,
        [dateFrom, dateTo],
      )
      const loan = await this.one(
        `select coalesce(sum(cast(payment_amount as real)), 0) as total from loan_payment_occurrences
         where due_date >= ? and due_date <= ? and status in ('forecast', 'paid')`,
        [dateFrom, dateTo],
      )
      const subscriptions = Number(sub?.total ?? 0)
      const loans = Number(loan?.total ?? 0)
      return ok({
        subscriptions: subscriptions.toFixed(2),
        loans: loans.toFixed(2),
        total: (subscriptions + loans).toFixed(2),
        currency: DEFAULT_CURRENCY,
      })
    } catch (error) {
      return fail(error)
    }
  }


}
