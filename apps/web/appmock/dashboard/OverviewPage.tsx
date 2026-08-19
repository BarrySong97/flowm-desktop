/**
 * @purpose Render the dashboard overview across Flowm finance layers.
 * @role    Renderer overview that composes cashflow, assets, and obligations.
 * @deps    React, tRPC dashboard queries, charts, and UI primitives.
 * @gotcha  Show layers together without implying they reconcile into one ledger.
 */

import { useMemo, useState } from "react"
import { Dropdown } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@mock/_shim/router"
import type { CashflowEventSummary, LoanPaymentOccurrenceSummary } from "@flowm/api"
import type { AssetSnapshotSummary } from "@flowm/shared/contracts"
import { trpc } from "@mock/lib/trpc"
import { usePagePerf } from "@mock/lib/debug/perf"
import { addDays, dateKey, localDateKey, monthStart } from "@mock/lib/dates"
import { useMoney, useSignedMoney } from "@mock/lib/useMoney"
import { Kicker } from "../components/ui/Kicker"
import { BigNumber } from "../components/ui/BigNumber"
import { StatBlock } from "../components/ui/StatBlock"
import { SectionTitle } from "../components/ui/SectionTitle"
import { Dim } from "../components/ui/Dim"
import { UpcomingRow } from "../components/ui/UpcomingRow"
import { BudgetBar } from "../components/ui/BudgetBar"
import { TransactionTable } from "../components/ui/TransactionTable"
import { BUDGET_CATEGORY_COLORS } from "@mock/lib/domainDisplay"
import { NetWorthTrend } from "../components/charts/NetWorthTrend"
import { DailyBars } from "../components/charts/DailyBars"
import { ScrollArea } from "../components/ui/ScrollArea"
import { useCurrentRates } from "@mock/lib/useCurrentRates"
import {
  currencySymbol,
  projectSubscriptionPlans,
  type SubscriptionProjectionPlan,
} from "@flowm/shared"

type CashflowRangeKey = "this_month" | "last_month" | "last_30" | "last_90" | "year" | "all"
const DEFAULT_CASHFLOW_RANGE_KEY: CashflowRangeKey = "this_month"
const CASHFLOW_RANGE_STORAGE_KEY = "flowm:overview:cashflow-range"
const MOCK_NOW = new Date(2026, 5, 21, 12)

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
    const bars = Array.from({ length: 30 }, () => 0)
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
    if (snapshots.length === 0) return Array.from({ length: 12 }, () => 0)
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
    return [...Array.from({ length: 12 - values.length }, () => values[0] ?? 0), ...values]
  }, [snapshots, toDisplay])
}

function useUpcoming(
  subscriptions: Array<SubscriptionProjectionPlan & { name: string }>,
  loans: Array<{ id: string | number; name: string; currency?: string }>,
  loanOccurrences: LoanPaymentOccurrenceSummary[],
) {
  return useMemo(() => {
    const now = new Date()
    const dateFrom = localDateKey(now)
    const dateTo = localDateKey(addDays(now, 30))
    const subscriptionOccurrences = projectSubscriptionPlans(subscriptions, dateFrom, dateTo)
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
        dueDate: occ.dueDate,
      })),
      ...loanOccurrences.map((occ) => ({
        name: loanNames.get(String(occ.loanId)) ?? "贷款",
        d: occ.dueDate.slice(5),
        amt: Math.abs(Number(occ.paymentAmount) || 0),
        cur: loanCur.get(String(occ.loanId)) ?? "CNY",
        kind: "贷款",
        dueDate: occ.dueDate,
      })),
    ]
    return rows
      .filter((row) => row.dueDate >= dateFrom && row.dueDate <= dateTo)
      .sort((a, b) => a.d.localeCompare(b.d))
      .slice(0, 6)
  }, [loans, loanOccurrences, subscriptions])
}

