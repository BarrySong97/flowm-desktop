/**
 * @purpose Create the default reference and starter data for a new personal Flowm ledger.
 * @role    Seed helper used when initializing empty databases.
 * @deps    @flowm/db schema and Drizzle database handle.
 * @gotcha  Default data must not masquerade as user-entered cashflow or balances.
 */

import { categories, type CategoryInsert, type Database } from "@flowm/db"
import type { Result } from "@flowm/shared"
import { createFlowmApi, type FlowmApi, type FlowmId } from "./index"
import { newId, nowIso } from "./sqlite/base"

type DefaultCategory = {
  name: string
  categoryKind: CategoryInsert["categoryKind"]
  color: string
}

// The default category set a fresh personal ledger needs, and the names the demo
// ledger references (see packages/api/src/demo-seed.ts). Order drives display_order.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "收入", categoryKind: "income", color: "#14794a" },
  { name: "餐饮", categoryKind: "expense", color: "#e07b3a" },
  { name: "交通", categoryKind: "expense", color: "#4a8fc4" },
  { name: "购物", categoryKind: "expense", color: "#c4694a" },
  { name: "娱乐", categoryKind: "expense", color: "#a86fc4" },
  { name: "居住", categoryKind: "expense", color: "#7c8a52" },
  { name: "通讯", categoryKind: "expense", color: "#4a9d94" },
  { name: "订阅", categoryKind: "expense", color: "#7c6ac4" },
  { name: "其他", categoryKind: "expense", color: "#8a9590" },
  { name: "转账", categoryKind: "transfer", color: "#6b7d72" },
  { name: "退款", categoryKind: "income", color: "#6f9f6b" },
  { name: "还款", categoryKind: "debt", color: "#8b6a47" },
]

/**
 * Seed the default category set into a ledger. Idempotent: categories whose name
 * already exists are skipped, so it is safe to call on every ledger creation.
 */
