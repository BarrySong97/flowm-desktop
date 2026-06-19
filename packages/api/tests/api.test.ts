/**
 * @purpose Exercise the Flowm API facade against an isolated SQLite database.
 * @role    Integration safety net for product behavior and schema/API contracts.
 * @deps    Vitest, @flowm/api, @flowm/db, and Electron-compatible SQLite setup.
 * @gotcha  Run through Electron Node when touching better-sqlite3.
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it } from "vitest"
import BetterSqlite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { type Database, schema } from "@flowm/db"
import { createFlowmApi, createFrankfurterFxProvider, type FlowmApi } from "../src"
import type { FlowmApiOptions } from "../src"
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

function applyMigrationSql(client: BetterSqlite3.Database, tag: string) {
  const raw = readFileSync(join(migrationsFolder, `${tag}.sql`), "utf8")
  for (const statement of raw
    .split("--> statement-breakpoint")
    .map((part) => part.trim())
    .filter(Boolean)) {
    client.exec(statement)
  }
}

function expectOk<T>(result: { success: true; data: T } | { success: false; error: string }) {
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function createApi(name: string, options?: FlowmApiOptions) {
  mkdirSync(tmpRoot, { recursive: true })
  const dbPath = resolve(tmpRoot, `${name}.sqlite3`)
  rmSync(dbPath, { force: true })
  const db = createDb(dbPath)
  const api = createFlowmApi(db, options)
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

  // Informal, non-loan debt (e.g. revolving credit card) — distinct from the 房贷
  // loan below so net worth sums the two without double-counting one mortgage.
  const cardLiability = expectOk(
    await api.createAssetItem({ name: "信用卡欠款", assetType: "liability" }),
  )
  expectOk(
    await api.addAssetSnapshot({
      assetItemId: cardLiability.id,
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueAmount: "30000.00",
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
    assets: { bank, fund, realEstate, cardLiability },
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

  it("summarizes monthly income, expense, and net cashflow without mixing other cashflow kinds", async () => {
    const { api } = await createApi("cashflow-monthly-trend")
    await createGoldenFixture(api)

    const trend = expectOk(
      await api.getMonthlyCashflowTrend({
        dateFrom: "2026-05-01",
        dateTo: "2026-06-30",
        months: 2,
      }),
    )

    expect(trend).toEqual([
      {
        month: "2026-05",
        income: "0.00",
        expense: "0.00",
        net: "0.00",
        currency: "CNY",
      },
      {
        month: "2026-06",
        income: "30000.00",
        expense: "2000.00",
        net: "28000.00",
        currency: "CNY",
      },
    ])
  }, 30_000)

  it("migrates existing cashflow rows onto same-name categories with matching kind", async () => {
    const dbPath = resolve(tmpRoot, "category-kind-migration.sqlite3")
    rmSync(dbPath, { force: true })
    const client = new BetterSqlite3(dbPath)
    client.pragma("foreign_keys = ON")
    applyMigrationSql(client, "0000_melted_misty_knight")
    applyMigrationSql(client, "0001_noisy_wendigo")

    client
      .prepare(
        `insert into categories
        (id, name, category_kind, color, icon, display_order, created_at, updated_at)
        values
        ('cat_red_packet_expense', '红包', 'expense', '#e07b3a', 'gift', 10, '2026-06-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z')`,
      )
      .run()
    client
      .prepare(
        `insert into cashflow_events
        (id, event_date, amount, currency, direction, flow_kind, category_id, source_kind, include_in_analytics, status, classification_source, created_at, updated_at)
        values
        ('cf_income_wrong_category', '2026-06-02', '200.00', 'CNY', 'in', 'income', 'cat_red_packet_expense', 'manual', 1, 'active', 'manual', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z'),
        ('cf_expense_stays_category', '2026-06-03', '20.00', 'CNY', 'out', 'expense', 'cat_red_packet_expense', 'manual', 1, 'active', 'manual', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z')`,
      )
      .run()

    applyMigrationSql(client, "0002_kind_category_boundary")
    applyMigrationSql(client, "0002_kind_category_boundary")

    const categories = client
      .prepare(
        `select id, name, category_kind as categoryKind, color, icon
        from categories
        where name = '红包'
        order by category_kind`,
      )
      .all() as Array<{
      id: string
      name: string
      categoryKind: string
      color: string | null
      icon: string | null
    }>
    expect(categories.map((category) => category.categoryKind)).toEqual(["expense", "income"])
    expect(categories.filter((category) => category.categoryKind === "income")).toHaveLength(1)
    expect(categories.find((category) => category.categoryKind === "income")?.color).toBe("#e07b3a")
    expect(categories.find((category) => category.categoryKind === "income")?.icon).toBe("gift")

    const rows = client
      .prepare(
        `select cashflow_events.id, categories.category_kind as categoryKind
        from cashflow_events
        inner join categories on categories.id = cashflow_events.category_id
        order by cashflow_events.id`,
      )
      .all() as Array<{ id: string; categoryKind: string }>
    expect(rows).toEqual([
      { id: "cf_expense_stays_category", categoryKind: "expense" },
      { id: "cf_income_wrong_category", categoryKind: "income" },
    ])
    client.close()
  }, 30_000)

  it("rejects cashflow categories whose kind does not match the cashflow kind", async () => {
    const { api } = await createApi("cashflow-category-kind-guard")
    const income = await ensureCategory(api, {
      name: "工资",
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

    const rejectedCreate = await api.createCashflowEvent({
      eventDate: "2026-06-08",
      title: "公司工资",
      amount: "30000.00",
      direction: "in",
      flowKind: "income",
      categoryId: food.id,
    })
    expect(rejectedCreate.success).toBe(false)
    if (!rejectedCreate.success) expect(rejectedCreate.error).toContain("cannot be used")

    const expense = expectOk(
      await api.createCashflowEvent({
        eventDate: "2026-06-08",
        title: "午餐",
        amount: "42.00",
        direction: "out",
        flowKind: "expense",
        categoryId: food.id,
      }),
    )

    const rejectedFlowChange = await api.updateCashflowEvent({
      id: expense.id,
      direction: "in",
      flowKind: "income",
    })
    expect(rejectedFlowChange.success).toBe(false)
    if (!rejectedFlowChange.success) expect(rejectedFlowChange.error).toContain("cannot be used")

    const rejectedCategoryChange = await api.updateCashflowEvent({
      id: expense.id,
      categoryId: income.id,
    })
    expect(rejectedCategoryChange.success).toBe(false)
    if (!rejectedCategoryChange.success)
      expect(rejectedCategoryChange.error).toContain("cannot be used")
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

  it("dry-runs agent ledger patches without writing rows", async () => {
    const { api, db } = await createApi("agent-ledger-dry-run")

    const result = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: true,
        operations: [
          { op: "category.ensure", name: "交通", categoryKind: "expense" },
          {
            op: "cashflow.create",
            sourceKind: "import",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-001",
            eventDate: "2026-06-01",
            amount: "28.50",
            direction: "out",
            flowKind: "expense",
            counterparty: "滴滴出行",
            categoryName: "交通",
          },
        ],
      }),
    )

    expect(result.dryRun).toBe(true)
    expect(result.created).toBe(2)
    expect(result.conflicts).toBe(0)
    expect(await countRows(db, "categories")).toBe(0)
    expect(await countRows(db, "cashflow_events")).toBe(0)
  }, 30_000)

  it("commits agent imported cashflow idempotently by source identity", async () => {
    const { api } = await createApi("agent-ledger-idempotent")
    const patch = {
      dryRun: false,
      operations: [
        { op: "category.ensure" as const, name: "交通", categoryKind: "expense" },
        {
          op: "cashflow.create" as const,
          sourceKind: "import" as const,
          sourceName: "wechat-pay",
          sourceExternalId: "wx-001",
          sourceFileHash: "sha256:first-file",
          eventDate: "2026-06-01",
          importedAt: "2026-06-16T00:00:00.000Z",
          amount: "28.50",
          direction: "out" as const,
          flowKind: "expense" as const,
          counterparty: "滴滴出行",
          categoryName: "交通",
        },
      ],
    }

    const first = expectOk(await api.applyAgentLedgerPatch(patch))
    expect(first.dryRun).toBe(false)
    expect(first.created).toBe(2)
    expect(first.skipped).toBe(0)

    const cashflow = expectOk(
      await api.listCashflowEvents({
        sourceName: "wechat-pay",
        sourceExternalId: "wx-001",
      }),
    )
    expect(cashflow).toHaveLength(1)
    expect(cashflow[0].sourceKind).toBe("import")
    expect(cashflow[0].sourceExternalId).toBe("wx-001")
    expect(cashflow[0].sourceFileHash).toBe("sha256:first-file")
    expect(cashflow[0].importedAt).toBe("2026-06-16T00:00:00.000Z")
    expect(cashflow[0].categoryName).toBe("交通")

    const second = expectOk(await api.applyAgentLedgerPatch(patch))
    expect(second.created).toBe(0)
    expect(second.skipped).toBe(2)
    expect(
      expectOk(
        await api.listCashflowEvents({
          sourceName: "wechat-pay",
          sourceExternalId: "wx-001",
        }),
      ),
    ).toHaveLength(1)
  }, 30_000)

  it("classifies existing agent-imported cashflow by source identity", async () => {
    const { api } = await createApi("agent-ledger-classify")
    expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.create",
            sourceKind: "import",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-classify-001",
            eventDate: "2026-06-02",
            amount: "16.00",
            direction: "out",
            flowKind: "expense",
            counterparty: "便利店",
            categoryName: "餐饮",
          },
        ],
      }),
    )

    const dryRun = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: true,
        operations: [
          {
            op: "cashflow.classify",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-classify-001",
            categoryName: "购物",
            categoryKind: "expense",
            classificationSource: "rule",
          },
        ],
      }),
    )
    expect(dryRun.updated).toBe(1)
    expect(dryRun.operations[0].action).toBe("update")
    expect(dryRun.operations[0].warnings).toContain("Would create category: 购物")
    expect(
      expectOk(
        await api.listCashflowEvents({
          sourceName: "wechat-pay",
          sourceExternalId: "wx-classify-001",
        }),
      )[0].categoryName,
    ).toBe("餐饮")

    const commit = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.classify",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-classify-001",
            categoryName: "购物",
            categoryKind: "expense",
            classificationSource: "rule",
          },
        ],
      }),
    )
    expect(commit.updated).toBe(1)
    expect(commit.operations[0].action).toBe("update")

    const cashflow = expectOk(
      await api.listCashflowEvents({
        sourceName: "wechat-pay",
        sourceExternalId: "wx-classify-001",
      }),
    )
    expect(cashflow[0].categoryName).toBe("购物")
    expect(cashflow[0].classificationSource).toBe("rule")

    const second = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.classify",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-classify-001",
            categoryName: "购物",
            categoryKind: "expense",
            classificationSource: "rule",
          },
        ],
      }),
    )
    expect(second.updated).toBe(0)
    expect(second.skipped).toBe(1)
    expect(second.operations[0].action).toBe("skip")
  }, 30_000)

  it("keeps agent cashflow classification inside the target event category kind", async () => {
    const { api } = await createApi("agent-ledger-classify-kind-guard")
    const created = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.create",
            sourceKind: "import",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-income-001",
            eventDate: "2026-06-03",
            amount: "600.00",
            direction: "in",
            flowKind: "income",
            counterparty: "客户转账",
            categoryName: "副业",
          },
        ],
      }),
    )
    expect(created.created).toBe(1)

    const rejected = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: true,
        operations: [
          {
            op: "cashflow.classify",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-income-001",
            categoryName: "餐饮",
            categoryKind: "expense",
          },
        ],
      }),
    )
    expect(rejected.operations[0].action).toBe("reject")
    expect(rejected.operations[0].message).toContain("does not match income cashflow")

    const accepted = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.classify",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-income-001",
            categoryName: "奖金",
          },
        ],
      }),
    )
    expect(accepted.updated).toBe(1)
    expect(
      expectOk(
        await api.listCategories({
          categoryKind: "income",
          includeArchived: true,
        }),
      ).map((category) => category.name),
    ).toEqual(expect.arrayContaining(["副业", "奖金"]))
  }, 30_000)

  it("reports source conflicts and rolls back partial agent patch commits", async () => {
    const { api } = await createApi("agent-ledger-conflict")
    expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: false,
        operations: [
          {
            op: "cashflow.create",
            sourceKind: "import",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-001",
            eventDate: "2026-06-01",
            amount: "28.50",
            direction: "out",
            flowKind: "expense",
            counterparty: "滴滴出行",
            categoryName: "交通",
          },
        ],
      }),
    )

    const dryRun = expectOk(
      await api.applyAgentLedgerPatch({
        dryRun: true,
        operations: [
          { op: "category.ensure", name: "冲突中不应写入", categoryKind: "expense" },
          {
            op: "cashflow.create",
            sourceKind: "import",
            sourceName: "wechat-pay",
            sourceExternalId: "wx-001",
            eventDate: "2026-06-01",
            amount: "99.00",
            direction: "out",
            flowKind: "expense",
            counterparty: "滴滴出行",
            categoryName: "交通",
          },
        ],
      }),
    )
    expect(dryRun.conflicts).toBe(1)
    expect(dryRun.operations[1].action).toBe("conflict")

    const commit = await api.applyAgentLedgerPatch({
      dryRun: false,
      operations: [
        { op: "category.ensure", name: "冲突中不应写入", categoryKind: "expense" },
        {
          op: "cashflow.create",
          sourceKind: "import",
          sourceName: "wechat-pay",
          sourceExternalId: "wx-001",
          eventDate: "2026-06-01",
          amount: "99.00",
          direction: "out",
          flowKind: "expense",
          counterparty: "滴滴出行",
          categoryName: "交通",
        },
      ],
    })
    expect(commit.success).toBe(false)
    expect(
      expectOk(await api.listCategories({ includeArchived: true })).some(
        (category) => category.name === "冲突中不应写入",
      ),
    ).toBe(false)
    expect(
      expectOk(
        await api.listCashflowEvents({
          sourceName: "wechat-pay",
          sourceExternalId: "wx-001",
        }),
      )[0].amount,
    ).toBe("28.50")
  }, 30_000)

  it("calculates net worth from latest asset snapshots and labels snapshot growth as value change", async () => {
    const { api } = await createApi("assets-golden")
    const fixture = await createGoldenFixture(api)

    const netWorth = expectOk(await api.getNetWorthSnapshot())
    expect(netWorth.assetValue.number).toBe("3170000.00")
    // 30,000 informal card debt + 1,800,000 outstanding loan principal.
    expect(netWorth.liabilityValue.number).toBe("1830000.00")
    expect(netWorth.netWorth.number).toBe("1340000.00")

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

  it("hides archived asset items from active views while allowing archived history and restore", async () => {
    const { api } = await createApi("archived-asset-snapshots")
    const fixture = await createGoldenFixture(api)

    expectOk(await api.archiveAssetItem({ id: fixture.assets.fund.id }))

    const items = expectOk(await api.listAssetItems())
    expect(items.map((asset) => asset.id)).not.toContain(fixture.assets.fund.id)

    const archivedItems = expectOk(await api.listAssetItems({ includeArchived: true }))
    const archivedFund = archivedItems.find((asset) => asset.id === fixture.assets.fund.id)
    expect(archivedFund?.archived).toBe(true)
    expect(archivedFund?.archivedAt).toEqual(expect.any(String))

    const latestSnapshots = expectOk(await api.listAssetSnapshots({ latestOnly: true }))
    expect(latestSnapshots.map((snapshot) => snapshot.assetItemId)).not.toContain(
      fixture.assets.fund.id,
    )

    const fundHistory = expectOk(
      await api.listAssetSnapshots({ assetItemId: fixture.assets.fund.id }),
    )
    expect(fundHistory).toEqual([])

    const archivedFundHistory = expectOk(
      await api.listAssetSnapshots({
        assetItemId: fixture.assets.fund.id,
        includeArchived: true,
      }),
    )
    expect(archivedFundHistory.map((snapshot) => snapshot.valueNumber)).toEqual([
      "120000.00",
      "100000.00",
    ])

    const points = expectOk(await api.listAssetSparklines())
    expect(points.map((point) => point.assetItemId)).not.toContain(fixture.assets.fund.id)

    const netWorth = expectOk(await api.getNetWorthSnapshot())
    expect(netWorth.assetValue.number).toBe("3050000.00")
    expect(netWorth.netWorth.number).toBe("1220000.00")

    expectOk(await api.restoreAssetItem({ id: fixture.assets.fund.id }))

    const restoredItems = expectOk(await api.listAssetItems())
    expect(restoredItems.map((asset) => asset.id)).toContain(fixture.assets.fund.id)

    const restoredNetWorth = expectOk(await api.getNetWorthSnapshot())
    expect(restoredNetWorth.assetValue.number).toBe("3170000.00")
    expect(restoredNetWorth.netWorth.number).toBe("1340000.00")
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

    // The loan does not create a liability asset; only the manually tracked
    // informal debt appears here. The loan's principal feeds net worth separately.
    const liabilities = expectOk(await api.listAssetItems({ assetType: "liability" }))
    expect(liabilities.map((asset) => asset.name)).toEqual(["信用卡欠款"])
  }, 30_000)

  it("clears forecast occurrences when a subscription or loan is archived so they stop surfacing", async () => {
    const { api } = await createApi("archive-clears-occurrences")
    const fixture = await createGoldenFixture(api)
    const window = { dateFrom: "2026-06-01", dateTo: "2026-06-30" }

    // Baseline: both the subscription and loan contribute to upcoming pressure.
    const before = expectOk(await api.getFutureFixedPressure(window))
    expect(before.subscriptions).toBe("21.00")
    expect(before.loans).toBe("9800.00")

    expectOk(await api.archiveSubscription({ id: fixture.future.iCloud.id }))
    expectOk(await api.archiveLoan({ id: fixture.future.mortgage.id }))

    // Forecast occurrences are gone, not just orphaned by a status flip.
    expect(
      expectOk(await api.listSubscriptionOccurrences({ subscriptionId: fixture.future.iCloud.id })),
    ).toEqual([])
    expect(
      expectOk(await api.listLoanPaymentOccurrences({ loanId: fixture.future.mortgage.id })),
    ).toEqual([])

    // Broad listings and pressure no longer leak the canceled items.
    const occurrences = expectOk(await api.listSubscriptionOccurrences(window))
    expect(occurrences.some((o) => o.subscriptionId === fixture.future.iCloud.id)).toBe(false)
    const after = expectOk(await api.getFutureFixedPressure(window))
    expect(after.subscriptions).toBe("0.00")
    expect(after.loans).toBe("0.00")
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

  it("converts foreign-currency net worth via the FX provider and caches the rate", async () => {
    let calls = 0
    const fetchImpl = (async (input: string | URL) => {
      calls += 1
      const url = String(input)
      expect(url).toContain("/2026-06-01")
      expect(url).toContain("from=USD")
      expect(url).toContain("to=CNY")
      return {
        ok: true,
        json: async () => ({ base: "USD", date: "2026-06-01", rates: { CNY: 7.2 } }),
      } as Response
    }) as typeof fetch
    const fxProvider = createFrankfurterFxProvider({ fetchImpl })
    const { api } = await createApi("fx-cached", { fxProvider })

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

    const first = expectOk(await api.getNetWorthSnapshot({ displayCurrency: "CNY" }))
    expect(first.netWorth.number).toBe("720.00")
    expect(first.missingFx).toEqual([])
    expect(calls).toBe(1)

    // Second call for the same date must hit the cached rate, not the network.
    const second = expectOk(await api.getNetWorthSnapshot({ displayCurrency: "CNY" }))
    expect(second.netWorth.number).toBe("720.00")
    expect(calls).toBe(1)
  }, 30_000)

  it("frankfurter provider parses rates, short-circuits same currency, and fails soft", async () => {
    const okFetch = (async () =>
      ({
        ok: true,
        json: async () => ({ date: "2026-06-01", rates: { CNY: 7.1 } }),
      }) as Response) as typeof fetch
    const provider = createFrankfurterFxProvider({ fetchImpl: okFetch })

    const rate = await provider.fetchRate({
      fromCurrency: "USD",
      toCurrency: "CNY",
      date: "2026-06-02",
    })
    expect(rate?.rate).toBe("7.1")
    // Cache key follows the requested date; the ECB publication date is sourceDate.
    expect(rate?.rateDate).toBe("2026-06-02")
    expect(rate?.sourceDate).toBe("2026-06-01")

    const same = await provider.fetchRate({
      fromCurrency: "CNY",
      toCurrency: "CNY",
      date: "2026-06-02",
    })
    expect(same?.rate).toBe("1")

    const failFetch = (async () => ({ ok: false }) as Response) as typeof fetch
    const failing = createFrankfurterFxProvider({ fetchImpl: failFetch })
    expect(
      await failing.fetchRate({ fromCurrency: "USD", toCurrency: "CNY", date: "2026-06-02" }),
    ).toBeNull()
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
