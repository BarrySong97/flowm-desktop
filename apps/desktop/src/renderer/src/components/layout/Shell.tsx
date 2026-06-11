import type { ReactNode } from "react"
import { Dock } from "./Dock"

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-8 pt-7 pb-28">
        {children}
      </div>
      <Dock />
    </div>
  )
}
