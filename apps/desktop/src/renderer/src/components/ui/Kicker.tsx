import type { ReactNode } from "react"

interface KickerProps { children: ReactNode; className?: string }

export function Kicker({ children, className = "" }: KickerProps) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-4)] ${className}`}>
      {children}
    </div>
  )
}
