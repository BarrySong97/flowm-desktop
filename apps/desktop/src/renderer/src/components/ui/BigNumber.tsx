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
