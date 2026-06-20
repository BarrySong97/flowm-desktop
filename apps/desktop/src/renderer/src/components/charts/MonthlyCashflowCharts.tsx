/**
 * @purpose Render monthly cashflow trend charts for overview and analysis.
 * @role    Reusable renderer chart components for income, expense, and net cashflow.
 * @deps    Recharts, renderer format utilities, and Flowm CSS tokens.
 * @gotcha  Charts summarize past cashflow only; they must not imply asset reconciliation.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useCurrencyMoney } from "@/lib/useMoney"

export interface MonthlyCashflowTrendPoint {
  month: string
  income: string
  expense: string
  net: string
  currency: string
}

interface ChartRow {
  month: string
  label: string
  income: number
  expense: number
  net: number
}

function rowsFromTrend(data: MonthlyCashflowTrendPoint[]): ChartRow[] {
  return data.map((row) => ({
    month: row.month,
    label: `${Number(row.month.slice(5, 7))}月`,
    income: Number(row.income || 0),
    expense: Number(row.expense || 0),
    net: Number(row.net || 0),
  }))
}

function monthFromClickData(data: unknown): string | null {
  const payload = (data as { payload?: Partial<ChartRow> } | null)?.payload
  return typeof payload?.month === "string" ? payload.month : null
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: string; value: number; payload: ChartRow }>
  label?: string
}) {
  const fmtc = useCurrencyMoney()
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const values = [
    { key: "income", label: "收入", value: row.income, colorClass: "text-[var(--green)]" },
    { key: "expense", label: "支出", value: row.expense, colorClass: "text-[var(--red)]" },
    {
      key: "net",
      label: "结余",
      value: row.net,
      colorClass: row.net >= 0 ? "text-[var(--green)]" : "text-[var(--red)]",
    },
  ]
  return (
    <div className="whitespace-nowrap rounded-lg border border-[var(--hair-2)] bg-white px-2.5 py-[7px] text-[var(--ink)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="mb-1.5 text-[10.5px] text-[var(--ink-4)]">
        {label ?? row.label} · {row.month}
      </div>
      <div className="grid gap-1">
        {values.map((item) => (
          <div
            key={item.key}
            className="grid grid-cols-[34px_1fr] items-baseline gap-2 text-[11.5px]"
          >
            <span className="text-[var(--ink-4)]">{item.label}</span>
            <span className={`text-right font-['IBM_Plex_Mono'] font-semibold ${item.colorClass}`}>
              {item.key === "net" && item.value >= 0 ? "+" : item.value < 0 ? "−" : ""}
              {fmtc(Math.abs(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthlyNetBars({
  data,
  height = 86,
  showAxis = false,
  onMonthClick,
}: {
  data: MonthlyCashflowTrendPoint[]
  height?: number
  showAxis?: boolean
  onMonthClick?: (month: string) => void
}) {
  const rows = rowsFromTrend(data)
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 6, right: 0, bottom: showAxis ? 16 : 0, left: 0 }}>
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--hair-3)", radius: 2 }} />
          <ReferenceLine y={0} stroke="var(--hair)" strokeWidth={1} />
          {showAxis && (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--ink-4)" }}
              interval="preserveStartEnd"
            />
          )}
          <YAxis hide domain={["auto", "auto"]} />
          <Bar
            dataKey="net"
            radius={[2, 2, 2, 2]}
            isAnimationActive
            animationDuration={650}
            onClick={(data) => {
              const month = monthFromClickData(data)
              if (month) onMonthClick?.(month)
            }}
            className={onMonthClick ? "cursor-pointer" : "cursor-default"}
          >
            {rows.map((row) => (
              <Cell
                key={row.month}
                fill={row.net >= 0 ? "var(--green)" : "var(--red)"}
                fillOpacity={Math.abs(row.net) > 0 ? 0.72 : 0.18}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyCashflowCombo({
  data,
  height = 230,
  onMonthClick,
}: {
  data: MonthlyCashflowTrendPoint[]
  height?: number
  onMonthClick?: (month: string) => void
}) {
  const rows = rowsFromTrend(data)
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={rows}
          margin={{ top: 10, right: 6, bottom: 0, left: 0 }}
          barCategoryGap={10}
        >
          <CartesianGrid stroke="var(--hair-3)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10.5, fill: "var(--ink-4)" }}
          />
          <YAxis hide />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--hair-3)", radius: 2 }} />
          <Bar
            dataKey="income"
            fill="var(--green)"
            fillOpacity={0.36}
            radius={[2, 2, 0, 0]}
            onClick={(data) => {
              const month = monthFromClickData(data)
              if (month) onMonthClick?.(month)
            }}
            className={onMonthClick ? "cursor-pointer" : "cursor-default"}
          />
          <Bar
            dataKey="expense"
            fill="var(--red)"
            fillOpacity={0.32}
            radius={[2, 2, 0, 0]}
            onClick={(data) => {
              const month = monthFromClickData(data)
              if (month) onMonthClick?.(month)
            }}
            className={onMonthClick ? "cursor-pointer" : "cursor-default"}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--ink)"
            strokeWidth={2}
            dot={{ r: 2.4, fill: "white", stroke: "var(--ink)", strokeWidth: 1.4 }}
            activeDot={{ r: 3.5, fill: "var(--ink)", stroke: "white", strokeWidth: 1.4 }}
            isAnimationActive
            animationDuration={700}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
