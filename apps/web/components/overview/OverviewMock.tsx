/**
 * @purpose Static reproduction of the desktop Overview page for the hero window.
 * @role    Marketing mock that mirrors the real app's layout, styles, and atoms.
 * @deps    Overview atoms + lib/format; charts/table are lightweight static SVG/markup.
 * @gotcha  Numbers are illustrative mock data, not live tRPC queries.
 */

import { fmt } from "@/lib/format"
import {
  BigNumber,
  BudgetBar,
  ColorDot,
  Dim,
  Kicker,
  SectionTitle,
  StatBlock,
  UpcomingRow,
} from "./atoms"

const TREND = [2.31, 2.36, 2.34, 2.41, 2.45, 2.5, 2.52, 2.58, 2.61, 2.64, 2.67, 2.684]

// 30 daily expense bars (illustrative).
const DAILY = [
  120, 0, 340, 86, 52, 1299, 0, 210, 45, 860, 33, 520, 98, 0, 186, 402, 75, 640, 0, 55, 2553, 39,
  98, 0, 1299, 52, 989, 238, 34, 260,
]

const BUDGETS = [
  { label: "餐饮", color: "#e07b3a", spent: 2684, limit: 4000 },
  { label: "购物", color: "#c46a9e", spent: 3140, limit: 3000 },
  { label: "交通", color: "#4a8fc4", spent: 1260, limit: 1800 },
  { label: "居住", color: "#5bac8e", spent: 8200, limit: 10000 },
]

const UPCOMING = [
  { date: "06-06", color: "#7c6ac4", name: "爱奇艺", kind: "订阅", amt: 25 },
  { date: "06-12", color: "#ad7c2c", name: "招商银行 房贷", kind: "贷款", amt: 9850 },
  { date: "06-18", color: "#7c6ac4", name: "网易云音乐", kind: "订阅", amt: 168 },
]

const TX = [
  { d: "06-18", name: "网易云音乐", cat: "订阅", color: "#7c6ac4", income: false, amt: 168 },
  { d: "06-17", name: "美团外卖", cat: "餐饮", color: "#e07b3a", income: false, amt: 56 },
  { d: "06-16", name: "工资", cat: "收入", color: "#14794a", income: true, amt: 28600 },
  { d: "06-15", name: "滴滴出行", cat: "交通", color: "#4a8fc4", income: false, amt: 34 },
  { d: "06-14", name: "京东", cat: "购物", color: "#c46a9e", income: false, amt: 1299 },
]

