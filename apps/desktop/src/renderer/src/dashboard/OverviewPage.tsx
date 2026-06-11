import { useMemo } from "react"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Dock } from "../components/layout/Dock"
import type { AssetSnapshotSummary, FinancialEventSummary, PlanSummary } from "@flowm/api"
import {
  MOCK_DAILY_BARS, MOCK_NET_TREND, MOCK_UPCOMING, MOCK_BUDGETS, MOCK_TX,
  MOCK_NET_WORTH, MOCK_TOTAL_ASSETS, MOCK_LIQUID_ASSETS, MOCK_TOTAL_LIAB,
  MOCK_MONTH_IN, MOCK_MONTH_OUT, MOCK_MONTH_NET, MOCK_MONTHLY_FIXED,
} from "./mockData"
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

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function signed(n: number) {
  return (n >= 0 ? "+" : "−") + "¥" + fmt(Math.abs(n))
}

const DEFAULT_LIMITS: Record<string, number> = {
  餐饮: 2000, 交通: 800, 购物: 1500, 订阅: 500,
  娱乐: 600, 居住: 3000, 其他: 500,
}

function useMonthStats(events: FinancialEventSummary[]) {
  return useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    let income = 0, expense = 0
    for (const e of events) {
      if (!e.date.startsWith(ym)) continue
      const amt = Math.abs(Number(e.amount) || 0)
      if (e.flowKind === "income") income += amt
      else if (e.flowKind === "expense") expense += amt
    }
    return { income, expense, net: income - expense }
  }, [events])
}

function useDailyBars(events: FinancialEventSummary[]): number[] {
  return useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    const now = new Date()
    for (const e of events) {
      if (e.flowKind !== "expense") continue
      const daysAgo = Math.floor((now.getTime() - new Date(e.date).getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 30) bars[29 - daysAgo] += Math.abs(Number(e.amount) || 0)
    }
    return bars
  }, [events])
}

function useNetWorthTrend(snapshots: AssetSnapshotSummary[]): number[] {
  return useMemo(() => {
    if (snapshots.length === 0) return new Array(12).fill(0)
    const total = snapshots.reduce((s, a) => s + Number(a.valueNumber || 0), 0)
    return new Array(12).fill(0).map((_, i) => total * (0.85 + i * 0.015))
  }, [snapshots])
}

function useUpcoming(plans: PlanSummary[]) {
  return useMemo(() => {
    const now = new Date()
    return plans
      .filter((p) => p.status === "active" && p.nextDueDate)
      .map((p) => ({
        name: p.name,
        d: p.nextDueDate!.slice(5),
        amt: Math.abs(Number(p.amount) || 0),
        kind: p.planType === "loan" ? "贷款" : "订阅",
        dueDate: new Date(p.nextDueDate!),
      }))
      .filter((u) => {
        const diffDays = (u.dueDate.getTime() - now.getTime()) / 86400000
        return diffDays >= 0 && diffDays <= 30
      })
      .sort((a, b) => a.d.localeCompare(b.d))
      .slice(0, 6)
  }, [plans])
}

function useBudgets(events: FinancialEventSummary[]) {
  return useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const spendMap = new Map<string, number>()
    for (const e of events) {
      if (e.flowKind !== "expense" || !e.date.startsWith(ym)) continue
      const cat = e.categoryName ?? "其他"
      if (cat === "收入" || cat === "转账") continue
      spendMap.set(cat, (spendMap.get(cat) ?? 0) + Math.abs(Number(e.amount) || 0))
    }
    const cats = [...new Set([...Object.keys(DEFAULT_LIMITS), ...spendMap.keys()])]
      .filter((c) => c !== "收入" && c !== "转账")
    return cats
      .map((cat) => ({ cat, spent: spendMap.get(cat) ?? 0, limit: DEFAULT_LIMITS[cat] ?? 500 }))
      .filter((b) => b.spent > 0 || DEFAULT_LIMITS[b.cat] !== undefined)
  }, [events])
}

