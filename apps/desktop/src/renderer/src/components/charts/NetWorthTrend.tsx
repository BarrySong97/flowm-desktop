/**
 * @purpose Render the net worth trend finance chart component.
 * @role    Reusable renderer chart used by dashboard or feature pages.
 * @deps    React charting primitives, formatted finance data, and CSS tokens.
 * @gotcha  Charts must preserve the distinction between cashflow, snapshots, and forecasts.
 */

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/format"

interface Props {
  data: number[]
  height?: number
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div style={{
      background: "white",
      border: "1px solid var(--hair-2)",
      borderRadius: 8,
      padding: "5px 10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontSize: 12,
      fontFamily: "'IBM Plex Mono', monospace",
      color: "var(--ink)",
      whiteSpace: "nowrap",
    }}>
      {formatCurrency(v)}
    </div>
  )
}

export function NetWorthTrend({ data, height = 78 }: Props) {
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <div style={{ position: "relative", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} style={{ outline: "none" }}>
          <defs>
            <linearGradient id="nwt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--hair-2)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--accent)"
            strokeWidth={2.2}
            fill="url(#nwt-fill)"
            dot={false}
            activeDot={{ r: 3.5, fill: "var(--accent)", stroke: "none" }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
