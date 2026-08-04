/**
 * @purpose Build the dashboard's upcoming obligation rows from forecast occurrences.
 * @role    Pure renderer helper for the overview's next-30-day charge list.
 * @deps    Browser-safe Flowm occurrence contracts.
 * @gotcha  Date-only comparisons keep local-day boundaries stable and never materialize cashflow.
 */

import type { LoanPaymentOccurrenceSummary, SubscriptionOccurrenceSummary } from "@flowm/api"

export interface UpcomingCharge {
  name: string
  d: string
  amt: number
  cur: string
  kind: "订阅" | "贷款"
  dueDate: string
}

interface NamedSubscription {
  id: string | number
  name: string
}

interface NamedLoan {
  id: string | number
  name: string
  currency?: string
}

export function buildUpcomingCharges(
  dateFrom: string,
  dateTo: string,
  subscriptions: NamedSubscription[],
  subscriptionOccurrences: SubscriptionOccurrenceSummary[],
  loans: NamedLoan[],
  loanOccurrences: LoanPaymentOccurrenceSummary[],
): UpcomingCharge[] {
  const subNames = new Map(subscriptions.map((sub) => [String(sub.id), sub.name]))
  const loanNames = new Map(loans.map((loan) => [String(loan.id), loan.name]))
  const loanCurrencies = new Map(loans.map((loan) => [String(loan.id), loan.currency ?? "CNY"]))
  const rows: UpcomingCharge[] = [
    ...subscriptionOccurrences
      .filter((occurrence) => occurrence.status !== "skipped")
      .map((occurrence) => ({
        name: subNames.get(String(occurrence.subscriptionId)) ?? "订阅",
        d: occurrence.dueDate.slice(5),
        amt: Math.abs(Number(occurrence.amount) || 0),
        cur: occurrence.currency,
        kind: "订阅" as const,
        dueDate: occurrence.dueDate,
      })),
    ...loanOccurrences
      .filter((occurrence) => occurrence.status !== "skipped" && occurrence.status !== "paid")
      .map((occurrence) => ({
        name: loanNames.get(String(occurrence.loanId)) ?? "贷款",
        d: occurrence.dueDate.slice(5),
        amt: Math.abs(Number(occurrence.paymentAmount) || 0),
        cur: loanCurrencies.get(String(occurrence.loanId)) ?? "CNY",
        kind: "贷款" as const,
        dueDate: occurrence.dueDate,
      })),
  ]

  return rows
    .filter((row) => row.dueDate >= dateFrom && row.dueDate <= dateTo)
    .sort((a, b) => {
      const byDate = a.dueDate.localeCompare(b.dueDate)
      if (byDate !== 0) return byDate
      const byKind = a.kind.localeCompare(b.kind)
      return byKind !== 0 ? byKind : a.name.localeCompare(b.name)
    })
}
