/**
 * @purpose Render the dashboard overview across Flowm finance layers.
 * @role    Renderer overview that composes cashflow, assets, and obligations.
 * @deps    React, tRPC dashboard queries, charts, and UI primitives.
 * @gotcha  Show layers together without implying they reconcile into one ledger.
 */

import { useMemo, useState } from "react"
import { Dropdown } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Dock } from "../components/layout/Dock"
import type {
  CashflowEventSummary,
  LoanPaymentOccurrenceSummary,
  SubscriptionOccurrenceSummary,
} from "@flowm/api"
import type { AssetSnapshotSummary } from "@flowm/shared/contracts"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { addDays, dateKey, monthStart } from "@/lib/dates"
import { formatNumber, formatSignedCurrency } from "@/lib/format"
import { Kicker } from "../components/ui/Kicker"
import { BigNumber } from "../components/ui/BigNumber"
import { StatBlock } from "../components/ui/StatBlock"
import { SectionTitle } from "../components/ui/SectionTitle"
import { Dim } from "../components/ui/Dim"
import { UpcomingRow } from "../components/ui/UpcomingRow"
import { BudgetBar } from "../components/ui/BudgetBar"
import { TransactionTable } from "../components/ui/TransactionTable"
import { BUDGET_CATEGORY_COLORS } from "@/lib/domainDisplay"
import { NetWorthTrend } from "../components/charts/NetWorthTrend"
import { DailyBars } from "../components/charts/DailyBars"
import { ScrollArea } from "../components/ui/ScrollArea"
import { useCurrentRates } from "@/lib/useCurrentRates"
import { currencySymbol } from "@flowm/shared"

const fmt = formatNumber
const signed = formatSignedCurrency
type CashflowRangeKey = "this_month" | "last_month" | "last_30" | "last_90" | "year" | "all"
const DEFAULT_CASHFLOW_RANGE_KEY: CashflowRangeKey = "this_month"
const CASHFLOW_RANGE_STORAGE_KEY = "flowm:overview:cashflow-range"

const CASHFLOW_RANGE_OPTIONS: Array<{ key: CashflowRangeKey; label: string }> = [
  { key: "this_month", label: "本月" },
  { key: "last_month", label: "上月" },
  { key: "last_30", label: "最近 30 天" },
  { key: "last_90", label: "最近 90 天" },
  { key: "year", label: "今年" },
  { key: "all", label: "全部" },
]

function isCashflowRangeKey(value: string | null): value is CashflowRangeKey {
  return CASHFLOW_RANGE_OPTIONS.some((option) => option.key === value)
}

function readCashflowRangeKey(): CashflowRangeKey {
  try {
    const stored = window.localStorage.getItem(CASHFLOW_RANGE_STORAGE_KEY)
    return isCashflowRangeKey(stored) ? stored : DEFAULT_CASHFLOW_RANGE_KEY
  } catch {
    return DEFAULT_CASHFLOW_RANGE_KEY
  }
}

