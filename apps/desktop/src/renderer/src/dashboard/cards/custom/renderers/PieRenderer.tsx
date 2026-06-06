import { useMemo } from "react"
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts"
import type { FlowQueryResult } from "@flowm/api"
import { resolveAccountLabel, useAccountLabelMap } from "../accountLabel"
import { SafeChartContainer } from "./SafeChartContainer"
import { routeLoopLog } from "../../../../lib/debug/routeLoop"
import {
  CHART_PALETTE,
  LEGEND_WRAPPER_STYLE,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_LABEL_STYLE,
} from "./theme"

interface Props {
  result: FlowQueryResult
  labelColumn?: string
  valueColumn?: string
  donut?: boolean
}

type PiePoint = { name: string; value: number }

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.length === 0) return null
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function numericProfile(rows: FlowQueryResult["rows"], column: string) {
  let finite = 0
  let nonZero = 0
  let absTotal = 0
  for (const row of rows) {
    const value = toFiniteNumber(row[column])
    if (value == null) continue
    finite += 1
    if (value !== 0) nonZero += 1
    absTotal += Math.abs(value)
  }
  return { finite, nonZero, absTotal }
}

function chooseValueColumn(
  columns: string[],
  rows: FlowQueryResult["rows"],
  configured: string | undefined,
  labelCandidate: string | undefined,
) {
  if (configured && columns.includes(configured)) return configured
  const candidates = columns
    .filter((column) => column !== labelCandidate)
    .map((column) => ({ column, ...numericProfile(rows, column) }))
    .filter((item) => item.finite > 0)
    .sort(
      (a, b) =>
        b.nonZero - a.nonZero ||
        b.absTotal - a.absTotal ||
        columns.indexOf(a.column) - columns.indexOf(b.column),
    )
  return candidates[0]?.column ?? columns.find((column) => column !== labelCandidate) ?? columns[0]
}

function chooseLabelColumn(
  columns: string[],
  rows: FlowQueryResult["rows"],
  configured: string | undefined,
  valueColumn: string,
) {
  if (configured && columns.includes(configured) && configured !== valueColumn) return configured
  const candidates = columns.filter((column) => column !== valueColumn)
  const mostlyText = candidates.find(
    (column) => numericProfile(rows, column).finite < Math.max(1, rows.length / 2),
  )
  return mostlyText ?? candidates[0] ?? valueColumn
}

export function PieRenderer({ result, labelColumn, valueColumn, donut }: Props) {
  const labelMap = useAccountLabelMap()
  const chart = useMemo(() => {
    const cols = result.columns
    if (cols.length === 0) return { data: [] as PiePoint[], labelKey: undefined, valueKey: undefined, total: 0 }
    const configuredLabel = labelColumn && cols.includes(labelColumn) ? labelColumn : undefined
    const valueKey = chooseValueColumn(cols, result.rows, valueColumn, configuredLabel)
    const labelKey = chooseLabelColumn(cols, result.rows, labelColumn, valueKey)
    const data = result.rows.map((row) => {
      const rawName = row[labelKey]
      const resolved = resolveAccountLabel(rawName, labelMap)
      const name = String(resolved ?? "")
      const num = toFiniteNumber(row[valueKey]) ?? 0
      return { name, value: Number.isFinite(num) ? Math.abs(num) : 0 }
    })
    return {
      data,
      labelKey,
      valueKey,
      total: data.reduce((sum, item) => sum + item.value, 0),
    }
  }, [result, labelColumn, valueColumn, labelMap])

  if (chart.data.length === 0) {
    return <div className="px-3 py-3 text-[11px] text-[var(--term-ink-3)]">—</div>
  }
  return (
    <SafeChartContainer>
      {({ width, height }) => {
        routeLoopLog("PieRenderer.renderChart", {
          width,
          height,
          rows: chart.data.length,
          labelKey: chart.labelKey,
          valueKey: chart.valueKey,
          total: chart.total,
          first: chart.data[0],
        })
        return (
          <PieChart width={width} height={height}>
            <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="circle" iconSize={8} verticalAlign="bottom" />
            <Pie
              data={chart.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius="70%"
              innerRadius={donut ? "45%" : 0}
              paddingAngle={1}
              stroke="var(--term-panel)"
              strokeWidth={1}
              isAnimationActive={false}
            >
              {chart.data.map((_, idx) => (
                <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        )
      }}
    </SafeChartContainer>
  )
}
