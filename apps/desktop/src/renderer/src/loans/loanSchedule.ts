/**
 * @purpose Calculate date-derived loan schedule values for renderer displays.
 * @role    Renderer feature surface for future loan obligations.
 * @deps    React, tRPC loan queries, schedule helpers, and UI primitives.
 * @gotcha  Due dates advance plan progress only; they never materialize cashflow or asset changes.
 */

import { localDateKey } from "../lib/dates"
import type { RouterOutputs } from "../lib/trpc"

export type LoanSummary = RouterOutputs["loans"]["list"][number]
export type LoanOccurrence = RouterOutputs["loans"]["occurrences"][number]

export interface SchedRow {
  principal: number
  interest: number
}

export interface LoanSchedule {
  sched: SchedRow[]
  paid: number
  termTotal: number
  monthly: number
  total: number
  remain: number
  rate: number
}

/**
 * Build the full-term repayment schedule for a loan.
 *
 * Always returns `termTotal` rows: real occurrence amounts are used where they
 * exist, and an amortization estimate fills in the remaining (future) periods.
 * Both the loans list and the loan detail page call this so their bars match.
 */
export function buildLoanSchedule(
  loan: LoanSummary,
  occurrences: LoanOccurrence[],
  asOf = localDateKey(),
): LoanSchedule {
  const sorted = [...occurrences].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const total = Number(loan.principalAmount ?? loan.currentPrincipalEstimate ?? 0)
  const storedRemain = Number(loan.currentPrincipalEstimate ?? loan.principalAmount ?? 0)
  const monthly = Number(loan.paymentAmount || 0)
  const rate = Number(loan.annualRateBps ?? 0) / 100 // annual percent, e.g. 4.5
  const termTotal = loan.termMonths ?? Math.max(sorted.length, 1)
  const dueOccurrences = sorted.filter(
    (occurrence) => occurrence.dueDate <= asOf && occurrence.status !== "skipped",
  )
  const paid = Math.min(dueOccurrences.length, termTotal)
  const dueRemain = dueOccurrences[dueOccurrences.length - 1]?.remainingPrincipalEstimate
  const remain =
    dueRemain == null ? storedRemain : Math.min(storedRemain, Math.max(Number(dueRemain), 0))

  const monthlyRate = rate / 100 / 12
  let balance = total
  const sched: SchedRow[] = []
  for (let k = 0; k < termTotal; k++) {
    const occurrence = sorted[k]
    if (occurrence && (occurrence.principalAmount != null || occurrence.interestAmount != null)) {
      const principal = Number(occurrence.principalAmount ?? 0)
      const interest = Number(occurrence.interestAmount ?? 0)
      balance = Math.max(0, balance - principal)
      sched.push({ principal, interest })
    } else {
      const interest = balance * monthlyRate
      const principal = Math.max(monthly - interest, 0)
      balance = Math.max(0, balance - principal)
      sched.push({ principal, interest })
    }
  }

  return { sched, paid, termTotal, monthly, total, remain, rate }
}
