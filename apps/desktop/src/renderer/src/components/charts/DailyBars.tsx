import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/format"

interface Props {
  data: number[]
  todayIndex?: number
  height?: number
}

function ChartTooltip({ active, payload, lastIdx }: { active?: boolean; payload?: { value: number; payload: { i: number } }[]; lastIdx: number }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const i = payload[0].payload.i
  const dayLabel = i === lastIdx ? "今天" : `${lastIdx - i} 天前`
  return (
    <div style={{
      background: "white",
      border: "1px solid var(--hair-2)",
      borderRadius: 8,
      padding: "5px 10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontSize: 12,
      color: "var(--ink)",
      whiteSpace: "nowrap",
    }}>
      <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginBottom: 2 }}>{dayLabel}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
        {formatCurrency(v)}
      </div>
    </div>
  )
}

export function DailyBars({ data, todayIndex, height = 56 }: Props) {
  const lastIdx = todayIndex ?? data.length - 1
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <div style={{ position: "relative", outline: "none" }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={2} style={{ outline: "none" }} tabIndex={-1}>
          <Tooltip
            content={<ChartTooltip lastIdx={lastIdx} />}
            cursor={{ fill: "var(--hair-3)", radius: 2 }}
          />
          <Bar dataKey="v" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={600}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill="var(--red)"
                fillOpacity={i === lastIdx ? 1 : 0.35 + (i / data.length) * 0.45}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: "var(--hair)" }} />
    </div>
  )
}
