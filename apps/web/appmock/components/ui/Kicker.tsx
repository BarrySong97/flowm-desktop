/**
 * @purpose Render the kicker renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import type { ReactNode } from "react"

interface KickerProps {
  children: ReactNode
  className?: string
}

export function Kicker({ children, className = "" }: KickerProps) {
  return (
    <div
      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-4)] ${className}`}
    >
      {children}
    </div>
  )
}
