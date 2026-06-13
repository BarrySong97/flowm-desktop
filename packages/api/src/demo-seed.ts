import { createFlowmApi, type FlowmId } from "./index"
import type { Database, SqlParam, SqlRow } from "@flowm/db"

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

const RESET_TABLES = [
  "object_links",
  "budget_item_scopes",
  "budget_items",
  "budget_periods",
  "budget_sets",
  "loan_payment_occurrences",
  "loans",
  "subscription_occurrences",
  "subscriptions",
  "asset_snapshots",
  "asset_items",
  "cashflow_event_tags",
  "cashflow_events",
  "statement_lines",
  "statement_imports",
  "exchange_rates",
  "currency_settings",
  "tags",
  "categories",
] as const

type TargetTable = (typeof TARGET_TABLES)[number]
type Direction = "in" | "out" | "neutral"
type CashflowKind = "income" | "expense" | "transfer" | "asset_movement" | "debt_payment" | "refund" | "adjustment"
type StatementStatus = "pending" | "converted" | "ignored"
type CashflowStatus = "active" | "ignored" | "deleted"

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
  statement: {
    sql: string
    params?: SqlParam[]
  }
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
  { key: "icloud", name: "iCloud+", merchant: "Apple", amount: 21, currency: "CNY", cycle: "monthly", day: 15, source: "cmb" },
  { key: "chatgpt", name: "ChatGPT Plus", merchant: "OpenAI", amount: 20, currency: "USD", cycle: "monthly", day: 20, source: "cmb" },
  { key: "spotify", name: "Spotify", merchant: "Spotify", amount: 72, currency: "CNY", cycle: "monthly", day: 5, source: "alipay" },
  { key: "notion", name: "Notion", merchant: "Notion Labs", amount: 96, currency: "USD", cycle: "yearly", day: 8, source: "cmb" },
  { key: "tencent_video", name: "腾讯视频", merchant: "腾讯", amount: 25, currency: "CNY", cycle: "monthly", day: 12, source: "wechat" },
  { key: "github", name: "GitHub", merchant: "GitHub", amount: 4, currency: "USD", cycle: "monthly", day: 2, source: "cmb" },
] as const

const LOANS = [
  { key: "mortgage", name: "上海住宅房贷", lender: "招商银行", principal: 1_780_000, current: 1_742_000, rate: 385, payment: 9850, day: 20, termMonths: 300 },
  { key: "car", name: "车辆贷款", lender: "工商银行", principal: 180_000, current: 122_000, rate: 420, payment: 2350, day: 8, termMonths: 72 },
  { key: "consumer", name: "消费分期", lender: "招商银行", principal: 36_000, current: 18_000, rate: 720, payment: 1800, day: 18, termMonths: 24 },
] as const

