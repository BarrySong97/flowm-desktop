import * as React from "react"
import { cn } from "../../lib/utils"

type ScrollAreaProps = React.ComponentPropsWithoutRef<"div"> & {
  contentClassName?: string
  viewportClassName?: string
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, className, contentClassName, viewportClassName, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn("flowm-scroll-area min-h-0 overflow-auto overscroll-contain", viewportClassName, className)}
      {...props}
    >
      {contentClassName ? <div className={cn("min-w-full", contentClassName)}>{children}</div> : children}
    </div>
  )
})
