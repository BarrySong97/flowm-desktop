/**
 * @purpose Render the section title renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import type { ReactNode } from "react"

interface SectionTitleProps {
  children: ReactNode
  className?: string
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <span className={`text-[12.5px] font-semibold text-[var(--ink)] ${className}`}>{children}</span>
  )
}