const ASSETS = [
  { key: "cash", name: "现金备用", type: "cash", institution: null, currency: "CNY", method: "manual_balance", base: 2600, step: 45 },
  { key: "cmb_bank", name: "招商银行储蓄卡", type: "bank", institution: "招商银行", currency: "CNY", method: "manual_balance", base: 62_000, step: 1800 },
  { key: "icbc_bank", name: "工商银行工资卡", type: "bank", institution: "工商银行", currency: "CNY", method: "manual_balance", base: 38_000, step: 1250 },
  { key: "alipay", name: "支付宝余额宝", type: "wallet", institution: "支付宝", currency: "CNY", method: "manual_balance", base: 15_000, step: 550 },
  { key: "wechat", name: "微信零钱", type: "wallet", institution: "微信", currency: "CNY", method: "manual_balance", base: 4200, step: 160 },
  { key: "brokerage", name: "华泰证券账户", type: "brokerage", institution: "华泰证券", currency: "CNY", method: "manual_market_value", base: 82_000, step: 2800 },
  { key: "fund", name: "沪深300指数基金", type: "fund", institution: "易方达基金", currency: "CNY", method: "manual_market_value", base: 64_000, step: 1650 },
  { key: "hk_stock", name: "港股投资组合", type: "stock", institution: "富途证券", currency: "HKD", method: "manual_market_value", base: 72_000, step: 1200 },
  { key: "crypto", name: "数字资产冷钱包", type: "crypto", institution: null, currency: "USD", method: "manual_market_value", base: 9200, step: 420 },
  { key: "home", name: "上海住宅", type: "real_estate", institution: null, currency: "CNY", method: "estimated_value", base: 3_280_000, step: 5000 },
  { key: "car_value", name: "家用车辆", type: "vehicle", institution: null, currency: "CNY", method: "estimated_value", base: 156_000, step: -1200 },
  { key: "emergency", name: "备用金账户", type: "bank", institution: "招商银行", currency: "CNY", method: "manual_balance", base: 50_000, step: 1000 },
  { key: "mortgage_liability", name: "房贷负债", type: "liability", institution: "招商银行", currency: "CNY", method: "manual_balance", base: 1_762_000, step: -6200 },
  { key: "car_liability", name: "车贷负债", type: "liability", institution: "工商银行", currency: "CNY", method: "manual_balance", base: 132_000, step: -1750 },
  { key: "card_liability", name: "信用卡待还", type: "liability", institution: "招商银行", currency: "CNY", method: "manual_balance", base: 12_500, step: 350 },
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

function nextOccurrenceDate(startMonth: Date, day: number, anchorDate: string, cycle: "monthly" | "yearly"): string {
  let cursor = dayInMonth(startMonth, day)
  while (cursor <= anchorDate) {
    const date = parseDate(cursor)
    cursor = dayInMonth(addMonths(date, cycle === "yearly" ? 12 : 1), day)
  }
  return cursor
}

function occurrenceDates(startMonth: Date, day: number, throughDate: string, cycle: "monthly" | "yearly"): string[] {
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

function statement(table: TargetTable, sql: string, params: SqlParam[] = []): DemoStatement {
  return { table, statement: { sql, params } }
}

function bindParams(params: SqlParam[]): (string | number | bigint | Buffer | null)[] {
  return params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p))
}

async function one(db: Database, sql: string, params: SqlParam[] = []): Promise<SqlRow | null> {
  return db.$client.prepare(sql).get(...bindParams(params)) as SqlRow | null
}

async function all(db: Database, sql: string, params: SqlParam[] = []): Promise<SqlRow[]> {
  return db.$client.prepare(sql).all(...bindParams(params)) as SqlRow[]
}

