/**
 * @purpose Verify the dashboard's complete upcoming-charge window.
 * @role    Regression tests for local date boundaries, status filtering, and no truncation.
 * @deps    Vitest and the pure upcoming-charge helper.
 * @gotcha  The dashboard must show every valid occurrence in the window, not only the first six.
 */

import { describe, expect, it } from "vitest"
import { buildUpcomingCharges } from "./upcoming"

describe("buildUpcomingCharges", () => {
  it("includes the local date through day 30 without truncating the list", () => {
    const subscriptions = [{ id: "sub-1", name: "视频会员" }]
    const loans = [{ id: "loan-1", name: "车贷", currency: "CNY" }]
    const subscriptionOccurrences = [
      {
        id: "sub-occ-today",
        subscriptionId: "sub-1",
        dueDate: "2026-08-04",
        amount: "35.00",
        currency: "CNY",
        status: "forecast",
      },
      ...Array.from({ length: 6 }, (_, index) => ({
        id: `sub-occ-${index}`,
        subscriptionId: "sub-1",
        dueDate: `2026-08-${String(5 + index).padStart(2, "0")}`,
        amount: "10.00",
        currency: "CNY",
        status: "forecast",
      })),
      {
        id: "sub-occ-last-day",
        subscriptionId: "sub-1",
        dueDate: "2026-09-03",
        amount: "99.00",
        currency: "CNY",
        status: "confirmed",
      },
      {
        id: "sub-occ-outside",
        subscriptionId: "sub-1",
        dueDate: "2026-09-04",
        amount: "88.00",
        currency: "CNY",
        status: "forecast",
      },
      {
        id: "sub-occ-skipped",
        subscriptionId: "sub-1",
        dueDate: "2026-08-20",
        amount: "77.00",
        currency: "CNY",
        status: "skipped",
      },
    ]
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
      subscriptionOccurrences,
      loans,
      loanOccurrences,
    )

    expect(rows).toHaveLength(9)
    expect(rows.map((row) => row.dueDate)).toEqual([
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
      "2026-09-03",
    ])
    expect(rows.some((row) => row.dueDate === "2026-09-04")).toBe(false)
    expect(rows.some((row) => row.amt === 77)).toBe(false)
    expect(rows.some((row) => row.amt === 100)).toBe(true)
  })
})
