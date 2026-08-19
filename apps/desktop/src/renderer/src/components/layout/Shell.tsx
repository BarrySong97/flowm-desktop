/**
 * @purpose Render the shell layout component for the desktop shell.
 * @role    Reusable scroll shell for feature pages beneath the root navigation.
 * @deps    React, route state, platform metadata, and local UI primitives.
 * @gotcha  The root route owns navigation; feature pages should not add another copy.
 */

import type { ReactNode } from "react"
import { ScrollArea } from "../ui/ScrollArea"

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col px-8 py-7">{children}</div>
      </ScrollArea>
    </div>
  )
}