function writeCashflowRangeKey(value: CashflowRangeKey): void {
  try {
    window.localStorage.setItem(CASHFLOW_RANGE_STORAGE_KEY, value)
  } catch {
    // Persisting this preference is best-effort; the page still works without it.
  }
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function monthEnd(date: Date): string {
  return dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

function cashflowRange(key: CashflowRangeKey, now = new Date()) {
  const today = dateKey(now)
  if (key === "this_month") {
    return {
      dateFrom: monthStart(now),
      dateTo: today,
      heading: "本月结余",
      switchLabel: `${now.getMonth() + 1}月`,
      caption: "本月",
      axisStart: "月初",
      axisEnd: "今天",
    }
  }
  if (key === "last_month") {
    const previous = addMonths(now, -1)
    return {
      dateFrom: monthStart(previous),
      dateTo: monthEnd(previous),
      heading: "上月结余",
      switchLabel: `${previous.getMonth() + 1}月`,
      caption: "上月",
      axisStart: "月初",
      axisEnd: "月末",
    }
  }
  if (key === "last_30") {
    return {
      dateFrom: dateKey(addDays(now, -29)),
      dateTo: today,
      heading: "结余",
      switchLabel: "最近30天",
      caption: "过去 30 天",
      axisStart: "30 天前",
      axisEnd: "今天",
    }
  }
  if (key === "last_90") {
    return {
      dateFrom: dateKey(addDays(now, -89)),
      dateTo: today,
      heading: "结余",
      switchLabel: "最近90天",
      caption: "过去 90 天",
      axisStart: "90 天前",
      axisEnd: "今天",
    }
  }
  if (key === "year") {
    return {
      dateFrom: `${now.getFullYear()}-01-01`,
      dateTo: today,
      heading: "结余",
      switchLabel: "今年",
      caption: `${now.getFullYear()} 年`,
      axisStart: "年初",
      axisEnd: "今天",
    }
  }
  return {
    dateFrom: undefined,
    dateTo: today,
    heading: "结余",
    switchLabel: "全部",
    caption: "全部",
    axisStart: "最早",
    axisEnd: "今天",
  }
}

function useCashflowStats(events: CashflowEventSummary[]) {
  return useMemo(() => {
    let income = 0,
      expense = 0
    for (const e of events) {
      const amt = Math.abs(Number(e.amount) || 0)
      if (e.status !== "active" || !e.includeInAnalytics) continue
      if (e.flowKind === "income" && e.direction === "in") income += amt
      else if (e.flowKind === "expense" && e.direction === "out") expense += amt
    }
    return { income, expense, net: income - expense }
  }, [events])
}

function useDailyBars(
  events: CashflowEventSummary[],
  range: ReturnType<typeof cashflowRange>,
): number[] {
  return useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    const from = range.dateFrom ? new Date(range.dateFrom).getTime() : null
    const to = new Date(range.dateTo).getTime()
    const span = Math.max(1, Math.ceil(((from ?? to) === to ? 29 : to - (from ?? to)) / 86400000))
    for (const e of events) {
      if (e.flowKind !== "expense" || e.status !== "active" || !e.includeInAnalytics) continue
      const time = new Date(e.date).getTime()
      if (time > to || (from != null && time < from)) continue
      const offset = from == null ? 29 : Math.floor(((time - from) / (span * 86400000)) * 30)
      const index = Math.max(0, Math.min(29, offset))
      bars[index] += Math.abs(Number(e.amount) || 0)
    }
    return bars
  }, [events, range])
}

function useNetWorthTrend(snapshots: AssetSnapshotSummary[]): number[] {
  const { toDisplay } = useCurrentRates()
  return useMemo(() => {
    if (snapshots.length === 0) return new Array(12).fill(0)
    const buckets = new Map<string, Map<string, AssetSnapshotSummary>>()
    for (const snapshot of snapshots) {
      const month = snapshot.snapshotAt.slice(0, 7)
      const bucket = buckets.get(month) ?? new Map<string, AssetSnapshotSummary>()
      const previous = bucket.get(String(snapshot.assetItemId))
      if (!previous || snapshot.snapshotAt > previous.snapshotAt) {
        bucket.set(String(snapshot.assetItemId), snapshot)
      }
      buckets.set(month, bucket)
    }
    const values = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, bucket]) =>
        [...bucket.values()].reduce((sum, asset) => {
          // Value every snapshot at the current rate so the trend is FX-neutral.
          const amount = Math.abs(
            toDisplay(Number(asset.valueNumber || 0), asset.valueCurrency) ?? 0,
          )
          return sum + (asset.assetType === "liability" ? -amount : amount)
        }, 0),
      )
    if (values.length >= 12) return values.slice(-12)
    return [...new Array(12 - values.length).fill(values[0] ?? 0), ...values]
  }, [snapshots, toDisplay])
}

