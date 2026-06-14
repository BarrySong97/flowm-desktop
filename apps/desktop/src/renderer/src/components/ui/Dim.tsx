/**
 * @purpose Render the dim renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import type { CSSProperties, ReactNode } from "react"

interface DimProps { children: ReactNode; className?: string; style?: CSSProperties }

export function Dim({ children, className = "", style }: DimProps) {
  return (
    <span className={`text-[var(--ink-4)] ${className}`} style={style}>
      {children}
    </span>
  )
}
