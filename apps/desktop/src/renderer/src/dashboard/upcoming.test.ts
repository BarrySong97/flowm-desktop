/**
 * @purpose Verify the dashboard's complete upcoming-charge window.
 * @role    Regression tests for plan projection, local date boundaries, and no truncation.
 * @deps    Vitest and the pure upcoming-charge helper.
 * @gotcha  Subscription rows come from plans; the dashboard must not require stored occurrences.
 */

import { describe, expect, it } from "vitest"
import { buildUpcomingCharges } from "./upcoming"

describe("buildUpcomingCharges", () => {
  it("includes the local date through day 30 without truncating the list", () => {
    const subscriptionBase = {
      amount: "35.00",
      currency: "CNY",
      intervalCount: 1,
      status: "active",
    }
    const subscriptions = [
      {
        ...subscriptionBase,
        id: "sub-weekly-a",
        name: "每周计划 A",
        billingCycle: "weekly",
        nextChargeDate: "2026-08-04",
      },
      {
        ...subscriptionBase,
        id: "sub-weekly-b",
        name: "每周计划 B",
        billingCycle: "weekly",
        nextChargeDate: "2026-08-05",
      },
      {
        ...subscriptionBase,
        id: "sub-last-day",
        name: "月付计划",
        billingCycle: "monthly",
        nextChargeDate: "2026-07-03",
      },
    ]
    const loans = [{ id: "loan-1", name: "车贷", currency: "CNY" }]
    const loanOccurrences = [
      {
        id: "loan-occ-paid",
        loanId: "loan-1",
        dueDate: "2026-08-10",
        paymentAmount: "100.00",
        principalAmount: "90.00",
        interestAmount: "10.00",
        feeAmount: "0.00",
        remainingPrincipalEstimate: "900.00",
        status: "paid",
      },
      {
        id: "loan-occ-future",
        loanId: "loan-1",
        dueDate: "2026-08-11",
        paymentAmount: "100.00",
        principalAmount: "90.00",
        interestAmount: "10.00",
        feeAmount: "0.00",
        remainingPrincipalEstimate: "810.00",
        status: "forecast",
      },
    ]

    const rows = buildUpcomingCharges(
      "2026-08-04",
      "2026-09-03",
      subscriptions,
      loans,
      loanOccurrences,
    )

    expect(rows).toHaveLength(12)
    expect(rows.map((row) => row.dueDate)).toEqual([
      "2026-08-04",
      "2026-08-05",
      "2026-08-11",
      "2026-08-11",
      "2026-08-12",
      "2026-08-18",
      "2026-08-19",
      "2026-08-25",
      "2026-08-26",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ])
    expect(rows.some((row) => row.dueDate === "2026-09-04")).toBe(false)
    expect(rows.some((row) => row.amt === 100)).toBe(true)
  })
})