function useUpcoming(
  subscriptions: Array<{ id: string | number; name: string }>,
  subscriptionOccurrences: SubscriptionOccurrenceSummary[],
  loans: Array<{ id: string | number; name: string; currency?: string }>,
  loanOccurrences: LoanPaymentOccurrenceSummary[],
) {
  return useMemo(() => {
    const now = new Date()
    const subNames = new Map(subscriptions.map((sub) => [String(sub.id), sub.name]))
    const loanNames = new Map(loans.map((loan) => [String(loan.id), loan.name]))
    // Loan occurrences inherit the loan's currency.
    const loanCur = new Map(loans.map((loan) => [String(loan.id), loan.currency ?? "CNY"]))
    const rows = [
      ...subscriptionOccurrences.map((occ) => ({
        name: subNames.get(String(occ.subscriptionId)) ?? "订阅",
        d: occ.dueDate.slice(5),
        amt: Math.abs(Number(occ.amount) || 0),
        cur: occ.currency,
        kind: "订阅",
        dueDate: new Date(occ.dueDate),
      })),
      ...loanOccurrences.map((occ) => ({
        name: loanNames.get(String(occ.loanId)) ?? "贷款",
        d: occ.dueDate.slice(5),
        amt: Math.abs(Number(occ.paymentAmount) || 0),
        cur: loanCur.get(String(occ.loanId)) ?? "CNY",
        kind: "贷款",
        dueDate: new Date(occ.dueDate),
      })),
    ]
    return rows
      .filter((u) => {
        const diffDays = (u.dueDate.getTime() - now.getTime()) / 86400000
        return diffDays >= 0 && diffDays <= 30
      })
      .sort((a, b) => a.d.localeCompare(b.d))
      .slice(0, 6)
  }, [loans, loanOccurrences, subscriptions, subscriptionOccurrences])
}

