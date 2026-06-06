import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Area,
  AreaChart,
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
  smooth?: boolean
}

export function AreaRenderer({ result, xColumn, yColumns, seriesColumn, valueColumn, smooth }: Props) {
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
      {({ width, height }) => (
        <AreaChart width={width} height={height} data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <defs>
            {yKeys.map((key, idx) => {
              const color = CHART_PALETTE[idx % CHART_PALETTE.length]
              return (
                <linearGradient key={key} id={`area-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          {yKeys.length > 1 && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="circle" iconSize={8} />}
          {yKeys.map((key, idx) => {
            const color = CHART_PALETTE[idx % CHART_PALETTE.length]
            return (
              <Area
                key={key}
                type={smooth ?? true ? "monotone" : "linear"}
                dataKey={key}
                name={String(resolveAccountLabel(key, labelMap) ?? columnLabel(t, key))}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#area-grad-${idx})`}
                isAnimationActive={false}
              />
            )
          })}
        </AreaChart>
      )}
    </SafeChartContainer>
  )
}