/** Net-worth area trend (matches NetWorthTrend's accent area look). */
function MiniTrend() {
  const min = Math.min(...TREND)
  const max = Math.max(...TREND)
  const pts = TREND.map((v, i) => {
    const x = (i / (TREND.length - 1)) * 200
    const y = 74 - ((v - min) / (max - min || 1)) * 66
    return [x, y] as const
  })
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L200 78 L0 78 Z`
  return (
    <svg width="100%" height="78" viewBox="0 0 200 78" preserveAspectRatio="none">
      <defs>
        <linearGradient id="nwt-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#nwt-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Daily expense bars (matches DailyBars: red bars, last one full opacity, baseline). */
function MiniDailyBars() {
  const max = Math.max(...DAILY)
  const last = DAILY.length - 1
  return (
    <div className="relative">
      <div className="flex h-14 items-end gap-[2px]">
        {DAILY.map((v, i) => (
          <i
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              height: `${Math.max((v / max) * 100, 3)}%`,
              background: "var(--red)",
              opacity: i === last ? 1 : 0.35 + (i / DAILY.length) * 0.45,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--hair)]" />
    </div>
  )
}

function MiniTransactionTable() {
  return (
    <table className="w-full text-[12px] border-collapse">
      <thead>
        <tr>
          {[
            ["日期", "left", "56px"],
            ["项目", "left", undefined],
            ["类别", "left", undefined],
            ["金额", "right", undefined],
          ].map(([label, align, width]) => (
            <th
              key={label}
              className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-4)] font-semibold py-1.5 border-b border-[var(--hair)] bg-white"
              style={{ width, textAlign: align as "left" | "right" }}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TX.map((t, i) => (
          <tr key={i} className="border-t border-[var(--hair)]">
            <td className="py-2 font-['IBM_Plex_Mono'] text-[var(--ink-4)]">{t.d}</td>
            <td className="py-2 text-[var(--ink-2)] max-w-0 truncate">{t.name}</td>
            <td className="py-2">
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
                <ColorDot color={t.color} size={7} />
                {t.cat}
              </span>
            </td>
            <td
              className={`py-2 text-right font-['IBM_Plex_Mono'] ${t.income ? "text-[var(--green)]" : "text-[var(--red)]"}`}
            >
              {t.income ? "+" : "−"}¥{fmt(t.amt, 2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function OverviewMock() {
  const scaleMax = Math.max(...BUDGETS.map((b) => Math.max(b.spent, b.limit)), 1)
  const budgetTotal = BUDGETS.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = BUDGETS.reduce((s, b) => s + b.spent, 0)
  const budgetRemain = budgetTotal - budgetSpent
  const upSum = UPCOMING.reduce((s, u) => s + u.amt, 0)

  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      {/* ── 净资产 + 趋势 ── */}
      <div className="flex items-stretch gap-9 pb-[18px]">
        <div>
          <Kicker className="mb-1.5">净资产</Kicker>
          <BigNumber className="text-[44px] leading-none">
            <span className="text-[19px] font-medium text-[var(--ink-3)] mr-1.5">¥</span>
            2,684,431
          </BigNumber>
          <div className="flex gap-[30px] mt-3">
            <StatBlock label="流动资产" value="¥326,210" />
            <StatBlock label="总资产" value="¥4,504,431" />
            <StatBlock label="欠款" value="¥1,820,000" />
          </div>
        </div>
        <div className="ml-auto flex flex-col w-1/2 text-right">
          <Dim className="text-[11.5px] mb-2 block">
            近 12 个月{" "}
            <span className="font-['IBM_Plex_Mono'] text-[var(--green)] ml-1">+¥214,800</span>
          </Dim>
          <div className="mt-auto">
            <MiniTrend />
          </div>
        </div>
      </div>

      {/* ── 本月结余 + 日柱 ── */}
      <div className="mt-[22px] pb-6">
        <div className="flex items-start mb-3">
          <div>
            <Kicker className="mb-1.5">本月结余 · 6月</Kicker>
            <BigNumber className="text-[26px] text-[var(--green)]">+¥8,692</BigNumber>
          </div>
          <Dim className="text-[10.5px] ml-auto pt-[1px]">
            本月 · 消费 <span className="font-['IBM_Plex_Mono'] text-[var(--red)]">−¥19,908</span>
            {" · "}收入 <span className="font-['IBM_Plex_Mono'] text-[var(--green)]">+¥28,600</span>
          </Dim>
        </div>
        <MiniDailyBars />
        <div className="flex justify-between mt-1.5">
          <Dim className="text-[10px]">月初</Dim>
          <span className="text-[10px] font-semibold text-[var(--accent)]">今天</span>
        </div>
      </div>

      {/* ── 两列：预算 + 即将扣费 ── */}
      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-[40px] mt-[22px]">
        <div className="overflow-hidden">
          <div className="flex items-baseline mb-[15px]">
            <SectionTitle>消费 · 本月预算</SectionTitle>
            <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
              还能花{" "}
              <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">
                ¥{fmt(budgetRemain)}
              </b>
              {" · "}已用 {Math.round((budgetSpent / budgetTotal) * 100)}%
            </Dim>
          </div>
          <div className="flex flex-col gap-[11px]">
            {BUDGETS.map((b, i) => (
              <BudgetBar key={i} {...b} scaleMax={scaleMax} />
            ))}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex items-baseline mb-[14px]">
            <SectionTitle>即将扣费</SectionTitle>
            <Dim className="text-[10.5px] ml-auto whitespace-nowrap">
              未来 30 天 · {UPCOMING.length} 笔
            </Dim>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-['IBM_Plex_Mono'] text-[22px] font-semibold text-[var(--ink)]">
              ¥{fmt(upSum)}
            </span>
            <Dim className="text-[11px] ml-auto whitespace-nowrap">
              月固定支出{" "}
              <b className="font-['IBM_Plex_Mono'] text-[var(--ink)] font-semibold">¥10,018</b>
            </Dim>
          </div>
          <div>
            {UPCOMING.map((u, i) => (
              <UpcomingRow
                key={i}
                date={u.date}
                color={u.color}
                name={u.name}
                kind={u.kind}
                amount={`¥${fmt(u.amt)}`}
              />
            ))}
          </div>
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
          <Dim className="text-[11px] ml-2">最近 {TX.length} 笔</Dim>
        </div>
        <MiniTransactionTable />
      </div>
    </div>
  )
}
