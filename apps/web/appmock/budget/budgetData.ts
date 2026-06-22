/**
 * @purpose Register static mock data for the ported Budget page's tRPC queries.
 * @role    Side-effect-free dataset: imported by the AppMock wiring and handed to
 *          <MockProvider data={budgetData}> so the verbatim-copied BudgetPage renders.
 * @deps    @mock/lib/trpc registry contract (keyed by dotted tRPC path).
 * @gotcha  budgets.periods MUST cover the real runtime `new Date()` because the page
 *          picks "current period" via periodStart <= todayKey() <= periodEnd. The period
 *          is therefore computed for the current calendar month so the page always renders.
 */

// Current calendar month bounds so the page's `currentPeriod` lookup always matches.
const now = new Date()
const pad = (n: number) => String(n).padStart(2, "0")
const periodStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
const periodEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
  new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
)}`

// ── Budget sets ─────────────────────────────────────────────────────────────
const budgetsSets = [
  {
    id: "bs-1",
    name: "月度预算",
    currency: "CNY",
    status: "active",
  },
]

// ── Budget periods (active, covering this month) ─────────────────────────────
const budgetsPeriods = [
  {
    id: "bp-1",
    budgetSetId: "bs-1",
    periodKind: "monthly",
    periodStart,
    periodEnd,
    currency: "CNY",
    status: "active",
  },
]

// ── Budget progress ─────────────────────────────────────────────────────────
// ~6 categories; 餐饮 is intentionally slightly over budget to exercise the red state.
const budgetsProgress = [
  {
    budgetItemId: "bi-1",
    budgetName: "餐饮",
    budgeted: "2500",
    referenceUsed: "2684.30",
    remaining: "-184.30",
    currency: "CNY",
    color: "var(--c-food)",
    categoryIds: [],
  },
  {
    budgetItemId: "bi-2",
    budgetName: "购物",
    budgeted: "2000",
    referenceUsed: "1157.90",
    remaining: "842.10",
    currency: "CNY",
    color: "var(--c-shop)",
    categoryIds: [],
  },
  {
    budgetItemId: "bi-3",
    budgetName: "交通",
    budgeted: "600",
    referenceUsed: "318.00",
    remaining: "282.00",
    currency: "CNY",
    color: "var(--c-trans)",
    categoryIds: [],
  },
  {
    budgetItemId: "bi-4",
    budgetName: "居住",
    budgeted: "3500",
    referenceUsed: "2980.00",
    remaining: "520.00",
    currency: "CNY",
    color: "var(--c-home)",
    categoryIds: [],
  },
  {
    budgetItemId: "bi-5",
    budgetName: "娱乐",
    budgeted: "500",
    referenceUsed: "196.00",
    remaining: "304.00",
    currency: "CNY",
    color: "var(--c-fun)",
    categoryIds: [],
  },
  {
    budgetItemId: "bi-6",
    budgetName: "订阅",
    budgeted: "200",
    referenceUsed: "61.00",
    remaining: "139.00",
    currency: "CNY",
    color: "var(--c-sub)",
    categoryIds: [],
  },
]

// ── Reference categories (expense) ──────────────────────────────────────────
const referenceCategories = [
  { id: "cat-1", name: "餐饮", categoryKind: "expense" },
  { id: "cat-2", name: "购物", categoryKind: "expense" },
  { id: "cat-3", name: "交通", categoryKind: "expense" },
  { id: "cat-4", name: "居住", categoryKind: "expense" },
  { id: "cat-5", name: "娱乐", categoryKind: "expense" },
  { id: "cat-6", name: "订阅", categoryKind: "expense" },
]

export const budgetData: Record<string, unknown> = {
  "budgets.sets": budgetsSets,
  "budgets.periods": budgetsPeriods,
  "budgets.progress": budgetsProgress,
  "reference.categories": referenceCategories,
}
