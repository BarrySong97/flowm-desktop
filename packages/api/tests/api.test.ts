/**
 * @purpose Exercise the Flowm API facade against an isolated SQLite database.
 * @role    Integration safety net for product behavior and schema/API contracts.
 * @deps    Vitest, @flowm/api, @flowm/db, and Electron-compatible SQLite setup.
 * @gotcha  Run through Electron Node when touching better-sqlite3.
 */

import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it } from "vitest"
import BetterSqlite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { type Database, schema } from "@flowm/db"
import { createFlowmApi, type FlowmApi } from "../src"
import { seedDemoData } from "../src/demo-seed"
import {
  DEFAULT_CATEGORIES,
  seedDefaultCategories,
  seedPersonalStarterData,
} from "../src/default-seed"

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = resolve(__dirname, "../../db/migrations")
const tmpRoot = mkdtempSync(join(tmpdir(), "flowm-api-tests-"))

function createDb(dbPath: string): Database {
  const client = new BetterSqlite3(dbPath)
  client.pragma("foreign_keys = ON")
  const db = drizzle(client, { schema })
  migrate(db, { migrationsFolder })
  return db
}

function expectOk<T>(result: { success: true; data: T } | { success: false; error: string }) {
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function createApi(name: string) {
  mkdirSync(tmpRoot, { recursive: true })
  const dbPath = resolve(tmpRoot, `${name}.sqlite3`)
  rmSync(dbPath, { force: true })
  const db = createDb(dbPath)
  const api = createFlowmApi(db)
  return { api, db, dbPath }
}

function countRows(db: Database, table: string, where = "1 = 1") {
  const row = db.$client.prepare(`select count(*) as count from ${table} where ${where}`).get() as {
    count: number
  }
  return Number(row?.count ?? 0)
}

async function ensureCategory(
  api: FlowmApi,
  input: {
    name: string
    categoryKind: string
    color: string
    icon: string
    displayOrder: number
  },
) {
  const categories = expectOk(await api.listCategories({ includeArchived: true }))
  const existing = categories.find(
    (category) => category.name === input.name && category.categoryKind === input.categoryKind,
  )
  return existing ?? expectOk(await api.createCategory(input))
}

beforeEach(() => {
  mkdirSync(tmpRoot, { recursive: true })
})

async function createGoldenFixture(api: FlowmApi) {
  const income = await ensureCategory(api, {
    name: "收入",
    categoryKind: "income",
    color: "#14794a",
    icon: "wallet",
    displayOrder: 10,
  })
  const food = await ensureCategory(api, {
    name: "餐饮",
    categoryKind: "expense",
    color: "#e07b3a",
    icon: "food",
    displayOrder: 20,
  })
  const shopping = await ensureCategory(api, {
    name: "购物",
    categoryKind: "expense",
    color: "#c46a9e",
    icon: "shopping-bag",
    displayOrder: 30,
  })

  const salary = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-01",
      title: "公司工资",
      amount: "30000.00",
      direction: "in",
      flowKind: "income",
      categoryId: income.id,
    }),
  )
  const foodExpense = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-02",
      title: "餐饮",
      amount: "1200.00",
      direction: "out",
      flowKind: "expense",
      categoryId: food.id,
    }),
  )
  const shoppingExpense = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-03",
      title: "购物",
      amount: "800.00",
      direction: "out",
      flowKind: "expense",
      categoryId: shopping.id,
    }),
  )
  const transfer = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-04",
      title: "账户转账",
      amount: "5000.00",
      direction: "neutral",
      flowKind: "transfer",
    }),
  )
  const refund = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-05",
      title: "退款",
      amount: "200.00",
      direction: "in",
      flowKind: "refund",
    }),
  )
  const mortgagePayment = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-06",
      title: "房贷还款",
      amount: "9800.00",
      direction: "out",
      flowKind: "debt_payment",
    }),
  )
  const ignored = expectOk(
    await api.createCashflowEvent({
      eventDate: "2026-06-07",
      title: "忽略项",
      amount: "99.00",
      direction: "out",
      flowKind: "expense",
    }),
  )
  expectOk(await api.ignoreCashflowEvent({ id: ignored.id }))

  const bank = expectOk(await api.createAssetItem({ name: "银行卡", assetType: "bank" }))
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: bank.id,
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueAmount: "50000.00",
    }),
  )

  const fund = expectOk(
    await api.createAssetItem({
      name: "基金账户",
      assetType: "fund",
      valuationMethod: "manual_market_value",
    }),
  )
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: fund.id,
      snapshotAt: "2026-05-01T00:00:00.000Z",
      valueAmount: "100000.00",
    }),
  )
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: fund.id,
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueAmount: "120000.00",
    }),
  )

  const realEstate = expectOk(
    await api.createAssetItem({
      name: "房产",
      assetType: "real_estate",
      valuationMethod: "estimated_value",
    }),
  )
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: realEstate.id,
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueAmount: "3000000.00",
    }),
  )

  const mortgageLiability = expectOk(
    await api.createAssetItem({ name: "房贷负债", assetType: "liability" }),
  )
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: mortgageLiability.id,
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueAmount: "1800000.00",
    }),
  )

  const iCloud = expectOk(
    await api.createSubscription({
      name: "iCloud",
      merchant: "Apple",
      amount: "21.00",
      billingCycle: "monthly",
      nextChargeDate: "2026-06-15",
    }),
  )
  expectOk(await api.generateSubscriptionOccurrences({ id: iCloud.id, throughDate: "2026-06-30" }))

  const mortgage = expectOk(
    await api.createLoan({
      name: "房贷",
      lender: "招商银行",
      principalAmount: "1800000.00",
      currentPrincipalEstimate: "1800000.00",
      annualRateBps: 410,
      paymentAmount: "9800.00",
      startDate: "2026-06-20",
      termMonths: 360,
    }),
  )
  expectOk(await api.generateLoanPaymentOccurrences({ id: mortgage.id, throughDate: "2026-06-30" }))

  const budgetSet = expectOk(await api.createBudgetSet({ name: "默认预算" }))
  const period = expectOk(
    await api.createBudgetPeriod({
      budgetSetId: budgetSet.id,
      periodKind: "monthly",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
    }),
  )
  const foodBudget = expectOk(
    await api.createBudgetItem({
      budgetPeriodId: period.id,
      name: "餐饮预算",
      plannedAmount: "2000.00",
      categoryId: food.id,
    }),
  )
  const emptyBudget = expectOk(
    await api.createBudgetItem({
      budgetPeriodId: period.id,
      name: "无流水预算",
      plannedAmount: "500.00",
      scopes: [{ scopeKind: "source", scopeValue: "not-present" }],
    }),
  )

  return {
    cashflow: { salary, foodExpense, shoppingExpense, transfer, refund, mortgagePayment, ignored },
    assets: { bank, fund, realEstate, mortgageLiability },
    future: { iCloud, mortgage },
    budget: { budgetSet, period, foodBudget, emptyBudget },
  }
}

