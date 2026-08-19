/**
 * @purpose Render the transaction table renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms; use compact mode only in constrained summary panes.
 */

import { DataTable, DataTableRow, DataTableCell } from "./DataTable"
import { ColorDot } from "./ColorDot"
import { SOURCE_BADGES, categoryColor } from "@/lib/domainDisplay"
import { useMoney } from "@/lib/useMoney"
import { currencySymbol } from "@flowm/shared"

interface TxRow {
  date: string
  description?: string
  counterparty?: string
  flowKind: string
  amount: string | number
  currency?: string
  categoryName?: string
  tag?: string
  source?: string
}

interface Props {
  rows: TxRow[]
  variant?: "full" | "compact"
}

function SourceBadge({ source }: { source?: string }) {
  const sourceName = source || "手动"
  const badge = SOURCE_BADGES[sourceName]
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {badge && (
        <span
          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] text-[9.5px] font-bold text-white"
          style={{ background: badge.bg }}
        >
          {badge.char}
        </span>
      )}
      <span className="text-[11.5px] text-[var(--ink-3)]">{sourceName}</span>
    </span>
  )
}

export function TransactionTable({ rows, variant = "full" }: Props) {
  const fmt = useMoney()
  const compact = variant === "compact"
  return (
    <DataTable
      columns={
        compact
          ? [
              { label: "日期", width: 56 },
              { label: "项目" },
              { label: "类别", width: 72 },
              { label: "金额", width: 96, align: "right" },
            ]
          : [
              { label: "日期", width: 62 },
              { label: "项目" },
              { label: "类别", width: 80 },
              { label: "标签", width: 72 },
              { label: "来源", width: 108 },
              { label: "金额", width: 96, align: "right" },
            ]
      }
    >
      {rows.map((t, i) => {
        const amt = Math.abs(Number(t.amount))
        const isIncome = t.flowKind === "income"
        const isTransfer = t.flowKind === "transfer"
        const color = categoryColor(t.categoryName)
        const symbol = currencySymbol(t.currency ?? "CNY")
        return (
          <DataTableRow key={i}>
            <DataTableCell className="font-['IBM_Plex_Mono'] text-[var(--ink-4)]">
              {t.date.slice(5)}
            </DataTableCell>
            <DataTableCell truncate>{t.counterparty || t.description || "—"}</DataTableCell>
            <DataTableCell>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
                <ColorDot color={color} size={7} />
                {t.categoryName ?? "其他"}
              </span>
            </DataTableCell>
            {!compact && (
              <>
                <DataTableCell>
                  <span className="text-[11px] text-[var(--ink-4)]">
                    {t.tag ? `#${t.tag}` : "—"}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <SourceBadge source={t.source} />
                </DataTableCell>
              </>
            )}
            <DataTableCell
              align="right"
              className={`font-['IBM_Plex_Mono'] ${isIncome ? "text-[var(--green)]" : isTransfer ? "text-[var(--ink-3)]" : "text-[var(--red)]"}`}
            >
              {isIncome ? "+" : isTransfer ? "" : "−"}
              {symbol}
              {fmt(amt, 2)}
            </DataTableCell>
          </DataTableRow>
        )
      })}
    </DataTable>
  )
}
