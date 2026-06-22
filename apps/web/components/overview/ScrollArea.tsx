/**
 * @purpose Scroll container mirroring @flowm/ui's ScrollArea for the app mock.
 * @role    Gives the mocked window its own thin-scrollbar scroll region.
 * @gotcha  Scrollbar styling lives under .flowm-scroll-area in globals.css.
 */

import type { ReactNode } from "react"

export function ScrollArea({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flowm-scroll-area min-h-0 overflow-auto overscroll-contain ${className}`}>
      {children}
    </div>
  )
}
