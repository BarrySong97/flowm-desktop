import type { ReactNode } from "react"

interface StatBlockProps {
  label: string
  value: ReactNode
  className?: string
}

export function StatBlock({ label, value, className = "" }: StatBlockProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="text-[11px] text-[var(--ink-3)]">{label}</div>
      <div className="text-sm font-medium text-[var(--ink)]">{value}</div>
    </div>
  )
}
