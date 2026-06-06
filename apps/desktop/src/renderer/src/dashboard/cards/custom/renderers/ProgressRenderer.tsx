import { useTranslation } from "react-i18next"
import type { FlowQueryResult } from "@flowm/api"
import { money } from "../../../../components/terminal/format"
import { columnLabel } from "../columnLabel"
import type { CustomKpiFormat } from "../types"

interface Props {
  result: FlowQueryResult
  valueColumn?: string
  target?: number
  format?: CustomKpiFormat
}

function formatValue(value: number, format?: CustomKpiFormat): string {
  const decimals = format?.decimals ?? 0
  switch (format?.kind) {
    case "currency":
      return money(value.toFixed(decimals))
    case "percent":
      return `${value.toFixed(decimals)}%`
    case "number":
    default:
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
  }
}

export function ProgressRenderer({ result, valueColumn, target, format }: Props) {
  const { t } = useTranslation()
  const column = valueColumn && result.columns.includes(valueColumn) ? valueColumn : result.columns[0]
  const raw = result.rows[0]?.[column]
  const current = typeof raw === "number" ? raw : Number(raw ?? 0)
  const safeCurrent = Number.isFinite(current) ? current : 0
  const safeTarget = target != null && Number.isFinite(target) && target !== 0 ? target : 0
  const percent = safeTarget === 0 ? 0 : Math.max(0, Math.min(100, (safeCurrent / safeTarget) * 100))
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 py-3">
      <div className="flex items-baseline justify-between text-[11px] text-[var(--term-ink-3)]">
        <span>{columnLabel(t, column)}</span>
        <span className="font-mono text-[var(--term-ink-2)]">
          {safeTarget === 0 ? "—" : `${percent.toFixed(0)}%`}
        </span>
      </div>
      <div className="font-mono text-[22px] font-semibold tracking-[-0.01em] text-[var(--term-ink-1)]">
        {formatValue(safeCurrent, format)}
        {safeTarget !== 0 && (
          <span className="ml-1 text-[12px] font-normal text-[var(--term-ink-3)]">
            / {formatValue(safeTarget, format)}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--term-bg)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--term-accent)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
