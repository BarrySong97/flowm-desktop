import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Dock } from "../components/layout/Dock"
import type { AssetSnapshotSummary, FinancialEventSummary, LoanPaymentOccurrenceSummary, SubscriptionOccurrenceSummary } from "@flowm/api"
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
import { TransactionTable, categoryColor } from "../components/ui/TransactionTable"
import { NetWorthTrend } from "../components/charts/NetWorthTrend"
import { DailyBars } from "../components/charts/DailyBars"
import { ScrollArea } from "../components/ui/ScrollArea"

const fmt = formatNumber
const signed = formatSignedCurrency

function useMonthStats(events: FinancialEventSummary[]) {
  return useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    let income = 0, expense = 0
    for (const e of events) {
      if (!e.date.startsWith(ym)) continue
      const amt = Math.abs(Number(e.amount) || 0)
      if (e.status !== "active" || !e.includeInAnalytics) continue
      if (e.flowKind === "income" && e.direction === "in") income += amt
      else if (e.flowKind === "expense" && e.direction === "out") expense += amt
    }
    return { income, expense, net: income - expense }
  }, [events])
}

function useDailyBars(events: FinancialEventSummary[]): number[] {
  return useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    const now = new Date()
    for (const e of events) {
      if (e.flowKind !== "expense" || e.status !== "active" || !e.includeInAnalytics) continue
      const daysAgo = Math.floor((now.getTime() - new Date(e.date).getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 30) bars[29 - daysAgo] += Math.abs(Number(e.amount) || 0)
    }
    return bars
  }, [events])
}

function useNetWorthTrend(snapshots: AssetSnapshotSummary[]): number[] {
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
      .map(([, bucket]) => [...bucket.values()].reduce((sum, asset) => {
        const amount = Math.abs(Number(asset.valueNumber || 0))
        return sum + (asset.assetType === "liability" ? -amount : amount)
      }, 0))
    if (values.length >= 12) return values.slice(-12)
    return [...new Array(12 - values.length).fill(values[0] ?? 0), ...values]
  }, [snapshots])
}