export async function seedDefaultCategories(db: Database): Promise<void> {
  const existing = new Set(
    db
      .select({ name: categories.name })
      .from(categories)
      .all()
      .map((row) => row.name),
  )
  const timestamp = nowIso()
  DEFAULT_CATEGORIES.forEach((category, index) => {
    if (existing.has(category.name)) return
    db.insert(categories)
      .values({
        id: newId("cat"),
        name: category.name,
        categoryKind: category.categoryKind,
        color: category.color,
        displayOrder: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .run()
  })
}

function expectOk<T>(result: Result<T>): T {
  if (!result.success) throw new Error(result.error)
  return result.data
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function monthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
}

function monthEnd(date: Date): string {
  return dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

function nextMonthlyDate(day: number, anchor = new Date()): string {
  const candidate = new Date(anchor.getFullYear(), anchor.getMonth(), day)
  if (candidate < new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())) {
    candidate.setMonth(candidate.getMonth() + 1)
  }
  return dateKey(candidate)
}

async function categoryIdByName(api: FlowmApi): Promise<Map<string, FlowmId>> {
  const rows = expectOk(await api.listCategories({ includeArchived: true }))
  return new Map(rows.map((category) => [category.name, category.id]))
}

/**
 * Seed a fresh personal ledger with lightweight editable examples.
 *
 * Unlike the bundled demo ledger, this starter data lives in the user's own
 * personal ledger and is intentionally small: no imported statements, no actual
 * cashflow events, and no reconciliation between assets and future obligations.
 */
export async function seedPersonalStarterData(db: Database): Promise<void> {
  const api = createFlowmApi(db)
  const [existingAssets, existingSubscriptions, existingLoans, existingBudgetSets] =
    await Promise.all([
      api.listAssetItems({ includeArchived: true }),
      api.listSubscriptions(),
      api.listLoans(),
      api.listBudgetSets(),
    ])
  if (
    expectOk<unknown[]>(existingAssets).length > 0 ||
    expectOk<unknown[]>(existingSubscriptions).length > 0 ||
    expectOk<unknown[]>(existingLoans).length > 0 ||
    expectOk<unknown[]>(existingBudgetSets).length > 0
  ) {
    return
  }

  const categoriesByName = await categoryIdByName(api)
  const today = new Date()
  const todayString = dateKey(today)
  const throughDate = dateKey(addDays(today, 90))

  const budgetSet = expectOk(await api.createBudgetSet({ name: "月度预算" }))
  const budgetPeriod = expectOk(
    await api.createBudgetPeriod({
      budgetSetId: budgetSet.id,
      periodKind: "monthly",
      periodStart: monthStart(today),
      periodEnd: monthEnd(today),
      currency: "CNY",
    }),
  )
  const budgetItems = [
    {
      name: "日常消费总预算",
      plannedAmount: "8000.00",
      color: "#5bac8e",
      scopes: [{ scopeKind: "all_consumption" as const, scopeValue: "expense" }],
    },
    { name: "餐饮预算", plannedAmount: "2200.00", color: "#e07b3a", categoryName: "餐饮" },
    { name: "交通预算", plannedAmount: "800.00", color: "#4a8fc4", categoryName: "交通" },
    { name: "购物预算", plannedAmount: "1800.00", color: "#c46a9e", categoryName: "购物" },
    { name: "订阅预算", plannedAmount: "500.00", color: "#7c6ac4", categoryName: "订阅" },
  ]
  for (const item of budgetItems) {
    await api.createBudgetItem({
      budgetPeriodId: budgetPeriod.id,
      name: item.name,
      plannedAmount: item.plannedAmount,
      currency: "CNY",
      categoryId: item.categoryName ? (categoriesByName.get(item.categoryName) ?? null) : null,
      color: item.color,
      scopes: item.scopes,
    })
  }

  const assetExamples = [
    {
      name: "招商银行储蓄卡示例",
      assetType: "bank" as const,
      institution: "招商银行",
      value: "12800.00",
      note: "可修改示例：手工维护当前余额",
    },
    {
      name: "支付宝余额示例",
      assetType: "wallet" as const,
      institution: "支付宝",
      value: "2300.00",
      note: "可修改示例：手工维护钱包余额",
    },
  ]
  for (const [index, asset] of assetExamples.entries()) {
    const created = expectOk(
      await api.createAssetItem({
        name: asset.name,
        assetType: asset.assetType,
        institution: asset.institution,
        defaultCurrency: "CNY",
        valuationMethod: "manual_balance",
        displayOrder: index,
        note: asset.note,
      }),
    )
    await api.addAssetSnapshot({
      assetItemId: created.id,
      snapshotAt: todayString,
      valueAmount: asset.value,
      valueCurrency: "CNY",
      sourceKind: "manual",
      note: "个人账本 starter 示例快照",
    })
  }

  const subscriptionExamples = [
    {
      name: "视频会员示例",
      amount: "35.00",
      billingCycle: "monthly" as const,
      nextChargeDate: nextMonthlyDate(8),
      merchant: "视频平台",
      categoryId: categoriesByName.get("订阅") ?? null,
    },
    {
      name: "云存储示例",
      amount: "99.00",
      billingCycle: "yearly" as const,
      nextChargeDate: nextMonthlyDate(20),
      merchant: "云服务",
      categoryId: categoriesByName.get("订阅") ?? null,
    },
  ]
  for (const sub of subscriptionExamples) {
    const created = expectOk(
      await api.createSubscription({
        ...sub,
        currency: "CNY",
        autoRenew: true,
        note: "可修改示例：订阅只是未来扣费计划",
      }),
    )
    await api.generateSubscriptionOccurrences({ id: created.id, throughDate })
  }

  const loanExamples = [
    {
      name: "房贷示例",
      lender: "建设银行",
      principalAmount: "620000.00",
      currentPrincipalEstimate: "586000.00",
      annualRateBps: 390,
      paymentAmount: "4200.00",
      paymentDay: 15,
      startDate: dateKey(addMonths(today, -18)),
      termMonths: 240,
    },
    {
      name: "车贷示例",
      lender: "汽车金融",
      principalAmount: "98000.00",
      currentPrincipalEstimate: "72000.00",
      annualRateBps: 420,
      paymentAmount: "3100.00",
      paymentDay: 25,
      startDate: dateKey(addMonths(today, -8)),
      termMonths: 36,
    },
  ]
  for (const loan of loanExamples) {
    const created = expectOk(
      await api.createLoan({
        ...loan,
        currency: "CNY",
        repaymentMethod: "equal_installment",
        note: "可修改示例：贷款计划不会自动改变净资产负债快照",
      }),
    )
    await api.generateLoanPaymentOccurrences({ id: created.id, throughDate })
  }
}
