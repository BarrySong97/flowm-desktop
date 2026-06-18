/**
 * @purpose Create deterministic demo data across Flowm cashflow, assets, budgets, subscriptions, and loans.
 * @role    Demo fixture builder for app previews, tests, and packaged sample ledgers.
 * @deps    @flowm/db schema and API seed utilities.
 * @gotcha  Demo forecasts and snapshots still follow the asymmetric model; do not reconcile them artificially.
 */

import { and, eq, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm"
import { type SQLiteTable } from "drizzle-orm/sqlite-core"
import {
  assetItems,
  assetSnapshots,
  budgetItemScopes,
  budgetItems,
  budgetPeriods,
  budgetSets,
  cashflowEventTags,
  cashflowEvents,
  categories,
  currencySettings,
  exchangeRates,
  loanPaymentOccurrences,
  loans,
  objectLinks,
  statementImports,
  statementLines,
  subscriptionOccurrences,
  subscriptions,
  tags,
  type CashflowEventRow,
  type Database,
} from "@flowm/db"
import { createFlowmApi, type FlowmId } from "./index"

const DEMO_PREFIX = "demo_"
const DEFAULT_MONTHS = 6
const DEFAULT_FUTURE_DAYS = 60
const CNY = "CNY"

const TARGET_TABLES = [
  "statement_imports",
  "statement_lines",
  "cashflow_events",
  "cashflow_event_tags",
  "tags",
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
  "object_links",
  "currency_settings",
  "exchange_rates",
] as const

type TargetTable = (typeof TARGET_TABLES)[number]
type Direction = "in" | "out" | "neutral"
type CashflowKind =
  | "income"
  | "expense"
  | "transfer"
  | "asset_movement"
  | "debt_payment"
  | "refund"
  | "adjustment"
type StatementStatus = "pending" | "converted" | "ignored"
type CashflowStatus = "active" | "ignored" | "deleted"

const TABLE_MAP: Record<TargetTable, SQLiteTable> = {
  statement_imports: statementImports,
  statement_lines: statementLines,
  cashflow_events: cashflowEvents,
  cashflow_event_tags: cashflowEventTags,
  tags,
  asset_items: assetItems,
  asset_snapshots: assetSnapshots,
  subscriptions,
  subscription_occurrences: subscriptionOccurrences,
  loans,
  loan_payment_occurrences: loanPaymentOccurrences,
  budget_sets: budgetSets,
  budget_periods: budgetPeriods,
  budget_items: budgetItems,
  budget_item_scopes: budgetItemScopes,
  object_links: objectLinks,
  currency_settings: currencySettings,
  exchange_rates: exchangeRates,
}

const SPECIAL_FLOW_KINDS: CashflowEventRow["flowKind"][] = [
  "transfer",
  "asset_movement",
  "debt_payment",
  "refund",
  "adjustment",
]

export interface DemoSeedOptions {
  anchorDate?: string
  months?: number
  futureDays?: number
  dryRun?: boolean
  validate?: boolean
}

export interface DemoSeedReport {
  anchorDate: string
  dateFrom: string
  dateTo: string
  forecastThrough: string
  dryRun: boolean
  created: Record<string, number>
  deleted: Record<string, number>
  tableCounts: Record<string, number>
  validation?: DemoSeedValidationReport
}

export interface DemoSeedValidationReport {
  ok: boolean
  issues: string[]
  metrics: Record<string, string | number | boolean>
}

interface SeedContext {
  anchorDate: string
  dateFrom: string
  dateTo: string
  forecastThrough: string
  months: Date[]
  categoryIds: Record<string, string | null>
  tagIds: Record<string, string>
}

interface DemoStatement {
  table: TargetTable
  exec: (db: Database) => void
}

interface DemoBuildResult {
  statements: DemoStatement[]
  created: Record<string, number>
}

const SOURCES = [
  { key: "alipay", name: "支付宝", filePrefix: "alipay", account: "支付宝余额" },
  { key: "wechat", name: "微信支付", filePrefix: "wechat", account: "微信零钱" },
  { key: "cmb", name: "招商银行", filePrefix: "cmb", account: "招商银行储蓄卡" },
  { key: "icbc", name: "工商银行", filePrefix: "icbc", account: "工商银行工资卡" },
] as const

const DEMO_TAGS = [
  { key: "salary", name: "工资", color: "#14794a" },
  { key: "food", name: "餐饮", color: "#e07b3a" },
  { key: "commute", name: "通勤", color: "#4a8fc4" },
  { key: "subscription", name: "自动扣费", color: "#7c6ac4" },
  { key: "investment", name: "投资", color: "#2f6f6d" },
  { key: "loan", name: "还款", color: "#8b6a47" },
  { key: "refund", name: "退款", color: "#6f9f6b" },
  { key: "ignored", name: "忽略项", color: "#7d8580" },
] as const

const SUBSCRIPTIONS = [
  {
    key: "icloud",
    name: "iCloud+",
    merchant: "Apple",
    amount: 21,
    currency: "CNY",
    cycle: "monthly",
    day: 15,
    source: "cmb",
  },
  {
    key: "chatgpt",
    name: "ChatGPT Plus",
    merchant: "OpenAI",
    amount: 20,
    currency: "USD",
    cycle: "monthly",
    day: 20,
    source: "cmb",
  },
  {
    key: "spotify",
    name: "Spotify",
    merchant: "Spotify",
    amount: 72,
    currency: "CNY",
    cycle: "monthly",
    day: 5,
    source: "alipay",
  },
  {
    key: "notion",
    name: "Notion",
    merchant: "Notion Labs",
    amount: 96,
    currency: "USD",
    cycle: "yearly",
    day: 8,
    source: "cmb",
  },
  {
    key: "tencent_video",
    name: "腾讯视频",
    merchant: "腾讯",
    amount: 25,
    currency: "CNY",
    cycle: "monthly",
    day: 12,
    source: "wechat",
  },
  {
    key: "github",
    name: "GitHub",
    merchant: "GitHub",
    amount: 4,
    currency: "USD",
    cycle: "monthly",
    day: 2,
    source: "cmb",
  },
] as const

const LOANS = [
  {
    key: "mortgage",
    name: "上海住宅房贷",
    lender: "招商银行",
    principal: 1_780_000,
    current: 1_742_000,
    rate: 385,
    payment: 9850,
    day: 20,
    termMonths: 300,
  },
  {
    key: "car",
    name: "车辆贷款",
    lender: "工商银行",
    principal: 180_000,
    current: 122_000,
    rate: 420,
    payment: 2350,
    day: 8,
    termMonths: 72,
  },
  {
    key: "consumer",
    name: "消费分期",
    lender: "招商银行",
    principal: 36_000,
    current: 18_000,
    rate: 720,
    payment: 1800,
    day: 18,
    termMonths: 24,
  },
] as const

const ASSETS = [
  {
    key: "cash",
    name: "现金备用",
    type: "cash",
    institution: null,
    currency: "CNY",
    method: "manual_balance",
    base: 2600,
    step: 45,
  },
  {
    key: "cmb_bank",
    name: "招商银行储蓄卡",
    type: "bank",
    institution: "招商银行",
    currency: "CNY",
    method: "manual_balance",
    base: 62_000,
    step: 1800,
  },
  {
    key: "icbc_bank",
    name: "工商银行工资卡",
    type: "bank",
    institution: "工商银行",
    currency: "CNY",
    method: "manual_balance",
    base: 38_000,
    step: 1250,
  },
  {
    key: "alipay",
    name: "支付宝余额宝",
    type: "wallet",
    institution: "支付宝",
    currency: "CNY",
    method: "manual_balance",
    base: 15_000,
    step: 550,
  },
  {
    key: "wechat",
    name: "微信零钱",
    type: "wallet",
    institution: "微信",
    currency: "CNY",
    method: "manual_balance",
    base: 4200,
    step: 160,
  },
  {
    key: "brokerage",
    name: "华泰证券账户",
    type: "brokerage",
    institution: "华泰证券",
    currency: "CNY",
    method: "manual_market_value",
    base: 82_000,
    step: 2800,
  },
  {
    key: "fund",
    name: "沪深300指数基金",
    type: "fund",
    institution: "易方达基金",
    currency: "CNY",
    method: "manual_market_value",
    base: 64_000,
    step: 1650,
  },
  {
    key: "hk_stock",
    name: "港股投资组合",
    type: "stock",
    institution: "富途证券",
    currency: "HKD",
    method: "manual_market_value",
    base: 72_000,
    step: 1200,
  },
  {
    key: "crypto",
    name: "数字资产冷钱包",
    type: "crypto",
    institution: null,
    currency: "USD",
    method: "manual_market_value",
    base: 9200,
    step: 420,
  },
  {
    key: "home",
    name: "上海住宅",
    type: "real_estate",
    institution: null,
    currency: "CNY",
    method: "estimated_value",
    base: 3_280_000,
    step: 5000,
  },
  {
    key: "car_value",
    name: "家用车辆",
    type: "vehicle",
    institution: null,
    currency: "CNY",
    method: "estimated_value",
    base: 156_000,
    step: -1200,
  },
  {
    key: "emergency",
    name: "备用金账户",
    type: "bank",
    institution: "招商银行",
    currency: "CNY",
    method: "manual_balance",
    base: 50_000,
    step: 1000,
  },
  // Structured debts (房贷/车贷/消费分期) live as loans and contribute their
  // outstanding principal to net worth; only non-loan informal debt is tracked
  // as a liability asset here to avoid double-counting the same debt.
  {
    key: "card_liability",
    name: "信用卡待还",
    type: "liability",
    institution: "招商银行",
    currency: "CNY",
    method: "manual_balance",
    base: 12_500,
    step: 350,
  },
] as const

function expectOk<T>(result: { success: true; data: T } | { success: false; error: string }): T {
  if (!result.success) throw new Error(result.error)
  return result.data as T
}

function demoId(...parts: Array<string | number>): string {
  return `${DEMO_PREFIX}${parts.join("_")}`.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()
}

function compact(date: string): string {
  return date.replace(/-/g, "")
}

function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Invalid date: ${value}`)
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}

function toDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function toIsoAt(date: string, hour = 12, minute = 0): string {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
}

function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
}

function dayInMonth(date: Date, day: number): string {
  const end = endOfMonth(date)
  const clamped = Math.min(day, end.getUTCDate())
  return toDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), clamped)))
}

function monthKey(date: Date): string {
  return toDate(date).slice(0, 7)
}

function amount(value: number): string {
  return Math.max(value, 0).toFixed(2)
}

function isOnOrBefore(date: string, boundary: string): boolean {
  return date <= boundary
}

function seededMonths(anchorDate: string, months: number): Date[] {
  const current = monthStart(parseDate(anchorDate))
  return Array.from({ length: months }, (_, index) => addMonths(current, index - months + 1))
}

function seedBounds(options: DemoSeedOptions = {}) {
  const anchorDate = options.anchorDate ?? toDate(new Date())
  const months = options.months ?? DEFAULT_MONTHS
  const futureDays = options.futureDays ?? DEFAULT_FUTURE_DAYS
  const monthsList = seededMonths(anchorDate, months)
  return {
    anchorDate,
    months,
    futureDays,
    monthsList,
    dateFrom: toDate(monthsList[0]),
    dateTo: toDate(endOfMonth(monthsList[monthsList.length - 1])),
    forecastThrough: toDate(addDays(parseDate(anchorDate), futureDays)),
  }
}

function nextOccurrenceDate(
  startMonth: Date,
  day: number,
  anchorDate: string,
  cycle: "monthly" | "yearly",
): string {
  let cursor = dayInMonth(startMonth, day)
  while (cursor <= anchorDate) {
    const date = parseDate(cursor)
    cursor = dayInMonth(addMonths(date, cycle === "yearly" ? 12 : 1), day)
  }
  return cursor
}

function occurrenceDates(
  startMonth: Date,
  day: number,
  throughDate: string,
  cycle: "monthly" | "yearly",
): string[] {
  const dates: string[] = []
  let cursor = dayInMonth(startMonth, day)
  let safety = 0
  while (cursor <= throughDate && safety++ < 240) {
    dates.push(cursor)
    cursor = dayInMonth(addMonths(parseDate(cursor), cycle === "yearly" ? 12 : 1), day)
  }
  return dates
}

function addCreated(created: Record<string, number>, table: TargetTable, count = 1): void {
  created[table] = (created[table] ?? 0) + count
}

function addFxRows(fxDates: Map<string, Set<string>>, date: string, currency: string): void {
  if (currency === CNY) return
  const dates = fxDates.get(currency) ?? new Set<string>()
  dates.add(date)
  fxDates.set(currency, dates)
}

function buildDemoStatements(ctx: SeedContext): DemoBuildResult {
  const result: DemoBuildResult = { statements: [], created: {} }
  const fxDates = new Map<string, Set<string>>()
  const cashflowIds = new Map<string, string>()
  const sourceByKey = Object.fromEntries(SOURCES.map((source) => [source.key, source]))
  const startMonth = ctx.months[0]
  const now = toIsoAt(ctx.anchorDate, 23, 0)

  const push = (table: TargetTable, exec: (db: Database) => void): void => {
    result.statements.push({ table, exec })
    addCreated(result.created, table)
  }

  const categoryId = (name: string): string | null => ctx.categoryIds[name] ?? null
  const tagId = (key: string): string => ctx.tagIds[key]

  push("currency_settings", (db) => {
    db.insert(currencySettings)
      .values({
        id: "default",
        displayCurrency: CNY,
        fxProvider: "manual",
        fxRequestPolicy: "manual_only",
        updatedAt: now,
        meta: null,
      })
      .onConflictDoUpdate({
        target: currencySettings.id,
        set: {
          displayCurrency: CNY,
          fxProvider: "manual",
          fxRequestPolicy: "manual_only",
          updatedAt: now,
          meta: null,
        },
      })
      .run()
  })

  const addStatementImport = (source: (typeof SOURCES)[number], month: Date): void => {
    const key = monthKey(month)
    const importId = demoId("import", source.key, key)
    push("statement_imports", (db) => {
      db.insert(statementImports)
        .values({
          id: importId,
          sourceName: source.name,
          fileName: `${source.filePrefix}-${key}.csv`,
          fileHash: demoId("hash", source.key, key),
          importedAt: toIsoAt(dayInMonth(month, 2), 9),
          status: "reviewed",
          rawSummary: { demo: true, month: key, source: source.name },
          createdAt: toIsoAt(dayInMonth(month, 2), 9),
        })
        .run()
    })
  }

  const addLineOnly = (input: {
    sourceKey: string
    date: string
    key: string
    counterparty: string
    description: string
    amount: number
    direction: Direction
    status: StatementStatus
    currency?: string
  }): string => {
    const source = sourceByKey[input.sourceKey]
    const lineId = demoId("line", input.sourceKey, input.key, compact(input.date))
    push("statement_lines", (db) => {
      db.insert(statementLines)
        .values({
          id: lineId,
          importId: demoId("import", input.sourceKey, input.date.slice(0, 7)),
          externalId: lineId,
          lineHash: lineId,
          occurredAt: toIsoAt(input.date, 12),
          eventDate: input.date,
          counterparty: input.counterparty,
          description: input.description,
          amount: amount(input.amount),
          currency: input.currency ?? CNY,
          direction: input.direction,
          paymentMethod: source.name,
          accountHint: source.account,
          rawPayload: { demo: true, source: source.name },
          status: input.status,
          createdAt: toIsoAt(input.date, 12),
        })
        .run()
    })
    return lineId
  }

  const addCashflow = (input: {
    sourceKey: string
    date: string
    key: string
    title: string
    counterparty: string
    description: string
    amount: number
    direction: Direction
    flowKind: CashflowKind
    categoryName?: string
    tagKeys?: string[]
    currency?: string
    includeInAnalytics?: boolean
    status?: CashflowStatus
  }): string | null => {
    if (!isOnOrBefore(input.date, ctx.anchorDate)) return null
    const special = SPECIAL_FLOW_KINDS.includes(input.flowKind)
    const status = input.status ?? "active"
    const lineStatus: StatementStatus = status === "ignored" ? "ignored" : "converted"
    const lineId = addLineOnly({
      sourceKey: input.sourceKey,
      date: input.date,
      key: input.key,
      counterparty: input.counterparty,
      description: input.description,
      amount: input.amount,
      direction: input.direction,
      status: lineStatus,
      currency: input.currency,
    })
    const eventId = demoId("cf", input.key, compact(input.date))
    const include = input.includeInAnalytics ?? (!special && status === "active")
    const source = sourceByKey[input.sourceKey]
    push("cashflow_events", (db) => {
      db.insert(cashflowEvents)
        .values({
          id: eventId,
          statementLineId: lineId,
          eventDate: input.date,
          occurredAt: toIsoAt(input.date, 12),
          title: input.title,
          counterparty: input.counterparty,
          description: input.description,
          userNote: "demo seed",
          amount: amount(input.amount),
          currency: input.currency ?? CNY,
          direction: input.direction,
          flowKind: input.flowKind,
          categoryId: input.categoryName ? categoryId(input.categoryName) : null,
          sourceKind: "import",
          sourceName: source.name,
          paymentMethod: source.name,
          accountHint: source.account,
          includeInAnalytics: include,
          status,
          classificationSource: "imported",
          createdAt: toIsoAt(input.date, 12),
          updatedAt: now,
        })
        .run()
    })
    for (const key of input.tagKeys ?? []) {
      push("cashflow_event_tags", (db) => {
        db.insert(cashflowEventTags)
          .values({ cashflowEventId: eventId, tagId: tagId(key) })
          .onConflictDoNothing()
          .run()
      })
    }
    push("object_links", (db) => {
      db.insert(objectLinks)
        .values({
          id: demoId("link", "line", eventId),
          fromType: "statement_line",
          fromId: lineId,
          toType: "cashflow_event",
          toId: eventId,
          linkType: "evidence_of",
          confidence: 98,
          createdBy: "system",
          note: "demo import evidence",
          createdAt: now,
        })
        .run()
    })
    cashflowIds.set(input.key, eventId)
    addFxRows(fxDates, input.date, input.currency ?? CNY)
    return eventId
  }

  for (const month of ctx.months) {
    for (const source of SOURCES) addStatementImport(source, month)
  }

  for (let index = 0; index < ctx.months.length; index++) {
    const month = ctx.months[index]
    const key = monthKey(month)
    addCashflow({
      sourceKey: "icbc",
      date: dayInMonth(month, 1),
      key: `salary_${key}`,
      title: "工资收入",
      counterparty: "Flowm Labs",
      description: "月度工资",
      amount: 28_600 + index * 350,
      direction: "in",
      flowKind: "income",
      categoryName: "收入",
      tagKeys: ["salary"],
      includeInAnalytics: true,
    })
    if (index % 3 === 1) {
      addCashflow({
        sourceKey: "cmb",
        date: dayInMonth(month, 6),
        key: `side_income_${key}`,
        title: "项目收入",
        counterparty: "设计顾问项目",
        description: "一次性项目收入",
        amount: 6800,
        direction: "in",
        flowKind: "income",
        categoryName: "收入",
        tagKeys: ["salary"],
        includeInAnalytics: true,
      })
    }
    const everyday = [
      {
        sourceKey: "alipay",
        day: 3,
        key: "coffee",
        title: "咖啡",
        counterparty: "Manner Coffee",
        amount: 34,
        categoryName: "餐饮",
        tagKeys: ["food"],
      },
      {
        sourceKey: "alipay",
        day: 4,
        key: "lunch",
        title: "工作日午餐",
        counterparty: "城市快餐",
        amount: 58,
        categoryName: "餐饮",
        tagKeys: ["food"],
      },
      {
        sourceKey: "wechat",
        day: 5,
        key: "commute",
        title: "通勤打车",
        counterparty: "滴滴出行",
        amount: 46,
        categoryName: "交通",
        tagKeys: ["commute"],
      },
      {
        sourceKey: "alipay",
        day: 9,
        key: "grocery",
        title: "超市采购",
        counterparty: "盒马鲜生",
        amount: 386 + index * 8,
        categoryName: "购物",
        tagKeys: ["food"],
      },
      {
        sourceKey: "wechat",
        day: 11,
        key: "movie",
        title: "电影票",
        counterparty: "淘票票",
        amount: 126,
        categoryName: "娱乐",
        tagKeys: [],
      },
      {
        sourceKey: "cmb",
        day: 13,
        key: "utility",
        title: "水电燃气",
        counterparty: "公共事业缴费",
        amount: 420 + index * 15,
        categoryName: "居住",
        tagKeys: [],
      },
      {
        sourceKey: "cmb",
        day: 14,
        key: "telecom",
        title: "手机宽带",
        counterparty: "中国移动",
        amount: 188,
        categoryName: "通讯",
        tagKeys: [],
      },
      {
        sourceKey: "alipay",
        day: 16,
        key: "shopping",
        title: "日用品购物",
        counterparty: "天猫超市",
        amount: 520 + index * 18,
        categoryName: "购物",
        tagKeys: [],
      },
    ] as const
    for (const event of everyday) {
      addCashflow({
        sourceKey: event.sourceKey,
        date: dayInMonth(month, event.day),
        key: `${event.key}_${key}`,
        title: event.title,
        counterparty: event.counterparty,
        description: event.title,
        amount: event.amount,
        direction: "out",
        flowKind: "expense",
        categoryName: event.categoryName,
        tagKeys: [...event.tagKeys],
        includeInAnalytics: true,
      })
    }
    addCashflow({
      sourceKey: "cmb",
      date: dayInMonth(month, 7),
      key: `transfer_${key}`,
      title: "账户内部转账",
      counterparty: "本人账户",
      description: "招商银行转入备用金账户",
      amount: 3000,
      direction: "neutral",
      flowKind: "transfer",
      categoryName: "转账",
      includeInAnalytics: false,
    })
    addCashflow({
      sourceKey: "cmb",
      date: dayInMonth(month, 10),
      key: `fund_buy_${key}`,
      title: "基金定投",
      counterparty: "易方达基金",
      description: "资产移动：现金转为基金份额",
      amount: 2500,
      direction: "out",
      flowKind: "asset_movement",
      categoryName: "转账",
      tagKeys: ["investment"],
      includeInAnalytics: false,
    })
    addCashflow({
      sourceKey: "alipay",
      date: dayInMonth(month, 22),
      key: `refund_${key}`,
      title: "电商退款",
      counterparty: "天猫超市",
      description: "订单退款，不进入普通消费统计",
      amount: 128,
      direction: "in",
      flowKind: "refund",
      categoryName: "退款",
      tagKeys: ["refund"],
      includeInAnalytics: false,
    })
    addCashflow({
      sourceKey: "wechat",
      date: dayInMonth(month, 24),
      key: `ignored_${key}`,
      title: "误导入记录",
      counterparty: "未知商户",
      description: "用户标记为忽略",
      amount: 88,
      direction: "out",
      flowKind: "adjustment",
      categoryName: "其他",
      tagKeys: ["ignored"],
      includeInAnalytics: false,
      status: "ignored",
    })
    for (const source of SOURCES) {
      const pendingDate = dayInMonth(month, 25)
      if (isOnOrBefore(pendingDate, ctx.anchorDate)) {
        addLineOnly({
          sourceKey: source.key,
          date: pendingDate,
          key: `pending_${source.key}_${key}`,
          counterparty: "待确认商户",
          description: "保留的待确认流水",
          amount: 19 + index,
          direction: "out",
          status: "pending",
        })
      }
    }
  }

  for (const sub of SUBSCRIPTIONS) {
    const nextDate = nextOccurrenceDate(startMonth, sub.day, ctx.anchorDate, sub.cycle)
    push("subscriptions", (db) => {
      db.insert(subscriptions)
        .values({
          id: demoId("sub", sub.key),
          name: sub.name,
          merchant: sub.merchant,
          amount: amount(sub.amount),
          currency: sub.currency,
          billingCycle: sub.cycle,
          intervalCount: 1,
          nextChargeDate: nextDate,
          autoRenew: true,
          categoryId: categoryId("订阅"),
          status: "active",
          note: "demo seed subscription forecast only",
          createdAt: now,
          updatedAt: now,
        })
        .run()
    })
    for (const dueDate of occurrenceDates(startMonth, sub.day, ctx.forecastThrough, sub.cycle)) {
      const occurrenceId = demoId("subocc", sub.key, compact(dueDate))
      const past = isOnOrBefore(dueDate, ctx.anchorDate)
      push("subscription_occurrences", (db) => {
        db.insert(subscriptionOccurrences)
          .values({
            id: occurrenceId,
            subscriptionId: demoId("sub", sub.key),
            dueDate,
            amount: amount(sub.amount),
            currency: sub.currency,
            status: past ? "confirmed" : "forecast",
            createdAt: now,
          })
          .run()
      })
      addFxRows(fxDates, dueDate, sub.currency)
      const cashflowId = past
        ? addCashflow({
            sourceKey: sub.source,
            date: dueDate,
            key: `subscription_${sub.key}_${compact(dueDate)}`,
            title: sub.name,
            counterparty: sub.merchant,
            description: "订阅扣费：实际现金流只由过去流水产生",
            amount: sub.amount,
            direction: "out",
            flowKind: "expense",
            categoryName: "订阅",
            tagKeys: ["subscription"],
            currency: sub.currency,
            includeInAnalytics: true,
          })
        : null
      if (cashflowId) {
        push("object_links", (db) => {
          db.insert(objectLinks)
            .values({
              id: demoId("link", "subocc", sub.key, compact(dueDate)),
              fromType: "subscription_occurrence",
              fromId: occurrenceId,
              toType: "cashflow_event",
              toId: cashflowId,
              linkType: "confirmed_matches",
              confidence: 95,
              createdBy: "system",
              note: "demo occurrence explanation",
              createdAt: now,
            })
            .run()
        })
      }
    }
  }

  for (const loan of LOANS) {
    const startDate = dayInMonth(startMonth, loan.day)
    push("loans", (db) => {
      db.insert(loans)
        .values({
          id: demoId("loan", loan.key),
          name: loan.name,
          lender: loan.lender,
          currency: "CNY",
          principalAmount: amount(loan.principal),
          currentPrincipalEstimate: amount(loan.current),
          annualRateBps: loan.rate,
          repaymentMethod: "equal_payment",
          paymentAmount: amount(loan.payment),
          paymentDay: loan.day,
          startDate,
          termMonths: loan.termMonths,
          status: "active",
          note: "demo loan plan; outstanding principal counts toward net-worth liability",
          createdAt: now,
          updatedAt: now,
        })
        .run()
    })
    let remaining: number = loan.current
    for (const dueDate of occurrenceDates(startMonth, loan.day, ctx.forecastThrough, "monthly")) {
      const occurrenceId = demoId("loanocc", loan.key, compact(dueDate))
      const interest = (remaining * (loan.rate / 10000)) / 12
      const principal = Math.max(loan.payment - interest, 0)
      remaining = Math.max(remaining - principal, 0)
      const past = isOnOrBefore(dueDate, ctx.anchorDate)
      const remainingValue = remaining
      push("loan_payment_occurrences", (db) => {
        db.insert(loanPaymentOccurrences)
          .values({
            id: occurrenceId,
            loanId: demoId("loan", loan.key),
            dueDate,
            paymentAmount: amount(loan.payment),
            principalAmount: amount(principal),
            interestAmount: amount(interest),
            feeAmount: "0.00",
            remainingPrincipalEstimate: amount(remainingValue),
            status: past ? "paid" : "forecast",
            createdAt: now,
          })
          .run()
      })
      const cashflowId = past
        ? addCashflow({
            sourceKey: loan.key === "car" ? "icbc" : "cmb",
            date: dueDate,
            key: `loan_${loan.key}_${compact(dueDate)}`,
            title: loan.name,
            counterparty: loan.lender,
            description: "债务还款：默认不进入普通消费统计",
            amount: loan.payment,
            direction: "out",
            flowKind: "debt_payment",
            categoryName: "还款",
            tagKeys: ["loan"],
            includeInAnalytics: false,
          })
        : null
      if (cashflowId) {
        push("object_links", (db) => {
          db.insert(objectLinks)
            .values({
              id: demoId("link", "loanocc", loan.key, compact(dueDate)),
              fromType: "loan_payment_occurrence",
              fromId: occurrenceId,
              toType: "cashflow_event",
              toId: cashflowId,
              linkType: "confirmed_matches",
              confidence: 95,
              createdBy: "system",
              note: "demo loan payment explanation",
              createdAt: now,
            })
            .run()
        })
      }
    }
  }

  ASSETS.forEach((asset, assetIndex) => {
    push("asset_items", (db) => {
      db.insert(assetItems)
        .values({
          id: demoId("asset", asset.key),
          name: asset.name,
          assetType: asset.type,
          institution: asset.institution,
          defaultCurrency: asset.currency,
          valuationMethod: asset.method,
          displayOrder: assetIndex + 1,
          note:
            asset.type === "vehicle"
              ? "demo manual valuation; no automatic depreciation"
              : "demo seed asset item",
          createdAt: now,
          updatedAt: now,
        })
        .run()
    })
    ctx.months.forEach((month, monthIndex) => {
      const monthEnd = toDate(endOfMonth(month))
      const snapshotDate =
        monthKey(month) === ctx.anchorDate.slice(0, 7) ? ctx.anchorDate : monthEnd
      const snapshotAt = toIsoAt(snapshotDate, 21)
      const drift = asset.step * monthIndex
      const wave = Math.sin((assetIndex + 1) * (monthIndex + 1)) * Math.abs(asset.step) * 0.18
      const value = Math.max(asset.base + drift + wave, asset.type === "liability" ? 100 : 0)
      const quantity = ["fund", "stock", "crypto"].includes(asset.type)
        ? (100 + monthIndex * 3 + assetIndex).toFixed(4)
        : null
      push("asset_snapshots", (db) => {
        db.insert(assetSnapshots)
          .values({
            id: demoId("snap", asset.key, compact(snapshotDate)),
            assetItemId: demoId("asset", asset.key),
            snapshotAt,
            valueAmount: amount(value),
            valueCurrency: asset.currency,
            quantityAmount: quantity,
            quantityUnit: quantity ? (asset.type === "crypto" ? "BTC" : "shares") : null,
            costBasisAmount: ["fund", "stock", "crypto"].includes(asset.type)
              ? amount(value * 0.92)
              : null,
            costBasisCurrency: ["fund", "stock", "crypto"].includes(asset.type)
              ? asset.currency
              : null,
            sourceKind: "manual",
            note: "demo monthly manual snapshot",
            createdAt: now,
          })
          .run()
      })
      addFxRows(fxDates, snapshotDate, asset.currency)
    })
  })

  for (const monthDate of ctx.months) {
    const month = monthKey(monthDate)
    const fundMove = cashflowIds.get(`fund_buy_${month}`)
    if (fundMove) {
      const snapshotId = demoId(
        "snap",
        "fund",
        compact(
          month === ctx.anchorDate.slice(0, 7)
            ? ctx.anchorDate
            : toDate(endOfMonth(parseDate(`${month}-01`))),
        ),
      )
      push("object_links", (db) => {
        db.insert(objectLinks)
          .values({
            id: demoId("link", "asset_move", compact(`${month}-01`)),
            fromType: "cashflow_event",
            fromId: fundMove,
            toType: "asset_snapshot",
            toId: snapshotId,
            linkType: "related_to",
            confidence: 70,
            createdBy: "system",
            note: "demo explanatory asset movement link",
            createdAt: now,
          })
          .run()
      })
    }
  }

  push("budget_sets", (db) => {
    db.insert(budgetSets)
      .values({
        id: demoId("budget_set"),
        name: "Demo 月度预算",
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .run()
  })
  for (const monthDate of ctx.months) {
    const month = monthKey(monthDate)
    const periodId = demoId("budget_period", month)
    push("budget_periods", (db) => {
      db.insert(budgetPeriods)
        .values({
          id: periodId,
          budgetSetId: demoId("budget_set"),
          periodKind: "monthly",
          periodStart: `${month}-01`,
          periodEnd: toDate(endOfMonth(parseDate(`${month}-01`))),
          currency: "CNY",
          status: "active",
        })
        .run()
    })
    const budgetItemPlans = [
      {
        key: "all",
        name: "日常消费总预算",
        planned: 12_000,
        category: null,
        scope: ["flow_kind", "expense"] as const,
      },
      { key: "food", name: "餐饮预算", planned: 2600, category: "餐饮", scope: null },
      { key: "shopping", name: "购物预算", planned: 3000, category: "购物", scope: null },
      { key: "transport", name: "交通预算", planned: 900, category: "交通", scope: null },
      { key: "subscription", name: "订阅预算", planned: 900, category: "订阅", scope: null },
      { key: "home", name: "居住预算", planned: 1800, category: "居住", scope: null },
    ] as const
    for (const item of budgetItemPlans) {
      const itemId = demoId("budget_item", item.key, month)
      push("budget_items", (db) => {
        db.insert(budgetItems)
          .values({
            id: itemId,
            budgetPeriodId: periodId,
            name: item.name,
            itemKind: "spending_limit",
            plannedAmount: amount(item.planned),
            currency: "CNY",
            categoryId: item.category ? categoryId(item.category) : null,
            rolloverPolicy: "none",
            status: "active",
            note: "demo budget references past cashflow only",
          })
          .run()
      })
      if (item.scope) {
        push("budget_item_scopes", (db) => {
          db.insert(budgetItemScopes)
            .values({
              id: demoId("budget_scope", item.key, month),
              budgetItemId: itemId,
              scopeKind: item.scope![0],
              scopeValue: item.scope![1],
            })
            .run()
        })
      }
    }
  }

  const fxRates: Record<string, string> = { USD: "7.1800", HKD: "0.9180", EUR: "7.7800" }
  for (const [currency, dates] of fxDates) {
    for (const date of dates) {
      push("exchange_rates", (db) => {
        db.insert(exchangeRates)
          .values({
            id: demoId("fx", currency.toLowerCase(), compact(date)),
            fromCurrency: currency,
            toCurrency: "CNY",
            rateDate: date,
            rate: fxRates[currency] ?? "1.0000",
            provider: "demo",
            fetchedAt: now,
            sourceDate: date,
            meta: { demo: true },
          })
          .run()
      })
    }
  }

  return result
}

async function ensureDemoTags(db: Database): Promise<Record<string, string>> {
  const now = new Date().toISOString()
  for (const tag of DEMO_TAGS) {
    db.insert(tags)
      .values({
        id: demoId("tag", tag.key),
        name: tag.name,
        color: tag.color,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run()
  }
  const rows = db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(
      inArray(
        tags.name,
        DEMO_TAGS.map((tag) => tag.name),
      ),
    )
    .all()
  return Object.fromEntries(
    DEMO_TAGS.map((tag) => {
      const row = rows.find((candidate) => candidate.name === tag.name)
      if (!row?.id) throw new Error(`Demo tag not found: ${tag.name}`)
      return [tag.key, String(row.id)]
    }),
  )
}

async function loadCategoryIds(db: Database): Promise<Record<string, string | null>> {
  const rows = db.select({ id: categories.id, name: categories.name }).from(categories).all()
  return Object.fromEntries(
    rows.map((row) => [String(row.name), row.id == null ? null : String(row.id)]),
  )
}

async function deleteDemoData(db: Database): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {}
  const demoLike = (column: Parameters<typeof like>[0]) => like(column, `${DEMO_PREFIX}%`)
  const deletes: Array<[TargetTable, SQL]> = [
    [
      "object_links",
      or(demoLike(objectLinks.id), demoLike(objectLinks.fromId), demoLike(objectLinks.toId))!,
    ],
    [
      "budget_item_scopes",
      or(demoLike(budgetItemScopes.id), demoLike(budgetItemScopes.budgetItemId))!,
    ],
    ["budget_items", or(demoLike(budgetItems.id), demoLike(budgetItems.budgetPeriodId))!],
    ["budget_periods", or(demoLike(budgetPeriods.id), demoLike(budgetPeriods.budgetSetId))!],
    ["budget_sets", demoLike(budgetSets.id)],
    [
      "loan_payment_occurrences",
      or(demoLike(loanPaymentOccurrences.id), demoLike(loanPaymentOccurrences.loanId))!,
    ],
    ["loans", demoLike(loans.id)],
    [
      "subscription_occurrences",
      or(demoLike(subscriptionOccurrences.id), demoLike(subscriptionOccurrences.subscriptionId))!,
    ],
    ["subscriptions", demoLike(subscriptions.id)],
    ["asset_snapshots", or(demoLike(assetSnapshots.id), demoLike(assetSnapshots.assetItemId))!],
    ["asset_items", demoLike(assetItems.id)],
    [
      "cashflow_event_tags",
      or(demoLike(cashflowEventTags.cashflowEventId), demoLike(cashflowEventTags.tagId))!,
    ],
    ["cashflow_events", demoLike(cashflowEvents.id)],
    ["statement_lines", or(demoLike(statementLines.id), demoLike(statementLines.importId))!],
    ["statement_imports", demoLike(statementImports.id)],
    ["exchange_rates", demoLike(exchangeRates.id)],
    ["tags", demoLike(tags.id)],
  ]

  for (const [table, cond] of deletes) {
    deleted[table] = Number(db.delete(TABLE_MAP[table]).where(cond).run().changes)
  }
  return deleted
}

async function tableCounts(db: Database): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const table of TARGET_TABLES) {
    const row = db
      .select({ count: sql<number>`count(*)` })
      .from(TABLE_MAP[table])
      .get()
    counts[table] = Number(row?.count ?? 0)
  }
  return counts
}

export async function seedDemoData(
  db: Database,
  options: DemoSeedOptions = {},
): Promise<DemoSeedReport> {
  const bounds = seedBounds(options)
  const dryContext: SeedContext = {
    anchorDate: bounds.anchorDate,
    dateFrom: bounds.dateFrom,
    dateTo: bounds.dateTo,
    forecastThrough: bounds.forecastThrough,
    months: bounds.monthsList,
    categoryIds: {},
    tagIds: Object.fromEntries(DEMO_TAGS.map((tag) => [tag.key, demoId("tag", tag.key)])),
  }

  if (options.dryRun) {
    const plan = buildDemoStatements(dryContext)
    return {
      anchorDate: bounds.anchorDate,
      dateFrom: bounds.dateFrom,
      dateTo: bounds.dateTo,
      forecastThrough: bounds.forecastThrough,
      dryRun: true,
      created: plan.created,
      deleted: {},
      tableCounts: {},
    }
  }

  const deleted = await deleteDemoData(db)
  const tagIds = await ensureDemoTags(db)
  const categoryIds = await loadCategoryIds(db)
  const plan = buildDemoStatements({ ...dryContext, categoryIds, tagIds })
  db.transaction(() => {
    for (const entry of plan.statements) entry.exec(db)
  })
  const counts = await tableCounts(db)
  const validation = options.validate ? await validateDemoData(db, options) : undefined
  return {
    anchorDate: bounds.anchorDate,
    dateFrom: bounds.dateFrom,
    dateTo: bounds.dateTo,
    forecastThrough: bounds.forecastThrough,
    dryRun: false,
    created: {
      ...plan.created,
      tags: (plan.created.tags ?? 0) + DEMO_TAGS.length,
    },
    deleted,
    tableCounts: counts,
    validation,
  }
}

async function nonNegativeIssues(db: Database): Promise<string[]> {
  const checks: Array<[SQLiteTable, string, SQL]> = [
    [statementLines, "statement_lines.amount", sql`cast(${statementLines.amount} as real) < 0`],
    [cashflowEvents, "cashflow_events.amount", sql`cast(${cashflowEvents.amount} as real) < 0`],
    [
      assetSnapshots,
      "asset_snapshots.value_amount",
      sql`cast(${assetSnapshots.valueAmount} as real) < 0`,
    ],
    [
      assetSnapshots,
      "asset_snapshots.cost_basis_amount",
      sql`${assetSnapshots.costBasisAmount} is not null and cast(${assetSnapshots.costBasisAmount} as real) < 0`,
    ],
    [subscriptions, "subscriptions.amount", sql`cast(${subscriptions.amount} as real) < 0`],
    [
      subscriptionOccurrences,
      "subscription_occurrences.amount",
      sql`cast(${subscriptionOccurrences.amount} as real) < 0`,
    ],
    [loans, "loans.payment_amount", sql`cast(${loans.paymentAmount} as real) < 0`],
    [
      loans,
      "loans.principal_amount",
      sql`${loans.principalAmount} is not null and cast(${loans.principalAmount} as real) < 0`,
    ],
    [
      loanPaymentOccurrences,
      "loan_payment_occurrences.payment_amount",
      sql`cast(${loanPaymentOccurrences.paymentAmount} as real) < 0`,
    ],
    [
      loanPaymentOccurrences,
      "loan_payment_occurrences.principal_amount",
      sql`${loanPaymentOccurrences.principalAmount} is not null and cast(${loanPaymentOccurrences.principalAmount} as real) < 0`,
    ],
    [
      loanPaymentOccurrences,
      "loan_payment_occurrences.interest_amount",
      sql`${loanPaymentOccurrences.interestAmount} is not null and cast(${loanPaymentOccurrences.interestAmount} as real) < 0`,
    ],
    [
      budgetItems,
      "budget_items.planned_amount",
      sql`cast(${budgetItems.plannedAmount} as real) < 0`,
    ],
    [exchangeRates, "exchange_rates.rate", sql`cast(${exchangeRates.rate} as real) <= 0`],
  ]
  const issues: string[] = []
  for (const [table, label, predicate] of checks) {
    const row = db
      .select({ count: sql<number>`count(*)` })
      .from(table)
      .where(predicate)
      .get()
    if (Number(row?.count ?? 0) > 0) issues.push(`${label} contains invalid negative values`)
  }
  return issues
}

export async function validateDemoData(
  db: Database,
  options: DemoSeedOptions = {},
): Promise<DemoSeedValidationReport> {
  const bounds = seedBounds(options)
  const api = createFlowmApi(db)
  const counts = await tableCounts(db)
  const issues: string[] = []
  const metrics: Record<string, string | number | boolean> = {}

  for (const table of TARGET_TABLES) {
    if (counts[table] <= 0) issues.push(`${table} has no rows`)
  }

  issues.push(...(await nonNegativeIssues(db)))

  const liabilityBad = db
    .select({ count: sql<number>`count(*)` })
    .from(assetSnapshots)
    .innerJoin(assetItems, eq(assetItems.id, assetSnapshots.assetItemId))
    .where(
      and(
        eq(assetItems.assetType, "liability"),
        sql`cast(${assetSnapshots.valueAmount} as real) <= 0`,
      ),
    )
    .get()
  if (Number(liabilityBad?.count ?? 0) > 0) issues.push("liability snapshots must stay positive")

  const flowKinds = db
    .selectDistinct({ flowKind: cashflowEvents.flowKind })
    .from(cashflowEvents)
    .orderBy(cashflowEvents.flowKind)
    .all()
  const flowKindSet = new Set(flowKinds.map((row) => String(row.flowKind)))
  for (const kind of [
    "income",
    "expense",
    "transfer",
    "asset_movement",
    "debt_payment",
    "refund",
    "adjustment",
  ]) {
    if (!flowKindSet.has(kind)) issues.push(`missing cashflow kind: ${kind}`)
  }

  const specialIncluded = db
    .select({ total: sql<number>`coalesce(sum(cast(${cashflowEvents.amount} as real)), 0)` })
    .from(cashflowEvents)
    .where(
      and(
        eq(cashflowEvents.status, "active"),
        eq(cashflowEvents.includeInAnalytics, true),
        inArray(cashflowEvents.flowKind, SPECIAL_FLOW_KINDS),
      ),
    )
    .get()
  if (Number(specialIncluded?.total ?? 0) !== 0)
    issues.push("special flow kinds are included in ordinary analytics")

  const hiddenSpecial = db
    .select({ count: sql<number>`count(*)` })
    .from(cashflowEvents)
    .where(inArray(cashflowEvents.flowKind, SPECIAL_FLOW_KINDS))
    .get()
  metrics.specialFlowCount = Number(hiddenSpecial?.count ?? 0)
  if (metrics.specialFlowCount <= 0) issues.push("special flow kinds are not queryable")

  const everyday = expectOk(
    await api.getCashflowSummary({
      metric: "everyday_spend",
      dateFrom: bounds.dateFrom,
      dateTo: bounds.anchorDate,
    }),
  )
  const income = expectOk(
    await api.getCashflowSummary({
      metric: "income",
      dateFrom: bounds.dateFrom,
      dateTo: bounds.anchorDate,
    }),
  )
  metrics.everydaySpend = everyday.amount
  metrics.income = income.amount

  const netWorth = expectOk(await api.getNetWorthSnapshot())
  metrics.netWorth = netWorth.netWorth.number
  metrics.assetValue = netWorth.assetValue.number
  metrics.liabilityValue = netWorth.liabilityValue.number
  metrics.missingFx = netWorth.missingFx.length
  if (Number(netWorth.assetValue.number) <= 0) issues.push("asset net worth is empty")
  if (Number(netWorth.liabilityValue.number) <= 0) issues.push("liability value is empty")
  if (netWorth.missingFx.length > 0) issues.push("net worth has missing FX rates")

  const fund = db
    .select({ id: assetItems.id })
    .from(assetItems)
    .where(eq(assetItems.id, demoId("asset", "fund")))
    .get()
  if (fund?.id) {
    const change = expectOk(await api.getAssetChange({ assetItemId: fund.id as FlowmId }))
    metrics.assetChangeAvailable = change != null
    if (!change) issues.push("asset growth cannot be calculated from snapshots")
  }

  const future = expectOk(
    await api.getFutureFixedPressure({
      dateFrom: toDate(addDays(parseDate(bounds.anchorDate), 1)),
      dateTo: bounds.forecastThrough,
    }),
  )
  metrics.futurePressure = future.total
  if (Number(future.total) <= 0) issues.push("future pressure is empty")

  const currentPeriod = db
    .select({ id: budgetPeriods.id })
    .from(budgetPeriods)
    .where(
      and(
        lte(budgetPeriods.periodStart, bounds.anchorDate),
        gte(budgetPeriods.periodEnd, bounds.anchorDate),
        like(budgetPeriods.id, `${DEMO_PREFIX}%`),
      ),
    )
    .limit(1)
    .get()
  if (currentPeriod?.id) {
    const progress = expectOk(
      await api.getBudgetReferenceProgress({ budgetPeriodId: currentPeriod.id as FlowmId }),
    )
    const used = progress.reduce((sum, row) => sum + Number(row.referenceUsed), 0)
    metrics.currentBudgetUsed = used.toFixed(2)
    if (used <= 0) issues.push("budget progress has no past cashflow usage")
  } else {
    issues.push("current demo budget period not found")
  }

  const objectLinkCount = db
    .select({ count: sql<number>`count(*)` })
    .from(objectLinks)
    .where(like(objectLinks.id, `${DEMO_PREFIX}%`))
    .get()
  metrics.objectLinks = Number(objectLinkCount?.count ?? 0)
  if (metrics.objectLinks <= 0) issues.push("object links are empty")

  return { ok: issues.length === 0, issues, metrics }
}
