/**
 * @purpose Render the shell layout component for the desktop shell.
 * @role    Reusable renderer shell/navigation building block.
 * @deps    React, route state, platform metadata, and local UI primitives.
 * @gotcha  Keep layout concerns separate from product data mutations.
 */

import type { ReactNode } from "react"
import { Dock } from "./Dock"
import { ScrollArea } from "../ui/ScrollArea"

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col px-8 pt-7 pb-28">
          {children}
        </div>
      </ScrollArea>
      <Dock />
    </div>
  )
}
