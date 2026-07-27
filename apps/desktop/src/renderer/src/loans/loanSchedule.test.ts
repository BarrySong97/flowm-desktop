/**
 * @purpose Verify date-derived loan progress and remaining-principal estimates.
 * @role    Renderer schedule regression test independent of cashflow persistence.
 * @deps    Vitest and the pure loan schedule helper.
 * @gotcha  Passing a due date must advance display progress without changing occurrence status.
 */

import { describe, expect, it } from "vitest"
import { buildLoanSchedule, type LoanOccurrence, type LoanSummary } from "./loanSchedule"

const LOAN: LoanSummary = {
  id: "loan_watch",
  name: "手表+耳机",
  lender: "白条",
  currency: "CNY",
  principalAmount: "2992.55",
  currentPrincipalEstimate: "2992.55",
  annualRateBps: 0,
  repaymentMethod: null,
  paymentAmount: "272.05",
  paymentDay: 26,
  startDate: "2026-06-26",
  termMonths: 11,
  status: "active",
  note: null,
}

const OCCURRENCES: LoanOccurrence[] = [
  {
    id: "occ_june",
    loanId: LOAN.id,
    dueDate: "2026-06-26",
    paymentAmount: "272.05",
    principalAmount: "272.05",
    interestAmount: "0.00",
    feeAmount: "0.00",
    remainingPrincipalEstimate: "2720.50",
    status: "forecast",
  },
  {
    id: "occ_july",
    loanId: LOAN.id,
    dueDate: "2026-07-26",
    paymentAmount: "272.05",
    principalAmount: "272.05",
    interestAmount: "0.00",
    feeAmount: "0.00",
    remainingPrincipalEstimate: "2448.45",
    status: "forecast",
  },
  {
    id: "occ_august",
    loanId: LOAN.id,
    dueDate: "2026-08-26",
    paymentAmount: "272.05",
    principalAmount: "272.05",
    interestAmount: "0.00",
    feeAmount: "0.00",
    remainingPrincipalEstimate: "2176.40",
    status: "forecast",
  },
]

describe("buildLoanSchedule", () => {
  it("derives paid segments and remaining principal from due dates without cashflow", () => {
    expect(buildLoanSchedule(LOAN, OCCURRENCES, "2026-06-25")).toMatchObject({
      paid: 0,
      remain: 2992.55,
      termTotal: 11,
    })
    expect(buildLoanSchedule(LOAN, OCCURRENCES, "2026-06-26")).toMatchObject({
      paid: 1,
      remain: 2720.5,
      termTotal: 11,
    })
    expect(buildLoanSchedule(LOAN, OCCURRENCES, "2026-07-27")).toMatchObject({
      paid: 2,
      remain: 2448.45,
      termTotal: 11,
    })
    expect(OCCURRENCES.every((occurrence) => occurrence.status === "forecast")).toBe(true)
  })
})