export function OverviewPage() {
  const fmt = useMoney()
  const signed = useSignedMoney()
  const [cashflowRangeKey, setCashflowRangeKey] = useState<CashflowRangeKey>(readCashflowRangeKey)
  const today = localDateKey(MOCK_NOW)
  const range = cashflowRange(cashflowRangeKey, MOCK_NOW)
  const futureThrough = localDateKey(addDays(MOCK_NOW, 60))
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
  const visibleBudgets = budgets.slice(0, 4)

  const upcoming = useUpcoming(
    subscriptionsQuery.data ?? [],
    loansQuery.data ?? [],
    loanOccurrencesQuery.data ?? [],
  )
  const visibleUpcoming = upcoming.slice(0, 4)

  const upSum = upcoming.reduce((s, u) => s + (toDisplay(u.amt, u.cur) ?? 0), 0)
  const monthlyFixed = Number(futurePressureQuery.data?.total ?? upSum)

  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetRemain = budgetTotal - budgetSpent
  const scaleMax = Math.max(...budgets.map((b) => Math.max(b.spent, b.limit)), 1)

  const _recentTx = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12),
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
    <div className="relative grid h-full min-h-0 grid-cols-[minmax(430px,1.2fr)_minmax(360px,0.8fr)] overflow-hidden bg-white">
      <ScrollArea className="min-h-0 border-r border-[var(--hair)]">
        <div className="flex min-h-full flex-col px-7 py-6">
          {/* ── 净资产 + 趋势 ── */}
          <section className="flex items-stretch gap-7 border-b border-[var(--hair-2)] pb-5">
            <div>
              <Kicker className="mb-1.5">净资产</Kicker>
              <BigNumber className="text-[clamp(34px,3vw,46px)] leading-none">
                <span className="mr-1.5 text-[19px] font-medium text-[var(--ink-3)]">
                  {baseSymbol}
                </span>
                {fmt(netWorth)}
              </BigNumber>
              <div className="mt-3 flex gap-6">
                <StatBlock label="流动资产" value={`${baseSymbol}${fmt(liquidAssets)}`} />
                <StatBlock label="总资产" value={`${baseSymbol}${fmt(totalAssets)}`} />
                <StatBlock label="欠款" value={`${baseSymbol}${fmt(totalLiab)}`} />
              </div>
            </div>
            <div className="ml-auto hidden min-w-[180px] flex-1 flex-col text-right min-[1120px]:flex">
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
          </section>

          {/* ── 本月结余 + 日柱 ── */}
          <section className="border-b border-[var(--hair-2)] py-5">
            <div className="mb-3 flex items-start gap-4">
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
              <Dim className="ml-auto hidden pt-[1px] text-right text-[10.5px] leading-5 min-[1120px]:block">
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
          </section>

          {/* ── 两列：预算 + 即将扣费 ── */}
          <section className="grid grid-cols-1 gap-6 pt-5 min-[1120px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] min-[1120px]:gap-7">
            {/* 左：消费预算 */}
            <div className="overflow-hidden">
              <div className="mb-3 flex items-baseline">
                <SectionTitle>消费 · 本月预算</SectionTitle>
                <Dim className="ml-auto whitespace-nowrap text-[10.5px]">
                  余{" "}
                  <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">
                    ¥{fmt(budgetRemain)}
                  </b>
                </Dim>
              </div>
              {budgets.length === 0 ? (
                <Dim className="text-[12px]">暂无消费记录 · 导入账单后自动统计</Dim>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {visibleBudgets.map((b, i) => (
                    <BudgetBar
                      key={i}
                      color={b.color}
                      spent={b.spent}
                      limit={b.limit}
                      label={b.cat}
                      scaleMax={scaleMax}
                    />
                  ))}
                  {budgets.length > visibleBudgets.length && (
                    <Link
                      to="/budget"
                      className="pt-1 text-right text-[11px] text-[var(--accent)] transition-opacity hover:opacity-75"
                    >
                      查看全部预算 →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 右：即将扣费 */}
            <div className="overflow-hidden">
              <div className="mb-3 flex items-baseline">
                <SectionTitle>即将扣费</SectionTitle>
                <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
                  未来 30 天 · {upcoming.length} 笔
                </Dim>
              </div>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="font-['IBM_Plex_Mono'] text-[20px] font-semibold text-[var(--ink)]">
                  {baseSymbol}
                  {fmt(upSum)}
                </span>
                <Dim className="ml-auto whitespace-nowrap text-[10.5px]">
                  月固定{" "}
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
                  {visibleUpcoming.map((u, i) => (
                    <UpcomingRow
                      key={i}
                      date={u.d}
                      color={u.kind === "贷款" ? "#ad7c2c" : "#7c6ac4"}
                      name={u.name}
                      kind={u.kind}
                      amount={`${currencySymbol(u.cur)}${fmt(u.amt)}`}
                    />
                  ))}
                  {upcoming.length > visibleUpcoming.length && (
                    <Link
                      to="/subscriptions"
                      className="block pt-2 text-right text-[11px] text-[var(--accent)] transition-opacity hover:opacity-75"
                    >
                      展示更多 →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* ── 右栏：最近流水 ── */}
      <section className="flex min-h-0 flex-col bg-white">
        <div className="flex h-[66px] shrink-0 items-center border-b border-[var(--hair)] px-6">
          <div>
            <div className="flex items-baseline gap-2">
              <SectionTitle>最近流水</SectionTitle>
              {recentTx.length > 0 && <Dim className="text-[11px]">最近 {recentTx.length} 笔</Dim>}
            </div>
            <Dim className="mt-1 block text-[10.5px]">过去现金流 · 不用于推算当前资产余额</Dim>
          </div>
          <Link
            to="/imports"
            className="ml-auto text-[11px] text-[var(--accent)] transition-opacity hover:opacity-75"
          >
            查看全部 →
          </Link>
        </div>
        <ScrollArea className="min-h-0 flex-1 px-5 py-3 [&_td]:py-3">
          {recentTx.length === 0 ? (
            <div className="py-12 text-center">
              <Dim className="block text-[12px]">暂无流水记录</Dim>
              <Dim className="mt-1 block text-[11px]">前往「流水」页面导入账单</Dim>
            </div>
          ) : (
            <TransactionTable rows={transactionRows} />
          )}
        </ScrollArea>
      </section>
    </div>
  )
}
