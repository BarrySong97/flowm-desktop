/**
 * @purpose Render the transaction table renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import { DataTable, DataTableRow, DataTableCell } from "./DataTable"
import { ColorDot } from "./ColorDot"
import { categoryColor } from "@/lib/domainDisplay"
import { useMoney } from "@/lib/useMoney"

interface TxRow {
  date: string
  description?: string
  counterparty?: string
  flowKind: string
  amount: string | number
  categoryName?: string
}

interface Props {
  rows: TxRow[]
}

export function TransactionTable({ rows }: Props) {
  const fmt = useMoney()
  return (
    <DataTable
      columns={[
        { label: "日期", width: 56 },
        { label: "项目" },
        { label: "类别" },
        { label: "金额", align: "right" },
      ]}
    >
      {rows.map((t, i) => {
        const amt = Math.abs(Number(t.amount))
        const isIncome = t.flowKind === "income"
        const color = categoryColor(t.categoryName)
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
            <DataTableCell
              align="right"
              className={`font-['IBM_Plex_Mono'] ${isIncome ? "text-[var(--green)]" : "text-[var(--red)]"}`}
            >
              {isIncome ? "+" : "−"}¥{fmt(amt, 2)}
            </DataTableCell>
          </DataTableRow>
        )
      })}
    </DataTable>
  )
}
