import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it } from "vitest"
import {
  type SqlExecutor,
  type SqlParam,
  type SqlRow,
  type SqlStatement,
  type SqlStatementResult,
} from "@flowm/db"
import { createFlowmApi, type FxRateFetchInput, type FxRateProvider } from "../src"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "../../../..")
const tmpRoot = resolve(repoRoot, ".context/api-tests")

function quoteSqlParam(param: SqlParam): string {
  if (param == null) return "NULL"
  if (typeof param === "number") return String(param)
  if (typeof param === "boolean") return param ? "1" : "0"
  return `'${(param as string).replace(/'/g, "''")}'`
}

function bindSql(sql: string, params: SqlParam[] = []): string {
  let index = 0
  const bound = sql.replace(/\?/g, () => {
    const param = params[index]
    index += 1
    return quoteSqlParam(param)
  })
  if (index !== params.length) {
    throw new Error(`SQL parameter mismatch for ${sql}`)
  }
  return bound
}

function isQuery(sql: string): boolean {
  const lower = sql.trimStart().toLowerCase()
  return (
    lower.startsWith("select") ||
    lower.startsWith("with") ||
    lower.startsWith("explain") ||
    (lower.startsWith("pragma") && !lower.includes("="))
  )
}

function parseRows(output: string): SqlRow[] {
  const trimmed = output.trim()
  return trimmed.length === 0 ? [] : (JSON.parse(trimmed) as SqlRow[])
}

class SqliteCliExecutor implements SqlExecutor {
  constructor(private readonly dbPath: string) {}

  async executeSingleSql(statement: SqlStatement): Promise<SqlStatementResult> {
    const sql = bindSql(statement.sql, statement.params)
    if (isQuery(sql)) {
      const output = execFileSync("sqlite3", ["-json", this.dbPath, sql], {
        encoding: "utf8",
      })
      return { rows: parseRows(output), rowsAffected: 0, lastInsertId: null }
    }
    const output = execFileSync(
      "sqlite3",
      [
        "-json",
        this.dbPath,
        `${sql}; select changes() as rowsAffected, last_insert_rowid() as lastInsertId;`,
      ],
      { encoding: "utf8" },
    )
    const [metadata] = parseRows(output) as Array<{
      rowsAffected?: number
      lastInsertId?: number
    }>
    return {
      rows: [],
      rowsAffected: metadata?.rowsAffected ?? 0,
      lastInsertId: metadata?.lastInsertId ?? null,
    }
  }

  async executeBatchSql(statements: SqlStatement[]): Promise<SqlStatementResult[]> {
    const results: SqlStatementResult[] = []
    for (const statement of statements) {
      results.push(await this.executeSingleSql(statement))
    }
    return results
  }
}

class FakeFxProvider implements FxRateProvider {
  readonly id = "frankfurter"
  readonly calls: FxRateFetchInput[] = []

  constructor(private readonly rates: Record<string, string>) {}

  async fetchRate(input: FxRateFetchInput) {
    this.calls.push(input)
    const rate = this.rates[`${input.fromCurrency}:${input.toCurrency}:${input.date}`]
    if (rate == null) return null
    return {
      fromCurrency: input.fromCurrency,
      toCurrency: input.toCurrency,
      rateDate: input.date,
      rate,
      provider: this.id,
      sourceDate: input.date,
      meta: { provider: "fake" },
    }
  }
}