export function OverviewPage() {
  const snapshot = useFlowmStore((s) => s.snapshot)
  const assetSnapshots = useFlowmStore((s) => s.assetSnapshots)
  const plans = useFlowmStore((s) => s.plans)

  const events = useMemo<FinancialEventSummary[]>(
    () =>
      (snapshot.transactions ?? []).map((t: Record<string, unknown>) => ({
        id: Number(t.id ?? 0),
        date: String(t.date ?? ""),
        description: String(t.narration ?? t.description ?? ""),
        counterparty: String(t.payee ?? ""),
        flowKind: String(t.kind ?? t.flowKind ?? "expense"),
        amount: String(t.amountNumber ?? t.amount ?? "0"),
        currency: String(t.currency ?? "CNY"),
        categoryName: String(t.category ?? ""),
        classificationSource: "snapshot",
        createdAt: String(t.date ?? ""),
      })),
    [snapshot],
  )

  // Always compute from real data first, then fall back to mock if result is empty/zero
  const _totalAssets = useMemo(
    () => assetSnapshots.filter((a) => a.assetType !== "liability").reduce((s, a) => s + Number(a.valueNumber || 0), 0),
    [assetSnapshots],
  )
  const _totalLiab = useMemo(
    () => assetSnapshots.filter((a) => a.assetType === "liability").reduce((s, a) => s + Math.abs(Number(a.valueNumber || 0)), 0),
    [assetSnapshots],
  )
  const _liquidAssets = useMemo(
    () => assetSnapshots.filter((a) => ["cash", "bank", "wallet"].includes(a.assetType)).reduce((s, a) => s + Number(a.valueNumber || 0), 0),
    [assetSnapshots],
  )
  const hasRealAssets = _totalAssets > 0 || _totalLiab > 0
  const totalAssets   = hasRealAssets ? _totalAssets  : MOCK_TOTAL_ASSETS
  const totalLiab     = hasRealAssets ? _totalLiab    : MOCK_TOTAL_LIAB
  const liquidAssets  = hasRealAssets ? _liquidAssets : MOCK_LIQUID_ASSETS
  const netWorth      = hasRealAssets ? totalAssets - totalLiab : MOCK_NET_WORTH
  const netTrend      = useNetWorthTrend(assetSnapshots)
  const _netTrend     = hasRealAssets ? netTrend : MOCK_NET_TREND
  const netGain       = _netTrend[11] - _netTrend[0]

  const { income: _monthIn, expense: _monthOut, net: _monthNet } = useMonthStats(events)
  const hasRealFlow = _monthIn > 0 || _monthOut > 0
  const monthIn  = hasRealFlow ? _monthIn  : MOCK_MONTH_IN
  const monthOut = hasRealFlow ? _monthOut : MOCK_MONTH_OUT
  const monthNet = hasRealFlow ? _monthNet : MOCK_MONTH_NET

  const _dailyBars = useDailyBars(events)
  const dailyBars = hasRealFlow ? _dailyBars : MOCK_DAILY_BARS

  const _budgets = useBudgets(events)
  const budgets = _budgets.length > 0 ? _budgets : MOCK_BUDGETS

  const _upcoming = useUpcoming(plans)
  const upcoming = _upcoming.length > 0 ? _upcoming : MOCK_UPCOMING

  const upSum = upcoming.reduce((s, u) => s + u.amt, 0)
  const _monthlyFixed = plans.filter((p) => p.status === "active").reduce((s, p) => s + Math.abs(Number(p.amount) || 0), 0)
  const monthlyFixed = _monthlyFixed > 0 ? _monthlyFixed : MOCK_MONTHLY_FIXED

  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetRemain = budgetTotal - budgetSpent
  const scaleMax = Math.max(...budgets.map((b) => Math.max(b.spent, b.limit)), 1)

  const _recentTx = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  )
  const recentTx = _recentTx.length > 0 ? _recentTx : MOCK_TX

  const now = new Date()
  const monLabel = `${now.getMonth() + 1} 月`

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div style={{ padding: "30px 34px 40px", display: "flex", flexDirection: "column" }}>

          {/* ── 净资产 + 趋势 ── */}
          <div className="flex items-stretch gap-9 pb-[18px] border-b border-[var(--hair-2)]">
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
          <div className="mt-[22px] pb-6 border-b border-[var(--hair-2)]">
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
                      color={categoryColor(b.cat)}
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
            <Dim className="text-[10.5px] tracking-[0.04em] inline-flex items-center gap-1">
              下滑查看全部流水
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v10M4 9l4 4 4-4" />
              </svg>
            </Dim>
            <div className="flex-1 h-px bg-[var(--hair-2)]" />
          </div>

          {/* ── 流水全表 ── */}
          <div className="overflow-hidden">
            <div className="flex items-baseline mb-2.5">
              <SectionTitle>流水</SectionTitle>
              {recentTx.length > 0 && (
                <Dim className="text-[11px] ml-2">最近 {recentTx.length} 笔</Dim>
              )}
            </div>
            {recentTx.length === 0 ? (
              <div className="mt-4 text-center py-8">
                <Dim className="text-[12px] block">暂无流水记录</Dim>
                <Dim className="text-[11px] block mt-1">前往「流水」页面导入账单</Dim>
              </div>
            ) : (
              <div className="overflow-hidden mt-2.5">
                <TransactionTable rows={recentTx} />
              </div>
            )}
          </div>

        </div>
      </ScrollArea>
      <Dock />
    </div>
  )
}
