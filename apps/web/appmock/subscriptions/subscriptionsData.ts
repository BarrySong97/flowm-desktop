/**
 * @purpose Static mock data for the ported Subscriptions page's tRPC queries.
 * @role    Plain data module: SubscriptionsPage is wrapped in <MockProvider data={subscriptionsData}>
 *          which registers these datasets (keyed by dotted tRPC path) so the verbatim-copied page
 *          renders a realistic subscription list + month calendar.
 * @deps    Shapes match @flowm/api subscription contracts. Dates anchored to June 2026.
 * @gotcha  monthMonthly total lands near ¥1,500: yearly subs contribute amount/12, and the foreign
 *          (USD) sub converts at reference.currentRates so the calendar shows a non-base amount.
 */

// ── Subscriptions ─────────────────────────────────────────────────────────
// ~6 subscriptions: mix of 月/年 cycles, one foreign currency (USD).
const subscriptionsList = [
  {
    id: "sub-1",
    name: "网易云音乐",
    merchant: "网易",
    amount: "15",
    currency: "CNY",
    billingCycle: "monthly",
    intervalCount: 1,
    nextChargeDate: "2026-06-09",
    autoRenew: true,
    categoryId: null,
    status: "active",
    note: null,
  },
  {
    id: "sub-2",
    name: "爱奇艺会员",
    merchant: "爱奇艺",
    amount: "248",
    currency: "CNY",
    billingCycle: "monthly",
    intervalCount: 1,
    nextChargeDate: "2026-06-12",
    autoRenew: true,
    categoryId: null,
    status: "active",
    note: null,
  },
  {
    id: "sub-3",
    name: "Netflix",
    merchant: "Netflix",
    amount: "19.99",
    currency: "USD",
    billingCycle: "monthly",
    intervalCount: 1,
    nextChargeDate: "2026-06-15",
    autoRenew: true,
    categoryId: null,
    status: "active",
    note: null,
  },
  {
    id: "sub-4",
    name: "iCloud 存储",
    merchant: "Apple",
    amount: "68",
    currency: "CNY",
    billingCycle: "monthly",
    intervalCount: 1,
    nextChargeDate: "2026-06-18",
    autoRenew: true,
    categoryId: null,
    status: "active",
    note: null,
  },
  {
    id: "sub-5",
    name: "1Password",
    merchant: "AgileBits",
    amount: "468",
    currency: "CNY",
    billingCycle: "yearly",
    intervalCount: 1,
    nextChargeDate: "2026-06-22",
    autoRenew: true,
    categoryId: null,
    status: "active",
    note: null,
  },
  {
    id: "sub-6",
    name: "Adobe Creative Cloud",
    merchant: "Adobe",
    amount: "888",
    currency: "CNY",
    billingCycle: "monthly",
    intervalCount: 1,
    nextChargeDate: "2026-06-26",
    autoRenew: false,
    categoryId: null,
    status: "active",
    note: null,
  },
]

// ── Subscription occurrences (June 2026) ───────────────────────────────────
// Scattered across the month so several calendar days get a colored highlight.
const subscriptionsOccurrences = [
  {
    id: "subocc-1",
    subscriptionId: "sub-1",
    dueDate: "2026-06-09",
    amount: "15",
    currency: "CNY",
    status: "scheduled",
  },
  {
    id: "subocc-2",
    subscriptionId: "sub-2",
    dueDate: "2026-06-12",
    amount: "248",
    currency: "CNY",
    status: "scheduled",
  },
  {
    id: "subocc-3",
    subscriptionId: "sub-3",
    dueDate: "2026-06-15",
    amount: "19.99",
    currency: "USD",
    status: "scheduled",
  },
  {
    id: "subocc-4",
    subscriptionId: "sub-4",
    dueDate: "2026-06-18",
    amount: "68",
    currency: "CNY",
    status: "scheduled",
  },
  {
    id: "subocc-5",
    subscriptionId: "sub-5",
    dueDate: "2026-06-22",
    amount: "468",
    currency: "CNY",
    status: "scheduled",
  },
  {
    id: "subocc-6",
    subscriptionId: "sub-6",
    dueDate: "2026-06-26",
    amount: "888",
    currency: "CNY",
    status: "scheduled",
  },
]

// ── Reference / FX ─────────────────────────────────────────────────────────
// Drives useCurrentRates: base = CNY, USD rate converts the Netflix amount.
const referenceCurrentRates = {
  base: "CNY",
  asOf: "2026-06-21",
  rates: {
    USD: "7.18",
    EUR: "7.82",
    HKD: "0.92",
    JPY: "0.046",
  },
}

export const subscriptionsData: Record<string, unknown> = {
  "subscriptions.list": subscriptionsList,
  "subscriptions.occurrences": subscriptionsOccurrences,
  "reference.currentRates": referenceCurrentRates,
}