export function OverviewPage() {
  const [cashflowRangeKey, setCashflowRangeKey] = useState<CashflowRangeKey>(readCashflowRangeKey)
  const today = dateKey(new Date())
  const range = cashflowRange(cashflowRangeKey)
  const futureThrough = dateKey(addDays(new Date(), 60))
  const cashflowQuery = useQuery(
    trpc.cashflow.list.queryOptions({
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      status: "active",
      limit: 240,
    }),
  )
  const assetSnapshotsQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: true }))
  const assetHistoryQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: false }))
  const netWorthQuery = useQuery(trpc.assets.netWorth.queryOptions())
  const subscriptionsQuery = useQuery(trpc.subscriptions.list.queryOptions({ status: "active" }))
  const subscriptionOccurrencesQuery = useQuery(
    trpc.subscriptions.occurrences.queryOptions({ dateFrom: today, dateTo: futureThrough }),
  )
  const loansQuery = useQuery(trpc.loans.list.queryOptions({ status: "active" }))
  const loanOccurrencesQuery = useQuery(
    trpc.loans.occurrences.queryOptions({ dateFrom: today, dateTo: futureThrough }),
  )
  const futurePressureQuery = useQuery(
    trpc.loans.futurePressure.queryOptions({ dateFrom: today, dateTo: futureThrough }),
  )
  const budgetPeriodsQuery = useQuery(trpc.budgets.periods.queryOptions({ status: "active" }))
  const currentBudgetPeriod = budgetPeriodsQuery.data?.find(
    (period) => period.periodStart <= today && period.periodEnd >= today,
  )
  const budgetProgressQuery = useQuery({
    ...trpc.budgets.progress.queryOptions({ budgetPeriodId: currentBudgetPeriod?.id ?? "" }),
    enabled: Boolean(currentBudgetPeriod),
  })
  usePagePerf("overview", [
    { name: "cashflow.list", query: cashflowQuery },
    { name: "assets.snapshots.latest", query: assetSnapshotsQuery },
    { name: "assets.snapshots.history", query: assetHistoryQuery },
    { name: "assets.netWorth", query: netWorthQuery },
    { name: "subscriptions.list", query: subscriptionsQuery },
    { name: "subscriptions.occurrences", query: subscriptionOccurrencesQuery },
    { name: "loans.list", query: loansQuery },
    { name: "loans.occurrences", query: loanOccurrencesQuery },
    { name: "loans.futurePressure", query: futurePressureQuery },
    { name: "budgets.periods", query: budgetPeriodsQuery },
    { name: "budgets.progress", query: budgetProgressQuery },
  ])

  const { toDisplay, baseSymbol } = useCurrentRates()
  const events = cashflowQuery.data ?? []
  const assetSnapshots = assetSnapshotsQuery.data ?? []
  const totalAssets = Number(netWorthQuery.data?.assetValue.number ?? 0)
  const totalLiab = Number(netWorthQuery.data?.liabilityValue.number ?? 0)
  const liquidAssets = useMemo(
    () =>
      assetSnapshots
        .filter((a) => ["cash", "bank", "wallet"].includes(a.assetType))
        .reduce((s, a) => s + (toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0), 0),
    [assetSnapshots, toDisplay],
  )
  const netWorth = Number(netWorthQuery.data?.netWorth.number ?? totalAssets - totalLiab)
  const _netTrend = useNetWorthTrend(assetHistoryQuery.data ?? [])
  const netGain = _netTrend[11] - _netTrend[0]

  const { income: _monthIn, expense: _monthOut, net: _monthNet } = useCashflowStats(events)
  const monthIn = _monthIn
  const monthOut = _monthOut
  const monthNet = _monthNet

  const dailyBars = useDailyBars(events, range)

  const budgets = (budgetProgressQuery.data ?? []).map((row) => ({
    cat: row.budgetName,
    color:
      row.color ?? BUDGET_CATEGORY_COLORS[row.budgetName.replace(/预算$/, "")] ?? "var(--accent)",
    spent: Number(row.referenceUsed),
    limit: Number(row.budgeted),
  }))

  const upcoming = useUpcoming(
    subscriptionsQuery.data ?? [],
    subscriptionOccurrencesQuery.data ?? [],
    loansQuery.data ?? [],
    loanOccurrencesQuery.data ?? [],
  )

  const upSum = upcoming.reduce((s, u) => s + (toDisplay(u.amt, u.cur) ?? 0), 0)
  const monthlyFixed = Number(futurePressureQuery.data?.total ?? upSum)

  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetRemain = budgetTotal - budgetSpent
  const scaleMax = Math.max(...budgets.map((b) => Math.max(b.spent, b.limit)), 1)

  const _recentTx = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
    [events],
  )
  const recentTx = _recentTx
  const transactionRows = recentTx.map((t) => ({
    date: t.date,
    description: t.description ?? undefined,
    counterparty: t.counterparty ?? undefined,
    flowKind: t.flowKind,
    amount: t.amount,
    categoryName: t.categoryName ?? undefined,
  }))

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col px-[34px] pt-[30px] pb-10">
          {/* ── 净资产 + 趋势 ── */}
          <div className="flex items-stretch gap-9 pb-[18px]">
            <div>
              <Kicker className="mb-1.5">净资产</Kicker>
              <BigNumber className="text-[48px]">
                <span className="text-[21px] font-medium text-[var(--ink-3)] mr-1.5">
                  {baseSymbol}
                </span>
                {fmt(netWorth)}
              </BigNumber>
              <div className="flex gap-[30px] mt-3">
                <StatBlock label="流动资产" value={`${baseSymbol}${fmt(liquidAssets)}`} />
                <StatBlock label="总资产" value={`${baseSymbol}${fmt(totalAssets)}`} />
                <StatBlock label="欠款" value={`${baseSymbol}${fmt(totalLiab)}`} />
              </div>
            </div>
            <div className="ml-auto flex flex-col w-1/2 text-right">
              <Dim className="text-[11.5px] mb-2 block">
                近 12 个月{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--green)] ml-1">
                  +{baseSymbol}
                  {fmt(netGain)}
                </span>
              </Dim>
              <div className="mt-auto">
                <NetWorthTrend data={_netTrend} />
              </div>
            </div>
          </div>

          {/* ── 本月结余 + 日柱 ── */}
          <div className="mt-[22px] pb-6">
            <div className="flex items-start mb-3">
              <div>
                <Kicker className="mb-1.5">
                  <span className="inline-flex items-center gap-0.5">
                    <span>{range.heading} · </span>
                    <Dropdown>
                      <Dropdown.Trigger
                        aria-label="选择现金流时间范围"
                        className="min-h-0 border-0 bg-transparent p-0 text-[inherit] font-[inherit] leading-[inherit] text-[var(--ink-2)] shadow-none hover:bg-transparent"
                      >
                        <span className="border-b border-dashed border-[var(--ink-4)]">
                          {range.switchLabel}
                        </span>
                      </Dropdown.Trigger>
                      <Dropdown.Popover placement="bottom start">
                        <Dropdown.Menu
                          aria-label="选择现金流时间范围"
                          selectionMode="single"
                          selectedKeys={[cashflowRangeKey]}
                          onAction={(key) => {
                            const next = String(key)
                            if (!isCashflowRangeKey(next)) return
                            setCashflowRangeKey(next)
                            writeCashflowRangeKey(next)
                          }}
                        >
                          {CASHFLOW_RANGE_OPTIONS.map((option) => (
                            <Dropdown.Item key={option.key} id={option.key}>
                              {option.label}
                              <Dropdown.ItemIndicator />
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </span>
                </Kicker>
                <BigNumber
                  className={`text-[26px] ${monthNet >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}
                >
                  {signed(monthNet)}
                </BigNumber>
              </div>
              <Dim className="text-[10.5px] ml-auto pt-[1px]">
                {range.caption} · 消费{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--red)]">−¥{fmt(monthOut)}</span>
                {" · "}收入{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--green)]">+¥{fmt(monthIn)}</span>
                {" · "}
                <Link
                  to="/analysis"
                  className="cursor-pointer text-[var(--accent)] hover:opacity-75 transition-opacity"
                >
                  查看结余信息 →
                </Link>
              </Dim>
            </div>
            <DailyBars data={dailyBars} />
            <div className="flex justify-between mt-1.5">
              <Dim className="text-[10px]">{range.axisStart}</Dim>
              <span className="text-[10px] font-semibold text-[var(--accent)]">
                {range.axisEnd}
              </span>
            </div>
          </div>

          {/* ── 两列：预算 + 即将扣费 ── */}
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-[60px] mt-[22px]">
            {/* 左：消费预算 */}
            <div className="overflow-hidden">
              <div className="flex items-baseline mb-[15px]">
                <SectionTitle>消费 · 本月预算</SectionTitle>
                <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
                  还能花{" "}
                  <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">
                    ¥{fmt(budgetRemain)}
                  </b>
                  {" · "}已用 {budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0}%
                </Dim>
              </div>
              {budgets.length === 0 ? (
                <Dim className="text-[12px]">暂无消费记录 · 导入账单后自动统计</Dim>
              ) : (
                <div className="flex flex-col gap-[11px]">
                  {budgets.map((b, i) => (
                    <BudgetBar
                      key={i}
                      color={b.color}
                      spent={b.spent}
                      limit={b.limit}
                      label={b.cat}
                      scaleMax={scaleMax}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 右：即将扣费 */}
            <div className="overflow-hidden">
              <div className="flex items-baseline mb-[14px]">
                <SectionTitle>即将扣费</SectionTitle>
                <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
                  未来 30 天 · {upcoming.length} 笔
                </Dim>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-['IBM_Plex_Mono'] text-[22px] font-semibold text-[var(--ink)]">
                  {baseSymbol}
                  {fmt(upSum)}
                </span>
                <Dim className="text-[11px] ml-auto whitespace-nowrap">
                  月固定支出{" "}
                  <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">
                    {baseSymbol}
                    {fmt(monthlyFixed)}
                  </b>
                </Dim>
              </div>
              {upcoming.length === 0 ? (
                <Dim className="text-[12px]">未来 30 天暂无定期扣费</Dim>
              ) : (
                <div>
                  {upcoming.map((u, i) => (
                    <UpcomingRow
                      key={i}
                      date={u.d}
                      color={u.kind === "贷款" ? "#ad7c2c" : "#7c6ac4"}
                      name={u.name}
                      kind={u.kind}
                      amount={`${currencySymbol(u.cur)}${fmt(u.amt)}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 分隔线 ── */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[var(--hair-2)]" />
            <Dim className="text-[10.5px] tracking-[0.04em]">查看最近流水</Dim>
            <div className="flex-1 h-px bg-[var(--hair-2)]" />
          </div>

          {/* ── 流水全表 ── */}
          <div className="overflow-hidden">
            <div className="flex items-baseline mb-2.5">
              <SectionTitle>流水</SectionTitle>
              {recentTx.length > 0 && (
                <Dim className="text-[11px] ml-2">最近 {recentTx.length} 笔</Dim>
              )}
              <Link
                to="/imports"
                className="ml-auto cursor-pointer text-[11px] text-[var(--accent)] hover:opacity-75 transition-opacity"
              >
                查看全部流水 →
              </Link>
            </div>
            {recentTx.length === 0 ? (
              <div className="mt-4 text-center py-8">
                <Dim className="text-[12px] block">暂无流水记录</Dim>
                <Dim className="text-[11px] block mt-1">前往「流水」页面导入账单</Dim>
              </div>
            ) : (
              <div className="overflow-hidden mt-2.5">
                <TransactionTable rows={transactionRows} />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <Dock />
    </div>
  )
}
