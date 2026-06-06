import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FlowQueryResult } from "@flowm/api"
import { resolveAccountLabel, useAccountLabelMap } from "../accountLabel"
import { columnLabel } from "../columnLabel"
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

function chooseXColumn(columns: string[], rows: FlowQueryResult["rows"], configured: string | undefined, yKeys: string[]) {
  if (configured && columns.includes(configured) && !yKeys.includes(configured)) return configured
  const candidates = columns.filter((column) => !yKeys.includes(column))
  const mostlyText = candidates.find(
    (column) => numericProfile(rows, column).finite < Math.max(1, rows.length / 2),
  )
  return mostlyText ?? candidates[0] ?? columns[0]
}

function chooseYColumns(
  columns: string[],
  rows: FlowQueryResult["rows"],
  configured: string[] | undefined,
  xKey: string | undefined,
) {
  const configuredKeys = configured?.filter((column) => columns.includes(column) && column !== xKey) ?? []
  if (configuredKeys.length > 0) return configuredKeys

  const numericKeys = columns
    .filter((column) => column !== xKey)
    .map((column) => ({ column, ...numericProfile(rows, column) }))
    .filter((item) => item.finite > 0)
    .sort(
      (a, b) =>
        b.nonZero - a.nonZero ||
        b.absTotal - a.absTotal ||
        columns.indexOf(a.column) - columns.indexOf(b.column),
    )
    .map((item) => item.column)

  return numericKeys.length > 0 ? numericKeys : columns.filter((column) => column !== xKey)
}

export function LineRenderer({ result, xColumn, yColumns, seriesColumn, valueColumn, smooth }: Props) {
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
        <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          {yKeys.length > 1 && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="line" iconSize={10} />}
          {yKeys.map((key, idx) => (
            <Line
              key={key}
              type={smooth ?? true ? "monotone" : "linear"}
              dataKey={key}
              name={String(resolveAccountLabel(key, labelMap) ?? columnLabel(t, key))}
              stroke={CHART_PALETTE[idx % CHART_PALETTE.length]}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      )}
    </SafeChartContainer>
  )
}

export function buildSeries(
  result: FlowQueryResult,
  xColumn: string | undefined,
  yColumns: string[] | undefined,
  seriesColumn?: string,
  valueColumn?: string,
) {
  const cols = result.columns
  if (cols.length === 0) return { data: [] as Record<string, unknown>[], xKey: "", yKeys: [] as string[] }
  if (seriesColumn != null && cols.includes(seriesColumn)) {
    const configuredValue =
      valueColumn != null && cols.includes(valueColumn) && valueColumn !== seriesColumn ? valueColumn : undefined
    const xKey = chooseXColumn(cols, result.rows, xColumn, [seriesColumn, configuredValue ?? ""])
    const valueKey = configuredValue ?? chooseYColumns(cols, result.rows, undefined, xKey)
      .find((column) => column !== seriesColumn) ?? cols.find((column) => column !== xKey && column !== seriesColumn) ?? cols[0]
    const dataByX = new Map<string, Record<string, unknown>>()
    const yKeys: string[] = []
    const seenY = new Set<string>()
    for (const row of result.rows) {
      const xValue = String(row[xKey] ?? "")
      const seriesValue = String(row[seriesColumn] ?? "")
      if (seriesValue.length === 0) continue
      if (!seenY.has(seriesValue)) {
        seenY.add(seriesValue)
        yKeys.push(seriesValue)
      }
      const point = dataByX.get(xValue) ?? { [xKey]: xValue }
      const current = toFiniteNumber(point[seriesValue]) ?? 0
      point[seriesValue] = current + (toFiniteNumber(row[valueKey]) ?? 0)
      dataByX.set(xValue, point)
    }
    return { data: [...dataByX.values()], xKey, yKeys }
  }
  const firstPassYKeys = chooseYColumns(cols, result.rows, yColumns, xColumn)
  const xKey = chooseXColumn(cols, result.rows, xColumn, firstPassYKeys)
  const yKeys = chooseYColumns(cols, result.rows, yColumns, xKey)
  const data = result.rows.map((row) => {
    const point: Record<string, unknown> = { [xKey]: String(row[xKey] ?? "") }
    for (const key of yKeys) {
      const num = toFiniteNumber(row[key]) ?? 0
      point[key] = Number.isFinite(num) ? num : 0
    }
    return point
  })
  return { data, xKey, yKeys }
}
