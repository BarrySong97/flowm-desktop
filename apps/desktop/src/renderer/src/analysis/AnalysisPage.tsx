/**
 * @purpose Render long-range cashflow analysis for income, expense, and net savings.
 * @role    Renderer analysis page composed from guarded tRPC cashflow trend queries.
 * @deps    React, TanStack Query/Router, Flowm chart and UI primitives.
 * @gotcha  This page summarizes past cashflow only; do not infer assets or forecasts from it.
 */

import { useMemo, useState } from "react"
import { Tabs } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { Link, useRouter } from "@tanstack/react-router"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { useCurrencyMoney, useMoney, useSignedMoney } from "@/lib/useMoney"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Kicker } from "../components/ui/Kicker"
import { BigNumber } from "../components/ui/BigNumber"
import { SectionTitle } from "../components/ui/SectionTitle"
import { Dim } from "../components/ui/Dim"
import { BackButton } from "../components/ui/BackButton"
import {
  MonthlyCashflowCombo,
  MonthlyNetBars,
  type MonthlyCashflowTrendPoint,
} from "../components/charts/MonthlyCashflowCharts"

type RangeKey = "6m" | "12m" | "year"

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string; months: number }> = [
  { key: "6m", label: "近 6 月", months: 6 },
  { key: "12m", label: "近 12 月", months: 12 },
  { key: "year", label: "今年", months: new Date().getMonth() + 1 },
]

function sum(rows: MonthlyCashflowTrendPoint[], key: "income" | "expense" | "net") {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0)
}

function monthLabel(month: string) {
  return `${Number(month.slice(5, 7))}月`
}

