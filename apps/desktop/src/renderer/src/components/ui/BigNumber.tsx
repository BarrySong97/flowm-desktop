/**
 * @purpose Render the big number renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import type { CSSProperties, ReactNode } from "react"

interface BigNumberProps { children: ReactNode; style?: CSSProperties; className?: string }

export function BigNumber({ children, style, className = "" }: BigNumberProps) {
  return (
    <div
      className={`font-['IBM_Plex_Mono'] font-semibold tracking-[-0.03em] text-[var(--ink)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