function useUpcoming(
  subscriptions: Array<{ id: string | number; name: string }>,
  subscriptionOccurrences: SubscriptionOccurrenceSummary[],
  loans: Array<{ id: string | number; name: string }>,
  loanOccurrences: LoanPaymentOccurrenceSummary[],
) {
  return useMemo(() => {
    const now = new Date()
    const subNames = new Map(subscriptions.map((sub) => [String(sub.id), sub.name]))
    const loanNames = new Map(loans.map((loan) => [String(loan.id), loan.name]))
    const rows = [
      ...subscriptionOccurrences.map((occ) => ({
        name: subNames.get(String(occ.subscriptionId)) ?? "订阅",
        d: occ.dueDate.slice(5),
        amt: Math.abs(Number(occ.amount) || 0),
        kind: "订阅",
        dueDate: new Date(occ.dueDate),
      })),
      ...loanOccurrences.map((occ) => ({
        name: loanNames.get(String(occ.loanId)) ?? "贷款",
        d: occ.dueDate.slice(5),
        amt: Math.abs(Number(occ.paymentAmount) || 0),
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
  const navigate = useNavigate()
  const today = dateKey(new Date())
  const futureThrough = dateKey(addDays(new Date(), 60))
  const monthFrom = monthStart(new Date())
  const cashflowQuery = useQuery(trpc.cashflow.list.queryOptions({ dateFrom: monthFrom, dateTo: today, status: "active", limit: 240 }))
  const assetSnapshotsQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: true }))
  const assetHistoryQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: false }))
  const netWorthQuery = useQuery(trpc.assets.netWorth.queryOptions())
  const subscriptionsQuery = useQuery(trpc.subscriptions.list.queryOptions({ status: "active" }))
  const subscriptionOccurrencesQuery = useQuery(trpc.subscriptions.occurrences.queryOptions({ dateFrom: today, dateTo: futureThrough }))
  const loansQuery = useQuery(trpc.loans.list.queryOptions({ status: "active" }))
  const loanOccurrencesQuery = useQuery(trpc.loans.occurrences.queryOptions({ dateFrom: today, dateTo: futureThrough }))
  const futurePressureQuery = useQuery(trpc.loans.futurePressure.queryOptions({ dateFrom: today, dateTo: futureThrough }))
  const budgetPeriodsQuery = useQuery(trpc.budgets.periods.queryOptions({ status: "active" }))
  const currentBudgetPeriod = budgetPeriodsQuery.data?.find((period) => period.periodStart <= today && period.periodEnd >= today)
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

  const events = cashflowQuery.data ?? []
  const assetSnapshots = assetSnapshotsQuery.data ?? []
  const totalAssets = Number(netWorthQuery.data?.assetValue.number ?? 0)
  const totalLiab = Number(netWorthQuery.data?.liabilityValue.number ?? 0)
  const liquidAssets = useMemo(
    () => assetSnapshots.filter((a) => ["cash", "bank", "wallet"].includes(a.assetType)).reduce((s, a) => s + Number(a.valueNumber || 0), 0),
    [assetSnapshots],
  )
  const netWorth = Number(netWorthQuery.data?.netWorth.number ?? totalAssets - totalLiab)
  const _netTrend = useNetWorthTrend(assetHistoryQuery.data ?? [])
  const netGain       = _netTrend[11] - _netTrend[0]

  const { income: _monthIn, expense: _monthOut, net: _monthNet } = useMonthStats(events)
  const monthIn = _monthIn
  const monthOut = _monthOut
  const monthNet = _monthNet

  const dailyBars = useDailyBars(events)

  const budgets = (budgetProgressQuery.data ?? []).map((row) => ({
    cat: row.budgetName,
    color: row.color,
    spent: Number(row.referenceUsed),
    limit: Number(row.budgeted),
  }))

  const upcoming = useUpcoming(
    subscriptionsQuery.data ?? [],
    subscriptionOccurrencesQuery.data ?? [],
    loansQuery.data ?? [],
    loanOccurrencesQuery.data ?? [],
  )

  const upSum = upcoming.reduce((s, u) => s + u.amt, 0)
  const monthlyFixed = Number(futurePressureQuery.data?.total ?? upSum)

  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetRemain = budgetTotal - budgetSpent
  const scaleMax = Math.max(...budgets.map((b) => Math.max(b.spent, b.limit)), 1)

  const _recentTx = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
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

  const now = new Date()
  const monLabel = `${now.getMonth() + 1} 月`

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div style={{ padding: "30px 34px 40px", display: "flex", flexDirection: "column" }}>

          {/* ── 净资产 + 趋势 ── */}
          <div className="flex items-stretch gap-9 pb-[18px]">
            <div>
              <Kicker className="mb-1.5">净资产</Kicker>
              <BigNumber style={{ fontSize: 48 }}>
                <span className="text-[21px] font-medium text-[var(--ink-3)] mr-1.5">¥</span>
                {fmt(netWorth)}
              </BigNumber>
              <div className="flex gap-[30px] mt-3">
                <StatBlock label="流动资产" value={`¥${fmt(liquidAssets)}`} />
                <StatBlock label="总资产" value={`¥${fmt(totalAssets)}`} />
                <StatBlock label="欠款" value={`¥${fmt(totalLiab)}`} />
              </div>
            </div>
            <div className="ml-auto flex flex-col w-1/2 text-right">
              <Dim className="text-[11.5px] mb-2 block">
                近 12 个月{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--green)] ml-1">+¥{fmt(netGain)}</span>
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
                <Kicker className="mb-1.5">本月结余 · {monLabel}</Kicker>
                <BigNumber style={{ fontSize: 26, color: monthNet >= 0 ? "var(--green)" : "var(--red)" }}>
                  {signed(monthNet)}
                </BigNumber>
              </div>
              <Dim className="text-[10.5px] ml-auto pt-[1px]">
                过去 30 天 · 消费{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--red)]">−¥{fmt(monthOut)}</span>
                {" · "}收入{" "}
                <span className="font-['IBM_Plex_Mono'] text-[var(--green)]">+¥{fmt(monthIn)}</span>
              </Dim>
            </div>
            <DailyBars data={dailyBars} />
            <div className="flex justify-between mt-1.5">
              <Dim className="text-[10px]">30 天前</Dim>
              <span className="text-[10px] font-semibold" style={{ color: "var(--accent)" }}>今天</span>
            </div>
          </div>

          {/* ── 两列：预算 + 即将扣费 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 60, marginTop: 22 }}>
            {/* 左：消费预算 */}
            <div className="overflow-hidden">
              <div className="flex items-baseline mb-[15px]">
                <SectionTitle>消费 · 本月预算</SectionTitle>
                <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
                  还能花{" "}
                  <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">¥{fmt(budgetRemain)}</b>
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
                      color={b.color ?? categoryColor(b.cat)}
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
                <Dim className="text-[10.5px] ml-auto whitespace-nowrap">未来 30 天 · {upcoming.length} 笔</Dim>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-['IBM_Plex_Mono'] text-[22px] font-semibold text-[var(--ink)]">¥{fmt(upSum)}</span>
                <Dim className="text-[11px] ml-auto whitespace-nowrap">
                  月固定支出{" "}
                  <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">¥{fmt(monthlyFixed)}</b>
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
                      amount={`¥${fmt(u.amt)}`}
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
              <button
                onClick={() => navigate({ to: "/imports" })}
                className="ml-auto text-[11px] text-[var(--accent)] hover:opacity-75 transition-opacity"
              >
                查看全部流水 →
              </button>
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
