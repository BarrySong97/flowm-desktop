/**
 * @purpose Render the kbd renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 select-none items-center justify-center rounded-[3px] border border-[var(--term-border)] bg-[var(--term-panel-alt)] px-1 font-mono text-[10px] font-medium text-[var(--term-ink-3)]",
        className,
      )}
      {...props}
    />
  )
}

export function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("inline-flex items-center gap-1", className)} {...props} />
}
