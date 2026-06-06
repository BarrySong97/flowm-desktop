import { useTranslation } from "react-i18next"
import type { FlowQueryResult } from "@flowm/api"
import { money } from "../../../../components/terminal/format"
import { columnLabel } from "../columnLabel"
import type { CustomKpiFormat } from "../types"

interface Props {
  result: FlowQueryResult
  valueColumn?: string
  format?: CustomKpiFormat
}

function formatValue(value: unknown, format?: CustomKpiFormat): string {
  if (value == null) return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return String(value)
  const decimals = format?.decimals ?? (format?.kind === "currency" ? 2 : 0)
  switch (format?.kind) {
    case "currency":
      return money(num.toFixed(decimals))
    case "percent":
      return `${num.toFixed(decimals)}%`
    case "number":
    default:
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
  }
}

export function KpiRenderer({ result, valueColumn, format }: Props) {
  const { t } = useTranslation()
  const column = valueColumn && result.columns.includes(valueColumn) ? valueColumn : result.columns[0]
  const value = result.rows[0]?.[column]
  return (
    <div className="flex h-full flex-col items-start justify-center gap-1 px-4 py-3">
      <div className="text-[10px] tracking-[0.04em] text-[var(--term-ink-3)]">{columnLabel(t, column)}</div>
      <div className="font-mono text-[28px] font-semibold tracking-[-0.01em] text-[var(--term-ink-1)]">
        {formatValue(value, format)}
      </div>
    </div>
  )
}
