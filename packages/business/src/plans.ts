export type PlanType = "subscription" | "loan_repayment" | "salary" | "rent" | "insurance" | "recurring_transfer" | "investment_plan" | "other"
export type FlowKind = "income" | "consumption_expense" | "financial_cost" | "asset_movement" | "debt_repayment" | "debt_drawdown" | "transfer" | "adjustment" | "ignored" | "ambiguous"

export interface PlanDefinition {
  id: number
  planType: PlanType
  name: string
  counterparty?: string
  amount: string
  currency: string
  scheduleRule: string
  startDate: string
  endDate?: string
  nextDueDate?: string
  status: "active" | "paused" | "completed" | "cancelled"
  categoryId?: number
  flowKind?: FlowKind
  accountHint?: string
  meta?: Record<string, unknown>
}

export interface PlanOccurrenceInput {
  planId: number
  dueDate: string
  amount: string
  currency: string
  flowKind?: FlowKind
  categoryId?: number
  status: "forecast" | "due" | "paid" | "skipped"
}

/** Parse a simple RRULE-like string and generate occurrence dates */
export function generateOccurrences(plan: PlanDefinition, throughDate: string): PlanOccurrenceInput[] {
  if (plan.status !== "active") return []
  const rule = plan.scheduleRule
  const start = plan.startDate
  const end = plan.endDate && plan.endDate < throughDate ? plan.endDate : throughDate
  const freq = rule.match(/FREQ=(\w+)/i)?.[1]?.toUpperCase() ?? "MONTHLY"
  const byMonthDay = rule.match(/BYMONTHDAY=(\d+)/i)?.[1]
  const interval = parseInt(rule.match(/INTERVAL=(\d+)/i)?.[1] ?? "1")
  const occurrences: PlanOccurrenceInput[] = []
  let current = start
  let safety = 0
  while (current <= end && safety++ < 500) {
    occurrences.push({
      planId: plan.id,
      dueDate: current,
      amount: plan.amount,
      currency: plan.currency,
      flowKind: plan.flowKind,
      categoryId: plan.categoryId,
      status: "forecast",
    })
    const d = new Date(current + "T00:00:00Z")
    if (freq === "WEEKLY") {
      d.setUTCDate(d.getUTCDate() + 7 * interval)
    } else if (freq === "YEARLY") {
      d.setUTCFullYear(d.getUTCFullYear() + interval)
    } else {
      // MONTHLY
      const targetDay = byMonthDay ? parseInt(byMonthDay) : d.getUTCDate()
      let m = d.getUTCMonth() + interval
      let y = d.getUTCFullYear() + Math.floor(m / 12)
      m = m % 12
      const maxDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
      d.setUTCFullYear(y, m, Math.min(targetDay, maxDay))
    }
    current = d.toISOString().slice(0, 10)
  }
  return occurrences
}

/** Compute the next due date for a plan from today's perspective */
export function nextDueDate(plan: PlanDefinition, today: string): string | undefined {
  // Look 2 years ahead to find the next occurrence
  const d = new Date(today + 'T00:00:00Z')
  d.setUTCFullYear(d.getUTCFullYear() + 2)
  const throughDate = d.toISOString().slice(0, 10)
  const occ = generateOccurrences(plan, throughDate)
  return occ.find((o) => o.dueDate >= today)?.dueDate
}
