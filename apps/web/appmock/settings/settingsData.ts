/**
 * @purpose Register static mock data for the ported Settings page's tRPC queries.
 * @role    Plain export consumed by <MockProvider data={settingsData}> so the
 *          verbatim-copied SettingsPage + LedgerSection render realistic values.
 * @deps    @mock/lib/trpc registry (keyed by dotted tRPC path). Anchored near 2026-06-21.
 * @gotcha  Export only — no registerMock side effect. The wiring lives in AppMock.
 */

// ── Reference / categories ──────────────────────────────────────────────────
// ~12 categories spanning expense + income, matching reference.categories shape.
const referenceCategories = [
  {
    id: "cat-food",
    name: "餐饮",
    kind: "expense",
    color: "var(--c-food)",
    icon: null,
    sortOrder: 1,
  },
  {
    id: "cat-shop",
    name: "购物",
    kind: "expense",
    color: "var(--c-shop)",
    icon: null,
    sortOrder: 2,
  },
  {
    id: "cat-trans",
    name: "交通",
    kind: "expense",
    color: "var(--c-trans)",
    icon: null,
    sortOrder: 3,
  },
  {
    id: "cat-home",
    name: "居家",
    kind: "expense",
    color: "var(--c-other)",
    icon: null,
    sortOrder: 4,
  },
  { id: "cat-fun", name: "娱乐", kind: "expense", color: "var(--c-fun)", icon: null, sortOrder: 5 },
  {
    id: "cat-comm",
    name: "通讯",
    kind: "expense",
    color: "var(--c-other)",
    icon: null,
    sortOrder: 6,
  },
  {
    id: "cat-health",
    name: "医疗",
    kind: "expense",
    color: "var(--c-other)",
    icon: null,
    sortOrder: 7,
  },
  {
    id: "cat-edu",
    name: "教育",
    kind: "expense",
    color: "var(--c-other)",
    icon: null,
    sortOrder: 8,
  },
  {
    id: "cat-travel",
    name: "旅行",
    kind: "expense",
    color: "var(--c-fun)",
    icon: null,
    sortOrder: 9,
  },
  {
    id: "cat-house",
    name: "住房",
    kind: "expense",
    color: "var(--c-other)",
    icon: null,
    sortOrder: 10,
  },
  {
    id: "cat-salary",
    name: "收入",
    kind: "income",
    color: "var(--green)",
    icon: null,
    sortOrder: 11,
  },
  {
    id: "cat-invest",
    name: "理财",
    kind: "income",
    color: "var(--green)",
    icon: null,
    sortOrder: 12,
  },
]

// ── Reference / currency settings ───────────────────────────────────────────
const referenceCurrencySettings = {
  displayCurrency: "CNY",
  baseCurrency: "CNY",
}

// ── Reference / FX rates ────────────────────────────────────────────────────
const referenceCurrentRates = {
  base: "CNY",
  asOf: "2026-06-21T08:00:00Z",
  rates: {
    USD: "7.18",
    EUR: "7.82",
    HKD: "0.92",
    JPY: "0.046",
  },
}

// ── Ledgers ─────────────────────────────────────────────────────────────────
const ledgersList = [
  {
    id: "ledger-personal",
    name: "个人账本",
    filename: "flowm.local",
    path: "~/Library/Application Support/Flowm/flowm.local.sqlite3",
    active: true,
    isDemo: false,
    builtIn: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// ── Net worth / loan pressure (referenced only by query invalidation) ───────
const assetsNetWorth = {
  netWorth: { number: "2598500", currency: "CNY" },
  assetValue: { number: "3158500", currency: "CNY" },
  liabilityValue: { number: "560000", currency: "CNY" },
  missingFx: [],
}

const loansFuturePressure = {
  subscriptions: "61",
  loans: "4280",
  total: "4341",
  currency: "CNY",
}

export const settingsData: Record<string, unknown> = {
  "reference.categories": referenceCategories,
  "reference.currencySettings": referenceCurrencySettings,
  "reference.currentRates": referenceCurrentRates,
  "ledgers.list": ledgersList,
  "assets.netWorth": assetsNetWorth,
  "loans.futurePressure": loansFuturePressure,
}
