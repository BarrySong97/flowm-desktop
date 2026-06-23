/**
 * @purpose Shared marketing-site primitives (brand logo + centered container).
 * @role    Low-level building blocks reused across landing sections.
 */

import type { ReactNode } from "react"

type LogoProps = { size?: number; className?: string }

/** Flowm app icon, shared by the marketing header and footer. */
export function Logo({ size = 26, className }: LogoProps) {
  return (
    <img
      src="/app-icon.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
    />
  )
}

/** 居中内容容器 */
export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-[22px] ${className}`}>{children}</div>
}
