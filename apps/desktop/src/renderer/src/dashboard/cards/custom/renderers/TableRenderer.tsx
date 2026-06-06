import { useTranslation } from "react-i18next"
import { Table } from "@heroui/react"
import type { FlowQueryResult } from "@flowm/api"
import { ScrollArea } from "@flowm/ui"
import { resolveAccountLabel, useAccountLabelMap } from "../accountLabel"
import { columnLabel } from "../columnLabel"

interface Props {
  result: FlowQueryResult
}

export function TableRenderer({ result }: Props) {
  const { t } = useTranslation()
  const labelMap = useAccountLabelMap()
  const numericColumns = new Set(result.columns.filter((column) => isNumericColumn(column, result.rows)))
  return (
    <ScrollArea className="min-h-0 h-full">
      <Table>
        <Table.Content>
          <Table.Header>
            {result.columns.map((column) => (
              <Table.Column
                key={column}
                className={numericColumns.has(column) ? "text-right tabular-nums" : undefined}
              >
                {columnLabel(t, column)}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {result.rows.map((row, index) => (
              <Table.Row key={index}>
                {result.columns.map((column) => {
                  const value = row[column]
                  const isNumeric = numericColumns.has(column)
                  const resolved = resolveAccountLabel(value, labelMap)
                  const display =
                    typeof resolved === "number"
                      ? resolved.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : resolved == null
                        ? "—"
                        : String(resolved)
                  return (
                    <Table.Cell
                      key={column}
                      className={isNumeric ? "text-right font-mono tabular-nums" : undefined}
                    >
                      {display}
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>
    </ScrollArea>
  )
}

function isNumericColumn(column: string, rows: Array<Record<string, unknown>>): boolean {
  if (rows.some((row) => typeof row[column] === "number")) return true
  return /^(amount|value|units|sum_|avg_|min_|max_|count_)/.test(column)
}
