import type { CSSProperties, ReactNode } from "react"

interface DimProps { children: ReactNode; className?: string; style?: CSSProperties }

export function Dim({ children, className = "", style }: DimProps) {
  return (
    <span className={`text-[var(--ink-4)] ${className}`} style={style}>
      {children}
    </span>
  )
}