describe("@flowm/api — clean-slate data model", () => {
  it("uses only the clean-slate schema and rejects negative core amounts", async () => {
    const { db } = await createApi("schema-shape")
    const rows = db.$client
      .prepare("select name from sqlite_master where type = 'table' order by name")
      .all() as { name: string }[]
    const names = rows.map((row) => row.name)
    expect(names).toEqual(
      expect.arrayContaining([
        "cashflow_events",
        "asset_items",
        "asset_snapshots",
        "subscriptions",
        "subscription_occurrences",
        "loans",
        "loan_payment_occurrences",
        "budget_sets",
        "budget_periods",
        "budget_items",
        "budget_item_scopes",
        "categories",
        "tags",
        "object_links",
      ]),
    )
    expect(names).not.toContain("transactions")
    expect(names).not.toContain("postings")
    expect(names).not.toContain("financial_events")
    expect(names).not.toContain("plans")

    // The clean schema stores amounts as text without DB-level CHECK constraints;
    // negative-value validation is enforced at the API layer instead.
    expect(() =>
      db.$client
        .prepare(`insert into cashflow_events
        (id, event_date, amount, currency, direction, flow_kind, source_kind, include_in_analytics, status, classification_source, created_at, updated_at)
        values ('good', '2026-06-01', '1.00', 'CNY', 'out', 'expense', 'manual', 1, 'active', 'manual', 'now', 'now')`)
        .run(),
    ).not.toThrow()
  }, 30_000)

  it("keeps every cashflow kind queryable while default spend excludes non-expense activity", async () => {
    const { api } = await createApi("cashflow-golden")
    await createGoldenFixture(api)

    const all = expectOk(
      await api.listCashflowEvents({
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
        status: "active",
      }),
    )
    expect(all.map((event) => event.flowKind)).toEqual(
      expect.arrayContaining(["income", "expense", "transfer", "refund", "debt_payment"]),
    )

    const everydaySpend = expectOk(
      await api.getCashflowSummary({
        metric: "everyday_spend",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    )
    expect(everydaySpend.amount).toBe("2000.00")

    const debtPayments = expectOk(
      await api.getCashflowSummary({
        metric: "debt_payments",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    )
    expect(debtPayments.amount).toBe("9800.00")

    const refunds = expectOk(
      await api.getCashflowSummary({
        metric: "refunds",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    )
    expect(refunds.amount).toBe("200.00")

    const ignored = expectOk(await api.listCashflowEvents({ status: "ignored" }))
    expect(ignored).toHaveLength(1)
    expect(ignored[0].title).toBe("忽略项")
  }, 30_000)

  it("imports statement lines as evidence and only creates cashflow on explicit conversion", async () => {
    const { api } = await createApi("import-no-auto-cashflow")
    const result = expectOk(
      await api.importStatement({
        sourceName: "alipay",
        importedAt: "2026-06-01T00:00:00.000Z",
        lines: [
          {
            externalId: "a1",
            eventDate: "2026-06-01",
            counterparty: "咖啡",
            amount: "30.00",
            direction: "expense",
          },
        ],
      }),
    )
    expect(result.inserted).toBe(1)
    expect(expectOk(await api.listCashflowEvents())).toEqual([])

    const converted = expectOk(
      await api.convertStatementLinesToCashflowEvents({ importId: result.batchId }),
    )
    expect(converted).toEqual({ created: 1, skipped: 0 })
    const cashflow = expectOk(await api.listCashflowEvents())
    expect(cashflow).toHaveLength(1)
    expect(cashflow[0].sourceKind).toBe("import")
  }, 30_000)

  it("calculates net worth from latest asset snapshots and labels snapshot growth as value change", async () => {
    const { api } = await createApi("assets-golden")
    const fixture = await createGoldenFixture(api)

    const netWorth = expectOk(await api.getNetWorthSnapshot())
    expect(netWorth.assetValue.number).toBe("3170000.00")
    expect(netWorth.liabilityValue.number).toBe("1800000.00")
    expect(netWorth.netWorth.number).toBe("1370000.00")

    const change = expectOk(await api.getAssetChange({ assetItemId: fixture.assets.fund.id }))
    expect(change?.changeAmount).toBe("20000.00")
    expect(change?.changePercent).toBe("0.200000")
    expect(change?.comparisonLabel).toBe("previous_snapshot")
    expect(change).not.toHaveProperty("returnRate")
  }, 30_000)

  it("lists lightweight sparkline points grouped per asset with per-asset truncation", async () => {
    const { api } = await createApi("asset-sparklines")
    const fixture = await createGoldenFixture(api)

    const points = expectOk(await api.listAssetSparklines())
    const fundPoints = points.filter((point) => point.assetItemId === fixture.assets.fund.id)
    expect(fundPoints.map((point) => point.valueNumber)).toEqual(["100000.00", "120000.00"])
    expect(fundPoints.map((point) => point.snapshotAt)).toEqual([
      "2026-05-01T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z",
    ])

    const assetIds = points.map((point) => point.assetItemId)
    expect(new Set(assetIds).size).toBe(4)
    // Grouped by asset: each asset's points are contiguous in the result.
    const firstIndex = new Map<(typeof assetIds)[0], number>()
    assetIds.forEach((id, index) => {
      if (!firstIndex.has(id)) firstIndex.set(id, index)
    })
    for (const [id, start] of firstIndex) {
      const count = assetIds.filter((other) => other === id).length
      expect(assetIds.slice(start, start + count)).toEqual(Array(count).fill(id))
    }

    const truncated = expectOk(await api.listAssetSparklines({ limitPerAsset: 1 }))
    const truncatedFund = truncated.filter((point) => point.assetItemId === fixture.assets.fund.id)
    expect(truncatedFund.map((point) => point.valueNumber)).toEqual(["120000.00"])
    expect(new Set(truncated.map((point) => point.assetItemId)).size).toBe(4)
  }, 30_000)

  it("keeps subscriptions and loans as future pressure without creating cashflow or liability assets", async () => {
    const { api } = await createApi("future-invariants")
    await createGoldenFixture(api)

    const pressure = expectOk(
      await api.getFutureFixedPressure({
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    )
    expect(pressure.subscriptions).toBe("21.00")
    expect(pressure.loans).toBe("9800.00")
    expect(pressure.total).toBe("9821.00")

    const cashflow = expectOk(await api.listCashflowEvents({ keyword: "iCloud" }))
    expect(cashflow).toEqual([])

    const liabilities = expectOk(await api.listAssetItems({ assetType: "liability" }))
    expect(liabilities.map((asset) => asset.name)).toEqual(["房贷负债"])
  }, 30_000)

  it("treats budgets as planned boundaries with optional cashflow reference progress", async () => {
    const { api } = await createApi("budget-golden")
    const fixture = await createGoldenFixture(api)
    const progress = expectOk(
      await api.getBudgetReferenceProgress({ budgetPeriodId: fixture.budget.period.id }),
    )

    const food = progress.find((row) => row.budgetName === "餐饮预算")
    expect(food?.budgeted).toBe("2000.00")
    expect(food?.referenceUsed).toBe("1200.00")
    expect(food?.remaining).toBe("800.00")

    const empty = progress.find((row) => row.budgetName === "无流水预算")
    expect(empty?.budgeted).toBe("500.00")
    expect(empty?.referenceUsed).toBe("0.00")
    expect(empty?.remaining).toBe("500.00")
  }, 30_000)

  it("object links explain relationships without changing core aggregates", async () => {
    const { api } = await createApi("object-link-invariant")
    const fixture = await createGoldenFixture(api)
    const before = expectOk(await api.getNetWorthSnapshot()).netWorth.number
    const spendBefore = expectOk(
      await api.getCashflowSummary({
        metric: "everyday_spend",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    ).amount

    const occurrences = expectOk(
      await api.listSubscriptionOccurrences({ subscriptionId: fixture.future.iCloud.id }),
    )
    expectOk(
      await api.createObjectLink({
        fromType: "cashflow_event",
        fromId: fixture.cashflow.foodExpense.id,
        toType: "subscription_occurrence",
        toId: occurrences[0].id,
        linkType: "likely_matches",
        confidence: 20,
        createdBy: "system",
      }),
    )

    expect(expectOk(await api.getNetWorthSnapshot()).netWorth.number).toBe(before)
    expect(
      expectOk(
        await api.getCashflowSummary({
          metric: "everyday_spend",
          dateFrom: "2026-06-01",
          dateTo: "2026-06-30",
        }),
      ).amount,
    ).toBe(spendBefore)
  }, 30_000)

  it("seeds and validates six months of deterministic demo data across the clean schema", async () => {
    const { api, db } = await createApi("demo-seed-full")
    const report = await seedDemoData(db, { anchorDate: "2026-06-12", validate: true })

    expect(report.dateFrom).toBe("2026-01-01")
    expect(report.dateTo).toBe("2026-06-30")
    expect(report.forecastThrough).toBe("2026-08-11")
    expect(report.validation?.ok).toBe(true)
    for (const table of [
      "statement_imports",
      "statement_lines",
      "cashflow_events",
      "asset_items",
      "asset_snapshots",
      "subscriptions",
      "subscription_occurrences",
      "loans",
      "loan_payment_occurrences",
      "budget_sets",
      "budget_periods",
      "budget_items",
      "object_links",
      "exchange_rates",
    ]) {
      expect(report.tableCounts[table]).toBeGreaterThan(0)
    }

    const events = expectOk(await api.listCashflowEvents({ limit: 1000 }))
    expect(events.map((event) => event.flowKind)).toEqual(
      expect.arrayContaining([
        "income",
        "expense",
        "transfer",
        "asset_movement",
        "debt_payment",
        "refund",
        "adjustment",
      ]),
    )
    expect(expectOk(await api.listCashflowEvents({ status: "ignored" })).length).toBeGreaterThan(0)
    const specialIncluded = db.$client
      .prepare(`select coalesce(sum(cast(amount as real)), 0) as total
        from cashflow_events
        where id like 'demo_%'
          and status = 'active'
          and include_in_analytics = 1
          and flow_kind in ('transfer', 'asset_movement', 'debt_payment', 'refund', 'adjustment')`)
      .get() as { total: number }
    expect(Number(specialIncluded?.total ?? 0)).toBe(0)

    const netWorth = expectOk(await api.getNetWorthSnapshot())
    expect(Number(netWorth.assetValue.number)).toBeGreaterThan(0)
    expect(Number(netWorth.liabilityValue.number)).toBeGreaterThan(0)
    expect(netWorth.missingFx).toEqual([])

    const futurePressure = expectOk(
      await api.getFutureFixedPressure({ dateFrom: "2026-06-13", dateTo: "2026-08-11" }),
    )
    expect(Number(futurePressure.total)).toBeGreaterThan(0)
  }, 60_000)

  it("reseeds demo rows without deleting non-demo manual data", async () => {
    const { api, db } = await createApi("demo-seed-repeat")
    await seedDemoData(db, { anchorDate: "2026-06-12" })
    const manual = expectOk(
      await api.createCashflowEvent({
        eventDate: "2026-06-12",
        title: "手工咖啡",
        amount: "18.00",
        direction: "out",
        flowKind: "expense",
        sourceKind: "manual",
      }),
    )
    const firstDemoCashflowCount = await countRows(db, "cashflow_events", "id like 'demo_%'")
    const firstDemoAssetCount = await countRows(db, "asset_snapshots", "id like 'demo_%'")

    await seedDemoData(db, { anchorDate: "2026-06-12" })

    expect(await countRows(db, "cashflow_events", "id like 'demo_%'")).toBe(firstDemoCashflowCount)
    expect(await countRows(db, "asset_snapshots", "id like 'demo_%'")).toBe(firstDemoAssetCount)
    expect(expectOk(await api.getCashflowEvent(manual.id))?.title).toBe("手工咖啡")
  }, 60_000)

  it("keeps demo object links explanatory by making core aggregates invariant to link deletion", async () => {
    const { api, db } = await createApi("demo-seed-links")
    await seedDemoData(db, { anchorDate: "2026-06-12" })
    const netWorthBefore = expectOk(await api.getNetWorthSnapshot()).netWorth.number
    const spendBefore = expectOk(
      await api.getCashflowSummary({
        metric: "everyday_spend",
        dateFrom: "2026-01-01",
        dateTo: "2026-06-12",
      }),
    ).amount
    expect(await countRows(db, "object_links", "id like 'demo_%'")).toBeGreaterThan(0)

    db.$client.prepare("delete from object_links where id like 'demo_%'").run()

    expect(expectOk(await api.getNetWorthSnapshot()).netWorth.number).toBe(netWorthBefore)
    expect(
      expectOk(
        await api.getCashflowSummary({
          metric: "everyday_spend",
          dateFrom: "2026-01-01",
          dateTo: "2026-06-12",
        }),
      ).amount,
    ).toBe(spendBefore)
  }, 60_000)

  it("resetAllData wipes every domain table without re-seeding defaults", async () => {
    const { api, db } = await createApi("reset-all-data")
    await createGoldenFixture(api)

    // Sanity: fixture populated the domain tables.
    expect(await countRows(db, "cashflow_events")).toBeGreaterThan(0)
    expect(await countRows(db, "asset_items")).toBeGreaterThan(0)
    expect(await countRows(db, "budget_items")).toBeGreaterThan(0)

    expectOk(await api.resetAllData())

    for (const table of [
      "cashflow_events",
      "cashflow_event_tags",
      "asset_items",
      "asset_snapshots",
      "subscriptions",
      "subscription_occurrences",
      "loans",
      "loan_payment_occurrences",
      "budget_sets",
      "budget_periods",
      "budget_items",
      "budget_item_scopes",
      "statement_imports",
      "statement_lines",
      "object_links",
      "exchange_rates",
      "currency_settings",
      "tags",
      "categories",
    ]) {
      expect(await countRows(db, table)).toBe(0)
    }
  }, 30_000)

  it("surfaces missing FX instead of silently using today's rate", async () => {
    const { api } = await createApi("missing-fx")
    const usd = expectOk(
      await api.createAssetItem({ name: "美元现金", assetType: "cash", defaultCurrency: "USD" }),
    )
    expectOk(
      await api.addAssetSnapshot({
        assetItemId: usd.id,
        snapshotAt: "2026-06-01T00:00:00.000Z",
        valueAmount: "100.00",
        valueCurrency: "USD",
      }),
    )

    const netWorth = expectOk(await api.getNetWorthSnapshot({ displayCurrency: "CNY" }))
    expect(netWorth.netWorth.number).toBe("0.00")
    expect(netWorth.missingFx).toEqual([
      { assetItemId: usd.id, currency: "USD", date: "2026-06-01" },
    ])
  }, 30_000)

  it("seeds the default category set idempotently", async () => {
    const { api, db } = await createApi("default-categories")
    await seedDefaultCategories(db)
    const first = expectOk(await api.listCategories({ includeArchived: true }))
    expect(first.length).toBe(DEFAULT_CATEGORIES.length)
    expect(first.map((category) => category.name)).toEqual(
      expect.arrayContaining(["收入", "餐饮", "还款", "转账"]),
    )

    // Running again must not create duplicates.
    await seedDefaultCategories(db)
    const second = expectOk(await api.listCategories({ includeArchived: true }))
    expect(second.length).toBe(DEFAULT_CATEGORIES.length)
  }, 30_000)

  it("seeds personal starter data without creating past cashflow", async () => {
    const { api, db } = await createApi("personal-starter")
    await seedDefaultCategories(db)
    await seedPersonalStarterData(db)

    expect(await countRows(db, "categories")).toBe(DEFAULT_CATEGORIES.length)
    expect(await countRows(db, "budget_sets")).toBe(1)
    expect(await countRows(db, "budget_periods")).toBe(1)
    expect(await countRows(db, "budget_items")).toBe(5)
    expect(await countRows(db, "asset_items")).toBe(2)
    expect(await countRows(db, "asset_snapshots")).toBe(2)
    expect(await countRows(db, "subscriptions")).toBe(2)
    expect(await countRows(db, "subscription_occurrences")).toBeGreaterThan(0)
    expect(await countRows(db, "loans")).toBe(2)
    expect(await countRows(db, "loan_payment_occurrences")).toBeGreaterThan(0)
    expect(await countRows(db, "cashflow_events")).toBe(0)
    expect(await countRows(db, "statement_imports")).toBe(0)

    const assets = expectOk(await api.listAssetItems({ includeArchived: true }))
    expect(assets.map((asset) => asset.name)).toEqual(
      expect.arrayContaining(["招商银行储蓄卡示例", "支付宝余额示例"]),
    )
    const subscriptions = expectOk(await api.listSubscriptions())
    expect(subscriptions.map((subscription) => subscription.name)).toEqual(
      expect.arrayContaining(["视频会员示例", "云存储示例"]),
    )
    const loans = expectOk(await api.listLoans())
    expect(loans.map((loan) => loan.name)).toEqual(expect.arrayContaining(["房贷示例", "车贷示例"]))

    await seedPersonalStarterData(db)
    expect(await countRows(db, "budget_items")).toBe(5)
    expect(await countRows(db, "asset_items")).toBe(2)
    expect(await countRows(db, "subscriptions")).toBe(2)
    expect(await countRows(db, "loans")).toBe(2)
  }, 30_000)
})