function expectOk<T>(result: { success: true; data: T } | { success: false; error: string }) {
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function createApi(name: string, options: Parameters<typeof createFlowmApi>[1] = {}) {
  mkdirSync(tmpRoot, { recursive: true })
  const dbPath = resolve(tmpRoot, `${name}.sqlite3`)
  rmSync(dbPath, { force: true })
  const executor = new SqliteCliExecutor(dbPath)
  const api = createFlowmApi(executor, options)
  expectOk(await api.initializeFlowm())
  return { api, executor, dbPath }
}

beforeEach(() => {
  mkdirSync(tmpRoot, { recursive: true })
})

describe("@flowm/api — No-Ledger model", () => {
  it("resets old development ledger schema before creating no-ledger tables", async () => {
    mkdirSync(tmpRoot, { recursive: true })
    const dbPath = resolve(tmpRoot, "legacy-reset.sqlite3")
    rmSync(dbPath, { force: true })
    const executor = new SqliteCliExecutor(dbPath)
    await executor.executeSingleSql({ sql: "create table transactions (id integer primary key)" })
    await executor.executeSingleSql({
      sql: "create table budgets (id integer primary key, period text not null, amount_number text not null)",
    })

    const api = createFlowmApi(executor)
    expectOk(await api.initializeFlowm())
    const legacyRows = await executor.executeSingleSql({
      sql: "select name from sqlite_master where type = 'table' and name = 'transactions'",
    })
    expect(legacyRows.rows).toEqual([])
    expectOk(await api.createBudget({ name: "Fresh budget", amount: "1000.00" }))
  }, 30_000)

  it("initializes DB and seeds default categories idempotently", async () => {
    const { api, executor } = await createApi("init")
    // Should have default categories after init
    const cats = expectOk(await api.listCategories())
    expect(cats.length).toBeGreaterThan(0)
    // initializeFlowm is idempotent
    expectOk(await api.initializeFlowm())
    const cats2 = expectOk(await api.listCategories())
    expect(cats2.length).toBe(cats.length)
    // No old ledger tables should be queried
    await expect(
      executor.executeSingleSql({ sql: "select count(*) from financial_events" }),
    ).resolves.toBeDefined()
  }, 30_000)

  it("seeds the default asset dashboard view and cards", async () => {
    const { api } = await createApi("dashboard-assets")
    const views = expectOk(await api.listDashboardViews())
    expect(views.map((view) => view.id)).toEqual(["overview", "alipay", "wechat", "assets"])

    const cards = expectOk(await api.listDashboardCards({ viewId: "assets" }))
    expect(cards.map((card) => card.title)).toEqual([
      "净资产",
      "现金/钱包/银行",
      "投资资产",
      "固定资产",
      "负债",
      "订阅月成本",
      "贷款月供压力",
      "最新资产明细",
      "未来计划列表",
      "资产分布",
    ])

    const layouts = expectOk(await api.listDashboardLayouts({ viewId: "assets" }))
    expect(layouts.length).toBe(cards.length * 5)
    const sql = cards.map((card) => String(card.config.sql ?? "")).join("\n")
    expect(sql).toContain("latest_assets_display")
    expect(sql).toContain("plans_display")
  }, 30_000)

  it("creates and lists financial events", async () => {
    const { api } = await createApi("events")
    const cats = expectOk(await api.listCategories())
    const foodCat = cats.find((c) => c.name === "餐饮")

    const event = expectOk(await api.createFinancialEvent({
      date: "2025-05-01",
      counterparty: "KFC",
      description: "午餐",
      flowKind: "consumption_expense",
      categoryId: foodCat?.id,
      amount: "38.00",
      currency: "CNY",
      direction: "out",
    }))
    expect(event.id).toBeGreaterThan(0)
    expect(event.flowKind).toBe("consumption_expense")
    expect(event.classificationSource).toBe("manual")

    const events = expectOk(await api.listFinancialEvents({ dateFrom: "2025-05-01" }))
    expect(events.length).toBe(1)
    expect(events[0].counterparty).toBe("KFC")
  }, 30_000)

  it("updates and removes financial events", async () => {
    const { api } = await createApi("events-crud")
    const created = expectOk(await api.createFinancialEvent({
      date: "2025-05-01",
      description: "Test",
      flowKind: "ambiguous",
      amount: "100.00",
    }))

    const updated = expectOk(await api.updateFinancialEvent({
      id: created.id,
      flowKind: "income",
      description: "Salary",
    }))
    expect(updated.flowKind).toBe("income")
    expect(updated.classificationSource).toBe("manual")

    expectOk(await api.removeFinancialEvent({ id: created.id }))
    const events = expectOk(await api.listFinancialEvents())
    expect(events.find((e) => e.id === created.id)).toBeUndefined()
  }, 30_000)

  it("creates and lists categories", async () => {
    const { api } = await createApi("cats")
    const cat = expectOk(await api.createCategory({
      name: "测试分类",
      kind: "expense",
      color: "#FF0000",
      sortOrder: 99,
    }))
    expect(cat.name).toBe("测试分类")
    expect(cat.archived).toBe(false)

    const updated = expectOk(await api.updateCategory({ id: cat.id, name: "更新分类" }))
    expect(updated.name).toBe("更新分类")

    expectOk(await api.archiveCategory({ id: cat.id }))
    const cats = expectOk(await api.listCategories())
    const found = cats.find((c) => c.id === cat.id)
    expect(found?.archived).toBe(true)
  }, 30_000)

  it("creates plans and generates occurrences", async () => {
    const { api } = await createApi("plans")
    const plan = expectOk(await api.createPlan({
      planType: "subscription",
      name: "Netflix",
      amount: "68.00",
      currency: "CNY",
      scheduleRule: "FREQ=MONTHLY;BYMONTHDAY=15",
      startDate: "2025-01-15",
      flowKind: "consumption_expense",
    }))
    expect(plan.id).toBeGreaterThan(0)
    expect(plan.status).toBe("active")

    const { generated } = expectOk(await api.generatePlanOccurrences({
      planId: plan.id,
      throughDate: "2025-06-30",
    }))
    expect(generated).toBeGreaterThanOrEqual(5) // Jan through May + Jun = 6

    // Idempotent - running again generates nothing new
    const { generated: again } = expectOk(await api.generatePlanOccurrences({
      planId: plan.id,
      throughDate: "2025-06-30",
    }))
    expect(again).toBe(0)
  }, 30_000)

  it("keeps plans as plan-layer records without creating financial events", async () => {
    const { api } = await createApi("plan-layer")
    const subscription = expectOk(await api.createPlan({
      planType: "subscription",
      name: "iCloud",
      counterparty: "Apple",
      amount: "21.00",
      currency: "CNY",
      scheduleRule: "FREQ=MONTHLY;BYMONTHDAY=1",
      startDate: "2026-06-01",
      meta: { billingCycle: "monthly", categoryLabel: "订阅" },
    }))
    expect(subscription.meta?.billingCycle).toBe("monthly")

    const loan = expectOk(await api.createPlan({
      planType: "loan_repayment",
      name: "Mortgage",
      counterparty: "Bank",
      amount: "6000.00",
      currency: "CNY",
      scheduleRule: "FREQ=MONTHLY;BYMONTHDAY=20",
      startDate: "2026-06-20",
      meta: { principalRemaining: "620000.00", annualRate: "3.45" },
    }))
    expect(loan.planType).toBe("loan_repayment")

    const subscriptions = expectOk(await api.listPlans({ planType: "subscription", status: "active" }))
    expect(subscriptions.map((plan) => plan.name)).toEqual(["iCloud"])

    const updated = expectOk(await api.updatePlan({
      id: subscription.id,
      amount: "23.00",
      startDate: "2026-07-01",
      meta: { billingCycle: "monthly", categoryLabel: "云服务" },
    }))
    expect(updated.amount).toBe("23.00")
    expect(updated.nextDueDate).toBe("2026-07-01")
    expect(updated.meta?.categoryLabel).toBe("云服务")

    const events = expectOk(await api.listFinancialEvents())
    expect(events).toEqual([])
  }, 30_000)

  it("imports statement entries and rebuilds financial events", async () => {
    const { api } = await createApi("imports")
    const result = expectOk(await api.importNormalizedStatementEntries({
      sourceName: "alipay_personal_csv",
      importedAt: "2025-05-01T00:00:00Z",
      entries: [
        {
          externalId: "TXN001",
          occurredAt: "2025-04-30T12:00:00Z",
          date: "2025-04-30",
          counterparty: "麦当劳",
          counterpartyAccount: "shop:mcdonald",
          description: "快餐消费",
          amountNumber: "45.00",
          currency: "CNY" as const,
          sourceAccountName: "alipay",
          sourceSubAccountLabel: "balance",
          paymentMethod: "alipay_balance",
          direction: "expense" as const,
          classification: "external_expense_candidate" as const,
          confidence: 90,
          source: "alipay_personal_csv" as const,
          type: "payment",
          status: "success",
          merchantOrderId: null,
          note: null,
          raw: { original: "row" },
        },
      ],
    }))
    expect(result.inserted).toBe(1)
    expect(result.skipped).toBe(0)

    const entries = expectOk(await api.listImportedEntries())
    expect(entries.length).toBe(1)
    expect(entries[0].payee).toBe("麦当劳")

    // Import now creates financial events automatically.
    const events = expectOk(await api.listFinancialEvents({ source: "alipay_personal_csv" }))
    expect(events.length).toBe(1)
    expect(events[0].source).toBe("alipay_personal_csv")
    expect(events[0].flowKind).toBe("consumption_expense")
    expect(events[0].direction).toBe("out")
    expect(events[0].categoryName).toBe("餐饮")

    // Rebuild is idempotent when events already exist.
    const rebuild = expectOk(await api.rebuildFinancialEventsFromImports({ batchId: result.batchId }))
    expect(rebuild.created).toBe(0)
    expect(rebuild.skipped).toBe(1)

    // Running again stays idempotent.
    const rebuild2 = expectOk(await api.rebuildFinancialEventsFromImports({ batchId: result.batchId }))
    expect(rebuild2.created).toBe(0)
    expect(rebuild2.skipped).toBe(1)
  }, 30_000)

  it("upserts and removes asset snapshots, dashboard reflects net worth", async () => {
    const { api } = await createApi("assets")
    expectOk(await api.upsertAssetSnapshot({
      accountName: "bank_checking",
      assetType: "bank",
      valueNumber: "50000.00",
      valueCurrency: "CNY",
    }))
    expectOk(await api.upsertAssetSnapshot({
      accountName: "mortgage",
      assetType: "liability",
      valueNumber: "300000.00", // stored as negative
      valueCurrency: "CNY",
    }))

    const snapshots = expectOk(await api.listAssetSnapshots({ latestOnly: true }))
    expect(snapshots.length).toBe(2)
    const liability = snapshots.find((s) => s.accountName === "mortgage")
    expect(Number(liability?.valueNumber)).toBeLessThan(0)

    const snapshot = expectOk(await api.getDashboardSnapshot())
    // Net worth = 50000 + (-300000) = -250000
    expect(Number(snapshot.metrics.netWorth.number)).toBeLessThan(0)
  }, 30_000)

  it("seeds default CNY display currency settings", async () => {
    const { api } = await createApi("currency-settings")
    const settings = expectOk(await api.getCurrencySettings())
    expect(settings.displayCurrency).toBe("CNY")
    expect(settings.fxProvider).toBe("frankfurter")
  }, 30_000)

  it("does not request exchange rates for CNY-only display queries", async () => {
    const provider = new FakeFxProvider({})
    const { api } = await createApi("fx-cny-only", { fxProvider: provider })
    expectOk(await api.createFinancialEvent({
      date: "2026-05-01",
      flowKind: "consumption_expense",
      amount: "100.00",
      currency: "CNY",
    }))

    const result = expectOk(await api.runFlowQuery({
      sql: `select round(sum(amount_display), 2) as total
            from financial_events_display
            where fx_status in ('same_currency', 'converted')`,
    }))

    expect(Number(result.rows[0]?.total)).toBe(100)
    expect(provider.calls).toHaveLength(0)
  }, 30_000)

  it("fetches and caches missing display currency rates", async () => {
    const provider = new FakeFxProvider({ "USD:CNY:2026-05-01": "7.20" })
    const { api } = await createApi("fx-usd", { fxProvider: provider })
    expectOk(await api.createFinancialEvent({
      date: "2026-05-01",
      flowKind: "income",
      amount: "100.00",
      currency: "USD",
    }))

    const first = expectOk(await api.runFlowQuery({
      sql: `select round(sum(amount_display), 2) as total
            from financial_events_display
            where fx_status in ('same_currency', 'converted')`,
    }))
    const second = expectOk(await api.runFlowQuery({
      sql: `select round(sum(amount_display), 2) as total
            from financial_events_display
            where fx_status in ('same_currency', 'converted')`,
    }))

    expect(Number(first.rows[0]?.total)).toBe(720)
    expect(Number(second.rows[0]?.total)).toBe(720)
    expect(provider.calls).toHaveLength(1)
    const rates = expectOk(await api.listExchangeRates())
    expect(rates).toHaveLength(1)
    expect(rates[0].rate).toBe("7.20")
  }, 30_000)

  it("marks non-currency asset units as unsupported without fetching FX", async () => {
    const provider = new FakeFxProvider({})
    const { api } = await createApi("fx-unsupported", { fxProvider: provider })
    expectOk(await api.upsertAssetSnapshot({
      accountName: "A股沪深300",
      assetType: "investment",
      quantityNumber: "100",
      quantityCurrency: "CSI300",
      valueNumber: "1.00",
      valueCurrency: "CSI300",
    }))

    const result = expectOk(await api.runFlowQuery({
      sql: "select account_name, fx_status from latest_assets_display",
    }))

    expect(result.rows[0]?.fx_status).toBe("unsupported")
    expect(provider.calls).toHaveLength(0)
  }, 30_000)

  it("selects latest asset snapshots by snapshot date and preserves metadata", async () => {
    const { api } = await createApi("assets-latest")
    expectOk(await api.upsertAssetSnapshot({
      accountName: "brokerage",
      assetType: "investment",
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueNumber: "12000.00",
      meta: { quantityNumber: "100", unit: "ETF", costBasis: "10000.00" },
    }))
    expectOk(await api.upsertAssetSnapshot({
      accountName: "brokerage",
      assetType: "investment",
      snapshotAt: "2026-05-01T00:00:00.000Z",
      valueNumber: "999999.00",
    }))
    const tieBreaker = expectOk(await api.upsertAssetSnapshot({
      accountName: "brokerage",
      assetType: "investment",
      snapshotAt: "2026-06-01T00:00:00.000Z",
      valueNumber: "12500.00",
      meta: { quantityNumber: "100", unit: "ETF", marketValue: "12500.00" },
    }))

    const latest = expectOk(await api.listAssetSnapshots({ accountName: "brokerage", latestOnly: true }))
    expect(latest).toHaveLength(1)
    expect(latest[0].id).toBe(tieBreaker.id)
    expect(latest[0].valueNumber).toBe("12500.00")
    expect(latest[0].meta?.unit).toBe("ETF")
    expect(latest[0].meta?.marketValue).toBe("12500.00")
  }, 30_000)

  it("creates budgets and computes progress from financial events", async () => {
    const { api } = await createApi("budgets")
    const budget = expectOk(await api.createBudget({
      name: "May Expenses",
      amount: "3000.00",
      periodKind: "monthly",
      periodStart: "2025-05-01",
      periodEnd: "2025-05-31",
    }))
    expect(budget.id).toBeGreaterThan(0)

    // Add a financial event in budget period
    expectOk(await api.createFinancialEvent({
      date: "2025-05-15",
      flowKind: "consumption_expense",
      amount: "500.00",
    }))

    const progress = expectOk(await api.getBudgetProgress({ period: "2025-05" }))
    expect(progress.length).toBe(1)
    expect(Number(progress[0].actual)).toBe(500)
    expect(Number(progress[0].remaining)).toBe(2500)
  }, 30_000)

  it("applies budget scopes to financial event progress", async () => {
    const { api } = await createApi("budget-scopes")
    const categories = expectOk(await api.listCategories())
    const food = categories.find((category) => category.name === "餐饮")
    const shopping = categories.find((category) => category.name === "购物")
    if (food == null || shopping == null) throw new Error("Expected default categories")

    expectOk(await api.createBudget({
      name: "Food on Alipay",
      amount: "1000.00",
      periodKind: "monthly",
      periodStart: "2025-05-01",
      periodEnd: "2025-05-31",
      scopes: [
        { scopeKind: "category", scopeValue: String(food.id) },
        { scopeKind: "source", scopeValue: "alipay_personal_csv" },
      ],
    }))
    await api.createFinancialEvent({
      date: "2025-05-01",
      flowKind: "consumption_expense",
      categoryId: food.id,
      amount: "100.00",
      direction: "out",
    })
    await api.createFinancialEvent({
      date: "2025-05-02",
      flowKind: "consumption_expense",
      categoryId: shopping.id,
      amount: "200.00",
      direction: "out",
    })
    await api.runFlowQuery({
      sql: "update financial_events set source = 'alipay_personal_csv' where amount = '100.00'",
    })
    await api.runFlowQuery({
      sql: "update financial_events set source = 'wechat_personal_xlsx' where amount = '200.00'",
    })

    const progress = expectOk(await api.getBudgetProgress({ period: "2025-05" }))
    expect(progress.length).toBe(1)
    expect(Number(progress[0].actual)).toBe(100)
    expect(Number(progress[0].remaining)).toBe(900)
  }, 30_000)

  it("runFlowQuery aggregates financial events by flow_kind", async () => {
    const { api } = await createApi("query")
    await api.createFinancialEvent({ date: "2025-05-01", flowKind: "income", amount: "8000.00" })
    await api.createFinancialEvent({ date: "2025-05-10", flowKind: "consumption_expense", amount: "500.00" })
    await api.createFinancialEvent({ date: "2025-05-20", flowKind: "consumption_expense", amount: "300.00" })

    const result = expectOk(await api.runFlowQuery({
      from: "financial_events",
      dateFrom: "2025-05-01",
      dateTo: "2025-05-31",
      groupBy: "flow_kind",
      aggregation: "sum",
    }))
    expect(result.rows.length).toBeGreaterThan(0)
    const expenseRow = result.rows.find((r) => r.flow_kind === "consumption_expense")
    expect(Number(expenseRow?.total)).toBeCloseTo(800, 0)
  }, 30_000)
})
