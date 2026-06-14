/**
 * @purpose Render the data table renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import type { ReactNode } from "react"

interface Column {
  label: string
  width?: number | string
  align?: "left" | "right"
}

interface DataTableProps {
  columns: Column[]
  children: ReactNode
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <table className="w-full text-[12px] border-collapse">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-4)] font-semibold py-1.5 border-b border-[var(--hair)] sticky top-0 bg-white"
              style={{ width: col.width, textAlign: col.align ?? "left" }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

export function DataTableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <tr className={`border-t border-[var(--hair)] hover:bg-[var(--surface-2)] ${className}`}>
      {children}
    </tr>
  )
}

export function DataTableCell({
  children,
  align = "left",
  truncate = false,
  className = "",
}: {
  children: ReactNode
  align?: "left" | "right"
  truncate?: boolean
  className?: string
}) {
  return (
    <td
      className={`py-2 text-[var(--ink-2)] ${truncate ? "max-w-0 truncate" : ""} ${className}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  )
}
