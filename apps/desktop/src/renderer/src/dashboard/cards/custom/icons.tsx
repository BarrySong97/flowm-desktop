import type { CardIconProps } from "../../registry"

export function KpiIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="26" height="20" rx="3" />
      <text x="16" y="20" textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fill="currentColor" stroke="none">
        123
      </text>
    </svg>
  )
}

export function BarIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <rect x="5" y="18" width="5" height="10" rx="1" />
      <rect x="13.5" y="10" width="5" height="18" rx="1" />
      <rect x="22" y="14" width="5" height="14" rx="1" />
    </svg>
  )
}

export function LineIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22 L10 14 L15 19 L22 9 L28 14" />
    </svg>
  )
}

export function AreaIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 22 L10 14 L15 19 L22 9 L28 14 L28 26 L4 26 Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M4 22 L10 14 L15 19 L22 9 L28 14" />
    </svg>
  )
}

export function PieIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 5 A11 11 0 0 1 27 16 L16 16 Z" fill="currentColor" />
    </svg>
  )
}

export function DonutIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="5" />
      <path d="M16 5 A11 11 0 0 1 27 16 L21 16 A5 5 0 0 0 16 11 Z" fill="currentColor" />
    </svg>
  )
}

export function TableIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="24" height="20" rx="2" />
      <path d="M4 12 H28 M4 19 H28 M12 6 V26 M20 6 V26" />
    </svg>
  )
}

export function TextIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 8 H17" />
      <path d="M12 8 V24" />
      <path d="M18 14 H25" />
      <path d="M21.5 14 V24" />
    </svg>
  )
}

export function ProgressIcon({ className }: CardIconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="14" width="24" height="6" rx="3" />
      <rect x="4" y="14" width="16" height="6" rx="3" fill="currentColor" />
    </svg>
  )
}
