/**
 * @purpose Shared marketing-site primitives (brand logo + centered container).
 * @role    Low-level building blocks reused across landing sections.
 */

import type { ReactNode } from "react"

type LogoProps = { size?: number; className?: string }

/** Flowm 三层错位标记 */
export function Logo({ size = 26, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <rect width="100" height="100" rx="23" fill="#f4f6f2" />
      <path
        d="M6 23 h52 a6 6 0 0 1 6 6 v0 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 v0 a6 6 0 0 1 6 -6 z"
        fill="#1b9e8e"
        fillOpacity="0.5"
      />
      <path
        d="M42 59 h52 a6 6 0 0 1 6 6 v0 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 v0 a6 6 0 0 1 6 -6 z"
        fill="#c98a2a"
        fillOpacity="0.45"
      />
      <path
        d="M24 41 h52 a6 6 0 0 1 6 6 v0 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 v0 a6 6 0 0 1 6 -6 z"
        fill="#14794a"
      />
    </svg>
  )
}

/** 居中内容容器 */
export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-[22px] ${className}`}>{children}</div>
}
