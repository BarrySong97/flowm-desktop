import type { ReactNode } from "react"

interface SectionTitleProps { children: ReactNode; className?: string }

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <span className={`text-[12.5px] font-semibold text-[var(--ink)] ${className}`}>
      {children}
    </span>
  )
}
