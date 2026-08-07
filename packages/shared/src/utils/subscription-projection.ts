/**
 * @purpose Project subscription charge dates from a stored plan without persisting occurrences.
 * @role    Browser-safe pure domain helper shared by renderer and API compatibility reads.
 * @deps    Flowm primitive ID contract and UTC calendar arithmetic.
 * @gotcha  Monthly/yearly dates are always derived from the original anchor to avoid month-end drift.
 */

import type { FlowmId } from "../contracts/common/flowm-primitives.contract"

export type SubscriptionBillingCycle = "weekly" | "monthly" | "yearly" | "custom"

export interface SubscriptionProjectionPlan {
  id: FlowmId
  amount: string
  currency: string
  billingCycle: string
  intervalCount: number
  nextChargeDate: string
  status?: string
}

export interface ProjectedSubscriptionOccurrence {
  id: string
  subscriptionId: FlowmId
  dueDate: string
  amount: string
  currency: string
  status: "forecast"
}

interface CalendarDate {
  year: number
  month: number
  day: number
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const MAX_PROJECTED_OCCURRENCES = 100_000

function parseDateKey(value: string): CalendarDate | null {
  const match = ISO_DATE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return null
  const maxDay = daysInMonth(year, month)
  if (day < 1 || day > maxDay) return null
  return { year, month, day }
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function formatDateKey({ year, month, day }: CalendarDate): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function addAnchoredMonths(anchor: CalendarDate, months: number): CalendarDate {
  const zeroBasedMonth = anchor.month - 1 + months
  const year = anchor.year + Math.floor(zeroBasedMonth / 12)
  const month = ((zeroBasedMonth % 12) + 12) % 12
  return {
    year,
    month: month + 1,
    day: Math.min(anchor.day, daysInMonth(year, month + 1)),
  }
}

function addAnchoredYears(anchor: CalendarDate, years: number): CalendarDate {
  const year = anchor.year + years
  return {
    year,
    month: anchor.month,
    day: Math.min(anchor.day, daysInMonth(year, anchor.month)),
  }
}

function addAnchoredDays(anchor: CalendarDate, days: number): CalendarDate {
  const date = new Date(Date.UTC(anchor.year, anchor.month - 1, anchor.day + days))
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

function occurrenceDate(
  anchor: CalendarDate,
  cycle: SubscriptionBillingCycle,
  interval: number,
  occurrenceIndex: number,
): string {
  const step = interval * occurrenceIndex
  if (cycle === "weekly") return formatDateKey(addAnchoredDays(anchor, step * 7))
  if (cycle === "yearly") return formatDateKey(addAnchoredYears(anchor, step))
  return formatDateKey(addAnchoredMonths(anchor, step))
}

function normalizedCycle(cycle: string): SubscriptionBillingCycle | null {
  if (cycle === "weekly" || cycle === "monthly" || cycle === "yearly" || cycle === "custom") {
    return cycle
  }
  return null
}

export function projectSubscriptionPlan(
  plan: SubscriptionProjectionPlan,
  dateFrom: string,
  dateTo: string,
): ProjectedSubscriptionOccurrence[] {
  if (dateFrom > dateTo || (plan.status != null && plan.status !== "active")) return []
  const anchor = parseDateKey(plan.nextChargeDate)
  const cycle = normalizedCycle(plan.billingCycle)
  const interval = Math.trunc(plan.intervalCount)
  if (!anchor || !cycle || interval < 1) return []

  const rows: ProjectedSubscriptionOccurrence[] = []
  for (let index = 0; index < MAX_PROJECTED_OCCURRENCES; index += 1) {
    const dueDate = occurrenceDate(anchor, cycle, interval, index)
    if (dueDate > dateTo) break
    if (dueDate < dateFrom) continue
    rows.push({
      id: `subproj:${encodeURIComponent(String(plan.id))}:${dueDate}`,
      subscriptionId: plan.id,
      dueDate,
      amount: plan.amount,
      currency: plan.currency,
      status: "forecast",
    })
  }
  return rows
}

export function projectSubscriptionPlans(
  plans: SubscriptionProjectionPlan[],
  dateFrom: string,
  dateTo: string,
): ProjectedSubscriptionOccurrence[] {
  return plans
    .flatMap((plan) => projectSubscriptionPlan(plan, dateFrom, dateTo))
    .sort(
      (left, right) =>
        left.dueDate.localeCompare(right.dueDate) ||
        String(left.subscriptionId).localeCompare(String(right.subscriptionId)),
    )
}

export function nextSubscriptionChargeDate(
  plan: SubscriptionProjectionPlan,
  onOrAfter: string,
): string | null {
  const anchor = parseDateKey(plan.nextChargeDate)
  const cycle = normalizedCycle(plan.billingCycle)
  const interval = Math.trunc(plan.intervalCount)
  if (!anchor || !cycle || interval < 1 || (plan.status != null && plan.status !== "active")) {
    return null
  }
  for (let index = 0; index < MAX_PROJECTED_OCCURRENCES; index += 1) {
    const dueDate = occurrenceDate(anchor, cycle, interval, index)
    if (dueDate >= onOrAfter) return dueDate
  }
  return null
}
