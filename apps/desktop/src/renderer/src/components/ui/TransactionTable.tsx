import { DataTable, DataTableRow, DataTableCell } from "./DataTable"
import { ColorDot } from "./ColorDot"

export const CAT_COLOR: Record<string, string> = {
  餐饮: "#e07b3a", 交通: "#4a8fc4", 购物: "#c46a9e",
  订阅: "#7c6ac4", 娱乐: "#d4a017", 居住: "#5bac8e",
  理财: "#2e86ab", 收入: "#14794a", 其他: "#9caca3", 转账: "#6b7d72",
}

export function categoryColor(name?: string): string {
  return name ? (CAT_COLOR[name] ?? "#9caca3") : "#9caca3"
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

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
            <DataTableCell truncate>
              {t.counterparty || t.description || "—"}
            </DataTableCell>
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
