import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FlowQueryResult } from "@flowm/api"
import { resolveAccountLabel, useAccountLabelMap } from "../accountLabel"
import { columnLabel } from "../columnLabel"
import { buildSeries } from "./LineRenderer"
import { SafeChartContainer } from "./SafeChartContainer"
import { routeLoopLog } from "../../../../lib/debug/routeLoop"
import {
  AXIS_TICK,
  CHART_PALETTE,
  GRID_STROKE,
  LEGEND_WRAPPER_STYLE,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_LABEL_STYLE,
} from "./theme"

interface Props {
  result: FlowQueryResult
  xColumn?: string
  yColumns?: string[]
  seriesColumn?: string
  valueColumn?: string
  stacked?: boolean
}

export function BarRenderer({ result, xColumn, yColumns, seriesColumn, valueColumn, stacked }: Props) {
  const { t } = useTranslation()
  const labelMap = useAccountLabelMap()
  const { data, xKey, yKeys } = useMemo(() => {
    const raw = buildSeries(result, xColumn, yColumns, seriesColumn, valueColumn)
    const translated = raw.data.map((point) => {
      const xValue = point[raw.xKey]
      return { ...point, [raw.xKey]: resolveAccountLabel(xValue, labelMap) }
    })
    return { ...raw, data: translated }
  }, [result, xColumn, yColumns, seriesColumn, valueColumn, labelMap])
  if (data.length === 0 || yKeys.length === 0) {
    return <div className="px-3 py-3 text-[11px] text-[var(--term-ink-3)]">—</div>
  }
  return (
    <SafeChartContainer>
      {({ width, height }) => {
        routeLoopLog("BarRenderer.renderChart", {
          width,
          height,
          rows: data.length,
          xKey,
          yKeys,
          first: data[0],
        })
        return (
          <BarChart width={width} height={height} data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: "var(--term-accent-soft)", opacity: 0.4 }}
            />
            {yKeys.length > 1 && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="square" iconSize={8} />}
            {yKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                name={String(resolveAccountLabel(key, labelMap) ?? columnLabel(t, key))}
                fill={CHART_PALETTE[idx % CHART_PALETTE.length]}
                stackId={stacked ? "stack" : undefined}
                maxBarSize={24}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        )
      }}
    </SafeChartContainer>
  )
}
