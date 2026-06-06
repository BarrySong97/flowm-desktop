import { describe, expect, it } from "vitest"
import { generateOccurrences, nextDueDate, type PlanDefinition } from "../src/plans"

function makePlan(override: Partial<PlanDefinition> = {}): PlanDefinition {
  return {
    id: 1,
    planType: "subscription",
    name: "Test Plan",
    amount: "100.00",
    currency: "CNY",
    scheduleRule: "FREQ=MONTHLY;BYMONTHDAY=15",
    startDate: "2025-01-15",
    status: "active",
    ...override,
  }
}

describe("generateOccurrences", () => {
  it("generates monthly occurrences on the 15th", () => {
    const plan = makePlan()
    const occs = generateOccurrences(plan, "2025-04-30")
    expect(occs.map((o) => o.dueDate)).toEqual([
      "2025-01-15",
      "2025-02-15",
      "2025-03-15",
      "2025-04-15",
    ])
  })

  it("respects plan end date", () => {
    const plan = makePlan({ endDate: "2025-03-14" })
    const occs = generateOccurrences(plan, "2025-06-30")
    expect(occs.map((o) => o.dueDate)).toEqual(["2025-01-15", "2025-02-15"])
  })

  it("generates weekly occurrences", () => {
    const plan = makePlan({ scheduleRule: "FREQ=WEEKLY", startDate: "2025-01-06" })
    const occs = generateOccurrences(plan, "2025-01-27")
    expect(occs.map((o) => o.dueDate)).toEqual([
      "2025-01-06",
      "2025-01-13",
      "2025-01-20",
      "2025-01-27",
    ])
  })

  it("generates yearly occurrences", () => {
    const plan = makePlan({ scheduleRule: "FREQ=YEARLY", startDate: "2023-03-01" })
    const occs = generateOccurrences(plan, "2025-12-31")
    expect(occs.map((o) => o.dueDate)).toEqual(["2023-03-01", "2024-03-01", "2025-03-01"])
  })

  it("returns empty array for paused plans", () => {
    const plan = makePlan({ status: "paused" })
    const occs = generateOccurrences(plan, "2025-06-30")
    expect(occs).toHaveLength(0)
  })

  it("carries correct flow kind and category on each occurrence", () => {
    const plan = makePlan({ flowKind: "consumption_expense", categoryId: 42 })
    const occs = generateOccurrences(plan, "2025-02-28")
    expect(occs[0].flowKind).toBe("consumption_expense")
    expect(occs[0].categoryId).toBe(42)
    expect(occs[0].amount).toBe("100.00")
  })

  it("handles INTERVAL=3 for quarterly plans", () => {
    const plan = makePlan({
      scheduleRule: "FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=1",
      startDate: "2025-01-01",
    })
    const occs = generateOccurrences(plan, "2025-12-31")
    expect(occs.map((o) => o.dueDate)).toEqual([
      "2025-01-01",
      "2025-04-01",
      "2025-07-01",
      "2025-10-01",
    ])
  })
})

describe("nextDueDate", () => {
  it("returns the first occurrence on or after today", () => {
    const plan = makePlan()
    const next = nextDueDate(plan, "2025-02-20")
    expect(next).toBe("2025-03-15")
  })

  it("returns start date when today is before start", () => {
    const plan = makePlan({ startDate: "2025-06-15" })
    const next = nextDueDate(plan, "2025-01-01")
    expect(next).toBe("2025-06-15")
  })

  it("returns undefined for cancelled plans", () => {
    const plan = makePlan({ status: "cancelled" })
    const next = nextDueDate(plan, "2025-01-01")
    expect(next).toBeUndefined()
  })
})