function RangeControl({
  value,
  onChange,
}: {
  value: RangeKey
  onChange: (value: RangeKey) => void
}) {
  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(String(key) as RangeKey)}
      aria-label="选择趋势范围"
    >
      <Tabs.ListContainer>
        <Tabs.List>
          {RANGE_OPTIONS.map((option) => (
            <Tabs.Tab
              key={option.key}
              id={option.key}
              className="h-6 min-w-[64px] whitespace-nowrap px-4 text-xs"
            >
              {option.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-3.5">
      {[
        { label: "收入", colorClass: "bg-[var(--green)]" },
        { label: "支出", colorClass: "bg-[var(--red)]" },
        { label: "结余", colorClass: "bg-[var(--ink)]" },
      ].map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--ink-4)]"
        >
          <span className={`h-2 w-2 rounded-[2px] opacity-70 ${item.colorClass}`} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export function AnalysisPage() {
  const router = useRouter()
  const fmt = useMoney()
  const fmtc = useCurrencyMoney()
  const signed = useSignedMoney()
  const [rangeKey, setRangeKey] = useState<RangeKey>("12m")
  const range = RANGE_OPTIONS.find((option) => option.key === rangeKey) ?? RANGE_OPTIONS[1]
  const trendQuery = useQuery(
    trpc.cashflow.monthlyTrend.queryOptions({
      months: range.months,
    }),
  )
  usePagePerf("analysis", [{ name: "cashflow.monthlyTrend", query: trendQuery }])

  const trend = trendQuery.data ?? []
  const latest = trend[trend.length - 1] ?? null
  const previous = trend[trend.length - 2] ?? null
  const incomeTotal = sum(trend, "income")
  const expenseTotal = sum(trend, "expense")
  const netTotal = sum(trend, "net")
  const positiveMonths = trend.filter((row) => Number(row.net) > 0).length
  const averageNet = trend.length > 0 ? netTotal / trend.length : 0
  const latestNet = Number(latest?.net ?? 0)
  const previousNet = Number(previous?.net ?? 0)
  const latestDelta = latestNet - previousNet
  const bestMonth = useMemo(
    () =>
      trend.reduce<MonthlyCashflowTrendPoint | null>(
        (best, row) => (best == null || Number(row.net) > Number(best.net) ? row : best),
        null,
      ),
    [trend],
  )
  const worstMonth = useMemo(
    () =>
      trend.reduce<MonthlyCashflowTrendPoint | null>(
        (worst, row) => (worst == null || Number(row.net) < Number(worst.net) ? row : worst),
        null,
      ),
    [trend],
  )

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col px-[34px] pt-[30px] pb-[108px]">
          <div className="mb-3">
            <BackButton label="返回" onBack={() => router.history.back()} />
          </div>
          <div className="flex items-start gap-6">
            <div>
              <Kicker className="mb-1.5">现金流分析</Kicker>
              <div className="flex items-baseline gap-3">
                <BigNumber
                  className={`text-[42px] ${latestNet >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}
                >
                  {signed(latestNet)}
                </BigNumber>
                <Dim className="text-[11px]">
                  {latest ? `${monthLabel(latest.month)}结余` : "暂无数据"}
                </Dim>
              </div>
              <div className="flex gap-[30px] mt-3">
                <div>
                  <Dim className="text-[10.5px] block mb-1">收入合计</Dim>
                  <span className="font-['IBM_Plex_Mono'] text-[13px] font-semibold text-[var(--green)]">
                    {fmtc(incomeTotal)}
                  </span>
                </div>
                <div>
                  <Dim className="text-[10.5px] block mb-1">支出合计</Dim>
                  <span className="font-['IBM_Plex_Mono'] text-[13px] font-semibold text-[var(--red)]">
                    {fmtc(expenseTotal)}
                  </span>
                </div>
                <div>
                  <Dim className="text-[10.5px] block mb-1">月均结余</Dim>
                  <span
                    className={`font-['IBM_Plex_Mono'] text-[13px] font-semibold ${averageNet >= 0 ? "text-[var(--ink)]" : "text-[var(--red)]"}`}
                  >
                    {signed(averageNet)}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3.5">
              <Dim className="text-[10.5px]">
                正结余 {positiveMonths}/{trend.length || range.months} 月
                {previous ? ` · 较上月 ${signed(latestDelta)}` : ""}
              </Dim>
              <RangeControl value={rangeKey} onChange={setRangeKey} />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-baseline mb-3">
              <SectionTitle>净结余趋势</SectionTitle>
              <Dim className="text-[10.5px] ml-2">正负柱显示每月收入减支出</Dim>
              <Link
                to="/imports"
                className="ml-auto cursor-pointer text-[11px] text-[var(--accent)] hover:opacity-75 transition-opacity"
              >
                查看流水 →
              </Link>
            </div>
            <MonthlyNetBars data={trend} showAxis height={160} />
          </div>

          <div className="mt-[34px]">
            <div className="flex items-baseline mb-3">
              <SectionTitle>收入 / 支出 / 结余</SectionTitle>
              <Dim className="text-[10.5px] ml-2">按月对比现金流稳定性</Dim>
              <div className="ml-auto">
                <Legend />
              </div>
            </div>
            <MonthlyCashflowCombo data={trend} height={244} />
          </div>

          <div className="mt-[30px] grid grid-cols-3 gap-7 border-t border-[var(--hair-2)] pt-[18px]">
            <div>
              <Dim className="text-[10.5px] block mb-1">最好月份</Dim>
              <div className="font-['IBM_Plex_Mono'] text-[18px] font-semibold text-[var(--green)]">
                {bestMonth
                  ? `${monthLabel(bestMonth.month)} ${signed(Number(bestMonth.net))}`
                  : "—"}
              </div>
            </div>
            <div>
              <Dim className="text-[10.5px] block mb-1">压力月份</Dim>
              <div className="font-['IBM_Plex_Mono'] text-[18px] font-semibold text-[var(--red)]">
                {worstMonth
                  ? `${monthLabel(worstMonth.month)} ${signed(Number(worstMonth.net))}`
                  : "—"}
              </div>
            </div>
            <div>
              <Dim className="text-[10.5px] block mb-1">结余率</Dim>
              <div className="font-['IBM_Plex_Mono'] text-[18px] font-semibold text-[var(--ink)]">
                {incomeTotal > 0 ? `${fmt((netTotal / incomeTotal) * 100, 1)}%` : "—"}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Dock />
    </div>
  )
}