async function run(db: Database, sql: string, params: SqlParam[] = []): Promise<number> {
  const result = db.$client.prepare(sql).run(...bindParams(params))
  return result.changes
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

  const push = (entry: DemoStatement): void => {
    result.statements.push(entry)
    addCreated(result.created, entry.table)
  }

  const categoryId = (name: string): string | null => ctx.categoryIds[name] ?? null
  const tagId = (key: string): string => ctx.tagIds[key]

  const addStatementImport = (source: (typeof SOURCES)[number], month: Date): void => {
    const key = monthKey(month)
    const importId = demoId("import", source.key, key)
    push(statement(
      "statement_imports",
      `insert into statement_imports
        (id, source_name, file_name, file_hash, imported_at, status, raw_summary, created_at)
       values (?, ?, ?, ?, ?, 'reviewed', ?, ?)`,
      [
        importId,
        source.name,
        `${source.filePrefix}-${key}.csv`,
        demoId("hash", source.key, key),
        toIsoAt(dayInMonth(month, 2), 9),
        JSON.stringify({ demo: true, month: key, source: source.name }),
        toIsoAt(dayInMonth(month, 2), 9),
      ],
    ))
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
    push(statement(
      "statement_lines",
      `insert into statement_lines
        (id, import_id, external_id, line_hash, occurred_at, event_date, counterparty, description, amount,
         currency, direction, payment_method, account_hint, raw_payload, status, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lineId,
        demoId("import", input.sourceKey, input.date.slice(0, 7)),
        lineId,
        lineId,
        toIsoAt(input.date, 12),
        input.date,
        input.counterparty,
        input.description,
        amount(input.amount),
        input.currency ?? CNY,
        input.direction,
        source.name,
        source.account,
        JSON.stringify({ demo: true, source: source.name }),
        input.status,
        toIsoAt(input.date, 12),
      ],
    ))
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
    const special = ["transfer", "asset_movement", "debt_payment", "refund", "adjustment"].includes(input.flowKind)
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
    push(statement(
      "cashflow_events",
      `insert into cashflow_events
        (id, statement_line_id, event_date, occurred_at, title, counterparty, description, user_note, amount,
         currency, direction, flow_kind, category_id, source_kind, source_name, payment_method, account_hint,
         include_in_analytics, status, classification_source, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?, ?, ?, ?, 'imported', ?, ?)`,
      [
        eventId,
        lineId,
        input.date,
        toIsoAt(input.date, 12),
        input.title,
        input.counterparty,
        input.description,
        "demo seed",
        amount(input.amount),
        input.currency ?? CNY,
        input.direction,
        input.flowKind,
        input.categoryName ? categoryId(input.categoryName) : null,
        source.name,
        source.name,
        source.account,
        include,
        status,
        toIsoAt(input.date, 12),
        now,
      ],
    ))
    for (const key of input.tagKeys ?? []) {
      push(statement(
        "cashflow_event_tags",
        "insert or ignore into cashflow_event_tags (cashflow_event_id, tag_id) values (?, ?)",
        [eventId, tagId(key)],
      ))
    }
    push(statement(
      "object_links",
      `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
       values (?, 'statement_line', ?, 'cashflow_event', ?, 'evidence_of', 98, 'system', ?, ?)`,
      [demoId("link", "line", eventId), lineId, eventId, "demo import evidence", now],
    ))
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
      { sourceKey: "alipay", day: 3, key: "coffee", title: "咖啡", counterparty: "Manner Coffee", amount: 34, categoryName: "餐饮", tagKeys: ["food"] },
      { sourceKey: "alipay", day: 4, key: "lunch", title: "工作日午餐", counterparty: "城市快餐", amount: 58, categoryName: "餐饮", tagKeys: ["food"] },
      { sourceKey: "wechat", day: 5, key: "commute", title: "通勤打车", counterparty: "滴滴出行", amount: 46, categoryName: "交通", tagKeys: ["commute"] },
      { sourceKey: "alipay", day: 9, key: "grocery", title: "超市采购", counterparty: "盒马鲜生", amount: 386 + index * 8, categoryName: "购物", tagKeys: ["food"] },
      { sourceKey: "wechat", day: 11, key: "movie", title: "电影票", counterparty: "淘票票", amount: 126, categoryName: "娱乐", tagKeys: [] },
      { sourceKey: "cmb", day: 13, key: "utility", title: "水电燃气", counterparty: "公共事业缴费", amount: 420 + index * 15, categoryName: "居住", tagKeys: [] },
      { sourceKey: "cmb", day: 14, key: "telecom", title: "手机宽带", counterparty: "中国移动", amount: 188, categoryName: "通讯", tagKeys: [] },
      { sourceKey: "alipay", day: 16, key: "shopping", title: "日用品购物", counterparty: "天猫超市", amount: 520 + index * 18, categoryName: "购物", tagKeys: [] },
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
    push(statement(
      "subscriptions",
      `insert into subscriptions
        (id, name, merchant, amount, currency, billing_cycle, interval_count, next_charge_date, auto_renew,
         category_id, status, note, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, 1, ?, 1, ?, 'active', ?, ?, ?)`,
      [
        demoId("sub", sub.key),
        sub.name,
        sub.merchant,
        amount(sub.amount),
        sub.currency,
        sub.cycle,
        nextDate,
        categoryId("订阅"),
        "demo seed subscription forecast only",
        now,
        now,
      ],
    ))
    for (const dueDate of occurrenceDates(startMonth, sub.day, ctx.forecastThrough, sub.cycle)) {
      const occurrenceId = demoId("subocc", sub.key, compact(dueDate))
      const past = isOnOrBefore(dueDate, ctx.anchorDate)
      push(statement(
        "subscription_occurrences",
        `insert into subscription_occurrences (id, subscription_id, due_date, amount, currency, status, created_at)
         values (?, ?, ?, ?, ?, ?, ?)`,
        [occurrenceId, demoId("sub", sub.key), dueDate, amount(sub.amount), sub.currency, past ? "confirmed" : "forecast", now],
      ))
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
        push(statement(
          "object_links",
          `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
           values (?, 'subscription_occurrence', ?, 'cashflow_event', ?, 'confirmed_matches', 95, 'system', ?, ?)`,
          [demoId("link", "subocc", sub.key, compact(dueDate)), occurrenceId, cashflowId, "demo occurrence explanation", now],
        ))
      }
    }
  }

  for (const loan of LOANS) {
    const startDate = dayInMonth(startMonth, loan.day)
    push(statement(
      "loans",
      `insert into loans
        (id, name, lender, currency, principal_amount, current_principal_estimate, annual_rate_bps,
         repayment_method, payment_amount, payment_day, start_date, term_months, status, note, created_at, updated_at)
       values (?, ?, ?, 'CNY', ?, ?, ?, 'equal_payment', ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        demoId("loan", loan.key),
        loan.name,
        loan.lender,
        amount(loan.principal),
        amount(loan.current),
        loan.rate,
        amount(loan.payment),
        loan.day,
        startDate,
        loan.termMonths,
        "demo loan plan; liability comes from asset snapshots",
        now,
        now,
      ],
    ))
    let remaining: number = loan.current
    for (const dueDate of occurrenceDates(startMonth, loan.day, ctx.forecastThrough, "monthly")) {
      const occurrenceId = demoId("loanocc", loan.key, compact(dueDate))
      const interest = remaining * (loan.rate / 10000) / 12
      const principal = Math.max(loan.payment - interest, 0)
      remaining = Math.max(remaining - principal, 0)
      const past = isOnOrBefore(dueDate, ctx.anchorDate)
      push(statement(
        "loan_payment_occurrences",
        `insert into loan_payment_occurrences
          (id, loan_id, due_date, payment_amount, principal_amount, interest_amount, fee_amount,
           remaining_principal_estimate, status, created_at)
         values (?, ?, ?, ?, ?, ?, '0.00', ?, ?, ?)`,
        [
          occurrenceId,
          demoId("loan", loan.key),
          dueDate,
          amount(loan.payment),
          amount(principal),
          amount(interest),
          amount(remaining),
          past ? "paid" : "forecast",
          now,
        ],
      ))
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
        push(statement(
          "object_links",
          `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
           values (?, 'loan_payment_occurrence', ?, 'cashflow_event', ?, 'confirmed_matches', 95, 'system', ?, ?)`,
          [demoId("link", "loanocc", loan.key, compact(dueDate)), occurrenceId, cashflowId, "demo loan payment explanation", now],
        ))
      }
    }
  }

  ASSETS.forEach((asset, assetIndex) => {
    push(statement(
      "asset_items",
      `insert into asset_items
        (id, name, asset_type, institution, default_currency, valuation_method, display_order, note, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        demoId("asset", asset.key),
        asset.name,
        asset.type,
        asset.institution,
        asset.currency,
        asset.method,
        assetIndex + 1,
        asset.type === "vehicle" ? "demo manual valuation; no automatic depreciation" : "demo seed asset item",
        now,
        now,
      ],
    ))
    ctx.months.forEach((month, monthIndex) => {
      const monthEnd = toDate(endOfMonth(month))
      const snapshotDate = monthKey(month) === ctx.anchorDate.slice(0, 7) ? ctx.anchorDate : monthEnd
      const snapshotAt = toIsoAt(snapshotDate, 21)
      const drift = asset.step * monthIndex
      const wave = Math.sin((assetIndex + 1) * (monthIndex + 1)) * Math.abs(asset.step) * 0.18
      const value = Math.max(asset.base + drift + wave, asset.type === "liability" ? 100 : 0)
      const quantity = ["fund", "stock", "crypto"].includes(asset.type) ? (100 + monthIndex * 3 + assetIndex).toFixed(4) : null
      push(statement(
        "asset_snapshots",
        `insert into asset_snapshots
          (id, asset_item_id, snapshot_at, value_amount, value_currency, quantity_amount, quantity_unit,
           cost_basis_amount, cost_basis_currency, source_kind, note, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)`,
        [
          demoId("snap", asset.key, compact(snapshotDate)),
          demoId("asset", asset.key),
          snapshotAt,
          amount(value),
          asset.currency,
          quantity,
          quantity ? (asset.type === "crypto" ? "BTC" : "shares") : null,
          ["fund", "stock", "crypto"].includes(asset.type) ? amount(value * 0.92) : null,
          ["fund", "stock", "crypto"].includes(asset.type) ? asset.currency : null,
          "demo monthly manual snapshot",
          now,
        ],
      ))
      addFxRows(fxDates, snapshotDate, asset.currency)
    })
  })

  for (const monthDate of ctx.months) {
    const month = monthKey(monthDate)
    const fundMove = cashflowIds.get(`fund_buy_${month}`)
    if (fundMove) {
      push(statement(
        "object_links",
        `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
         values (?, 'cashflow_event', ?, 'asset_snapshot', ?, 'related_to', 70, 'system', ?, ?)`,
        [
          demoId("link", "asset_move", compact(`${month}-01`)),
          fundMove,
          demoId("snap", "fund", compact(month === ctx.anchorDate.slice(0, 7) ? ctx.anchorDate : toDate(endOfMonth(parseDate(`${month}-01`))))),
          "demo explanatory asset movement link",
          now,
        ],
      ))
    }
  }

  push(statement(
    "budget_sets",
    "insert into budget_sets (id, name, status, created_at, updated_at) values (?, 'Demo 月度预算', 'active', ?, ?)",
    [demoId("budget_set"), now, now],
  ))
  for (const monthDate of ctx.months) {
    const month = monthKey(monthDate)
    const periodId = demoId("budget_period", month)
    push(statement(
      "budget_periods",
      "insert into budget_periods (id, budget_set_id, period_kind, period_start, period_end, currency, status) values (?, ?, 'monthly', ?, ?, 'CNY', 'active')",
      [periodId, demoId("budget_set"), `${month}-01`, toDate(endOfMonth(parseDate(`${month}-01`)))],
    ))
    const budgetItems = [
      { key: "all", name: "日常消费总预算", planned: 12_000, category: null, scope: ["flow_kind", "expense"] },
      { key: "food", name: "餐饮预算", planned: 2600, category: "餐饮", scope: null },
      { key: "shopping", name: "购物预算", planned: 3000, category: "购物", scope: null },
      { key: "transport", name: "交通预算", planned: 900, category: "交通", scope: null },
      { key: "subscription", name: "订阅预算", planned: 900, category: "订阅", scope: null },
      { key: "home", name: "居住预算", planned: 1800, category: "居住", scope: null },
    ] as const
    for (const item of budgetItems) {
      const itemId = demoId("budget_item", item.key, month)
      push(statement(
        "budget_items",
        `insert into budget_items
          (id, budget_period_id, name, item_kind, planned_amount, currency, category_id, rollover_policy, status, note)
         values (?, ?, ?, 'spending_limit', ?, 'CNY', ?, 'none', 'active', ?)`,
        [itemId, periodId, item.name, amount(item.planned), item.category ? categoryId(item.category) : null, "demo budget references past cashflow only"],
      ))
      if (item.scope) {
        push(statement(
          "budget_item_scopes",
          "insert into budget_item_scopes (id, budget_item_id, scope_kind, scope_value) values (?, ?, ?, ?)",
          [demoId("budget_scope", item.key, month), itemId, item.scope[0], item.scope[1]],
        ))
      }
    }
  }

  const fxRates: Record<string, string> = { USD: "7.1800", HKD: "0.9180", EUR: "7.7800" }
  for (const [currency, dates] of fxDates) {
    for (const date of dates) {
      push(statement(
        "exchange_rates",
        `insert into exchange_rates (id, from_currency, to_currency, rate_date, rate, provider, fetched_at, source_date, meta)
         values (?, ?, 'CNY', ?, ?, 'demo', ?, ?, ?)`,
        [
          demoId("fx", currency.toLowerCase(), compact(date)),
          currency,
          date,
          fxRates[currency] ?? "1.0000",
          now,
          date,
          JSON.stringify({ demo: true }),
        ],
      ))
    }
  }

  return result
}

async function ensureDemoTags(db: Database): Promise<Record<string, string>> {
  const now = new Date().toISOString()
  for (const tag of DEMO_TAGS) {
    await run(
      db,
      "insert or ignore into tags (id, name, color, created_at, updated_at) values (?, ?, ?, ?, ?)",
      [demoId("tag", tag.key), tag.name, tag.color, now, now],
    )
  }
  const rows = await all(db, `select id, name from tags where name in (${DEMO_TAGS.map(() => "?").join(", ")})`, DEMO_TAGS.map((tag) => tag.name))
  return Object.fromEntries(DEMO_TAGS.map((tag) => {
    const row = rows.find((candidate) => candidate.name === tag.name)
    if (!row?.id) throw new Error(`Demo tag not found: ${tag.name}`)
    return [tag.key, String(row.id)]
  }))
}

async function loadCategoryIds(db: Database): Promise<Record<string, string | null>> {
  const rows = await all(db, "select id, name from categories")
  return Object.fromEntries(rows.map((row) => [String(row.name), row.id == null ? null : String(row.id)]))
}

async function deleteDemoData(db: Database): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {}
  const deletes: Array<[TargetTable, string]> = [
    ["object_links", `delete from object_links where id like '${DEMO_PREFIX}%' or from_id like '${DEMO_PREFIX}%' or to_id like '${DEMO_PREFIX}%'`],
    ["budget_item_scopes", `delete from budget_item_scopes where id like '${DEMO_PREFIX}%' or budget_item_id like '${DEMO_PREFIX}%'`],
    ["budget_items", `delete from budget_items where id like '${DEMO_PREFIX}%' or budget_period_id like '${DEMO_PREFIX}%'`],
    ["budget_periods", `delete from budget_periods where id like '${DEMO_PREFIX}%' or budget_set_id like '${DEMO_PREFIX}%'`],
    ["budget_sets", `delete from budget_sets where id like '${DEMO_PREFIX}%'`],
    ["loan_payment_occurrences", `delete from loan_payment_occurrences where id like '${DEMO_PREFIX}%' or loan_id like '${DEMO_PREFIX}%'`],
    ["loans", `delete from loans where id like '${DEMO_PREFIX}%'`],
    ["subscription_occurrences", `delete from subscription_occurrences where id like '${DEMO_PREFIX}%' or subscription_id like '${DEMO_PREFIX}%'`],
    ["subscriptions", `delete from subscriptions where id like '${DEMO_PREFIX}%'`],
    ["asset_snapshots", `delete from asset_snapshots where id like '${DEMO_PREFIX}%' or asset_item_id like '${DEMO_PREFIX}%'`],
    ["asset_items", `delete from asset_items where id like '${DEMO_PREFIX}%'`],
    ["cashflow_event_tags", `delete from cashflow_event_tags where cashflow_event_id like '${DEMO_PREFIX}%' or tag_id like '${DEMO_PREFIX}%'`],
    ["cashflow_events", `delete from cashflow_events where id like '${DEMO_PREFIX}%'`],
    ["statement_lines", `delete from statement_lines where id like '${DEMO_PREFIX}%' or import_id like '${DEMO_PREFIX}%'`],
    ["statement_imports", `delete from statement_imports where id like '${DEMO_PREFIX}%'`],
    ["exchange_rates", `delete from exchange_rates where id like '${DEMO_PREFIX}%'`],
    ["tags", `delete from tags where id like '${DEMO_PREFIX}%'`],
  ]

  for (const [table, sql] of deletes) {
    deleted[table] = await run(db, sql)
  }
  return deleted
}

async function tableCounts(db: Database): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const table of TARGET_TABLES) {
    const row = await one(db, `select count(*) as count from ${table}`)
    counts[table] = Number(row?.count ?? 0)
  }
  return counts
}

async function ensureCompatibleCleanSchema(db: Database): Promise<boolean> {
  const categoryColumns = await all(db, "pragma table_info(categories)")
  if (categoryColumns.length === 0) return false
  const hasDisplayOrder = categoryColumns.some((column) => column.name === "display_order")
  if (hasDisplayOrder) return false

  await run(db, "pragma foreign_keys = OFF")
  for (const table of RESET_TABLES) {
    await run(db, `drop table if exists ${table}`)
  }
  await run(db, "pragma foreign_keys = ON")
  return true
}

export async function seedDemoData(db: Database, options: DemoSeedOptions = {}): Promise<DemoSeedReport> {
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

  await ensureCompatibleCleanSchema(db)
  const api = createFlowmApi(db)
  expectOk<void>(await api.initializeFlowm())
  const deleted = await deleteDemoData(db)
  const tagIds = await ensureDemoTags(db)
  const categoryIds = await loadCategoryIds(db)
  const plan = buildDemoStatements({ ...dryContext, categoryIds, tagIds })
  db.$client.transaction(() => {
    for (const entry of plan.statements) {
      const { sql, params = [] } = entry.statement
      db.$client.prepare(sql).run(...bindParams(params))
    }
  })()
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
  const checks: Array<[string, string, string]> = [
    ["statement_lines", "amount", "CAST(amount AS REAL) < 0"],
    ["cashflow_events", "amount", "CAST(amount AS REAL) < 0"],
    ["asset_snapshots", "value_amount", "CAST(value_amount AS REAL) < 0"],
    ["asset_snapshots", "cost_basis_amount", "cost_basis_amount IS NOT NULL AND CAST(cost_basis_amount AS REAL) < 0"],
    ["subscriptions", "amount", "CAST(amount AS REAL) < 0"],
    ["subscription_occurrences", "amount", "CAST(amount AS REAL) < 0"],
    ["loans", "payment_amount", "CAST(payment_amount AS REAL) < 0"],
    ["loans", "principal_amount", "principal_amount IS NOT NULL AND CAST(principal_amount AS REAL) < 0"],
    ["loan_payment_occurrences", "payment_amount", "CAST(payment_amount AS REAL) < 0"],
    ["loan_payment_occurrences", "principal_amount", "principal_amount IS NOT NULL AND CAST(principal_amount AS REAL) < 0"],
    ["loan_payment_occurrences", "interest_amount", "interest_amount IS NOT NULL AND CAST(interest_amount AS REAL) < 0"],
    ["budget_items", "planned_amount", "CAST(planned_amount AS REAL) < 0"],
    ["exchange_rates", "rate", "CAST(rate AS REAL) <= 0"],
  ]
  const issues: string[] = []
  for (const [table, column, predicate] of checks) {
    const row = await one(db, `select count(*) as count from ${table} where ${predicate}`)
    if (Number(row?.count ?? 0) > 0) issues.push(`${table}.${column} contains invalid negative values`)
  }
  return issues
}

export async function validateDemoData(db: Database, options: DemoSeedOptions = {}): Promise<DemoSeedValidationReport> {
  const bounds = seedBounds(options)
  const api = createFlowmApi(db)
  expectOk<void>(await api.initializeFlowm())
  const counts = await tableCounts(db)
  const issues: string[] = []
  const metrics: Record<string, string | number | boolean> = {}

  for (const table of TARGET_TABLES) {
    if (counts[table] <= 0) issues.push(`${table} has no rows`)
  }

  issues.push(...await nonNegativeIssues(db))

  const liabilityBad = await one(
    db,
    `select count(*) as count
     from asset_snapshots s join asset_items a on a.id = s.asset_item_id
     where a.asset_type = 'liability' and CAST(s.value_amount AS REAL) <= 0`,
  )
  if (Number(liabilityBad?.count ?? 0) > 0) issues.push("liability snapshots must stay positive")

  const flowKinds = await all(db, "select distinct flow_kind from cashflow_events order by flow_kind")
  const flowKindSet = new Set(flowKinds.map((row) => String(row.flow_kind)))
  for (const kind of ["income", "expense", "transfer", "asset_movement", "debt_payment", "refund", "adjustment"]) {
    if (!flowKindSet.has(kind)) issues.push(`missing cashflow kind: ${kind}`)
  }

  const specialIncluded = await one(
    db,
    `select coalesce(sum(cast(amount as real)), 0) as total
     from cashflow_events
     where status = 'active'
       and include_in_analytics = 1
       and flow_kind in ('transfer', 'asset_movement', 'debt_payment', 'refund', 'adjustment')`,
  )
  if (Number(specialIncluded?.total ?? 0) !== 0) issues.push("special flow kinds are included in ordinary analytics")

  const hiddenSpecial = await one(
    db,
    `select count(*) as count from cashflow_events
     where flow_kind in ('transfer', 'asset_movement', 'debt_payment', 'refund', 'adjustment')`,
  )
  metrics.specialFlowCount = Number(hiddenSpecial?.count ?? 0)
  if (metrics.specialFlowCount <= 0) issues.push("special flow kinds are not queryable")

  const everyday = expectOk(await api.getCashflowSummary({
    metric: "everyday_spend",
    dateFrom: bounds.dateFrom,
    dateTo: bounds.anchorDate,
  }))
  const income = expectOk(await api.getCashflowSummary({
    metric: "income",
    dateFrom: bounds.dateFrom,
    dateTo: bounds.anchorDate,
  }))
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

  const fund = await one(db, "select id from asset_items where id = ?", [demoId("asset", "fund")])
  if (fund?.id) {
    const change = expectOk(await api.getAssetChange({ assetItemId: fund.id as FlowmId }))
    metrics.assetChangeAvailable = change != null
    if (!change) issues.push("asset growth cannot be calculated from snapshots")
  }

  const future = expectOk(await api.getFutureFixedPressure({
    dateFrom: toDate(addDays(parseDate(bounds.anchorDate), 1)),
    dateTo: bounds.forecastThrough,
  }))
  metrics.futurePressure = future.total
  if (Number(future.total) <= 0) issues.push("future pressure is empty")

  const currentPeriod = await one(
    db,
    "select id from budget_periods where period_start <= ? and period_end >= ? and id like ? limit 1",
    [bounds.anchorDate, bounds.anchorDate, `${DEMO_PREFIX}%`],
  )
  if (currentPeriod?.id) {
    const progress = expectOk(await api.getBudgetReferenceProgress({ budgetPeriodId: currentPeriod.id as FlowmId }))
    const used = progress.reduce((sum, row) => sum + Number(row.referenceUsed), 0)
    metrics.currentBudgetUsed = used.toFixed(2)
    if (used <= 0) issues.push("budget progress has no past cashflow usage")
  } else {
    issues.push("current demo budget period not found")
  }

  const objectLinkCount = await one(db, `select count(*) as count from object_links where id like '${DEMO_PREFIX}%'`)
  metrics.objectLinks = Number(objectLinkCount?.count ?? 0)
  if (metrics.objectLinks <= 0) issues.push("object links are empty")

  return { ok: issues.length === 0, issues, metrics }
}
