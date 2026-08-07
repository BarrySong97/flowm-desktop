/**
 * @purpose Verify subscription plans project deterministic read-time schedules.
 * @role    Regression coverage for browser-safe recurrence and next-charge rules.
 * @deps    Vitest and @flowm/shared subscription projection helpers.
 * @gotcha  Month-end expectations must remain anchored to the original plan date.
 */

import { describe, expect, it } from "vitest"
import {
  nextSubscriptionChargeDate,
  projectSubscriptionPlan,
  projectSubscriptionPlans,
} from "../src/utils/subscription-projection"

const monthly = {
  id: "sub-1",
  amount: "100.00",
  currency: "CNY",
  billingCycle: "monthly",
  intervalCount: 1,
  nextChargeDate: "2026-07-01",
  status: "active",
}

describe("subscription projection", () => {
  it("projects an inclusive window and treats today as the next charge", () => {
    expect(projectSubscriptionPlan(monthly, "2026-08-01", "2026-10-01")).toEqual([
      expect.objectContaining({ dueDate: "2026-08-01", status: "forecast" }),
      expect.objectContaining({ dueDate: "2026-09-01", status: "forecast" }),
      expect.objectContaining({ dueDate: "2026-10-01", status: "forecast" }),
    ])
    expect(nextSubscriptionChargeDate(monthly, "2026-08-01")).toBe("2026-08-01")
    expect(nextSubscriptionChargeDate(monthly, "2026-08-07")).toBe("2026-09-01")
  })

  it("keeps month-end schedules anchored instead of drifting after February", () => {
    const rows = projectSubscriptionPlan(
      { ...monthly, nextChargeDate: "2024-01-31" },
      "2024-01-01",
      "2024-04-30",
    )
    expect(rows.map((row) => row.dueDate)).toEqual([
      "2024-01-31",
      "2024-02-29",
      "2024-03-31",
      "2024-04-30",
    ])
  })

  it("supports weekly, yearly, custom intervals, and stable sorting", () => {
    const rows = projectSubscriptionPlans(
      [
        { ...monthly, id: "yearly", billingCycle: "yearly", nextChargeDate: "2024-02-29" },
        { ...monthly, id: "weekly", billingCycle: "weekly", nextChargeDate: "2026-08-01" },
        {
          ...monthly,
          id: "custom",
          billingCycle: "custom",
          intervalCount: 2,
          nextChargeDate: "2026-08-01",
        },
      ],
      "2026-08-01",
      "2026-10-01",
    )
    expect(rows.filter((row) => row.subscriptionId === "weekly").map((row) => row.dueDate)).toEqual(
      [
        "2026-08-01",
        "2026-08-08",
        "2026-08-15",
        "2026-08-22",
        "2026-08-29",
        "2026-09-05",
        "2026-09-12",
        "2026-09-19",
        "2026-09-26",
      ],
    )
    expect(rows.filter((row) => row.subscriptionId === "custom").map((row) => row.dueDate)).toEqual(
      ["2026-08-01", "2026-10-01"],
    )
    expect(
      nextSubscriptionChargeDate(
        { ...monthly, billingCycle: "yearly", nextChargeDate: "2024-02-29" },
        "2025-01-01",
      ),
    ).toBe("2025-02-28")
    expect(rows).toEqual(
      [...rows].sort(
        (left, right) =>
          left.dueDate.localeCompare(right.dueDate) ||
          String(left.subscriptionId).localeCompare(String(right.subscriptionId)),
      ),
    )
  })

  it("ignores inactive and invalid plans", () => {
    expect(
      projectSubscriptionPlan({ ...monthly, status: "canceled" }, "2026-01-01", "2027-01-01"),
    ).toEqual([])
    expect(
      projectSubscriptionPlan({ ...monthly, intervalCount: 0 }, "2026-01-01", "2027-01-01"),
    ).toEqual([])
  })
})
