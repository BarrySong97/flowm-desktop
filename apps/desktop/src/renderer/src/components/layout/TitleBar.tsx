/**
 * @purpose Own the outermost desktop shell and its stable native window drag band.
 * @role    Root DOM boundary that keeps macOS traffic lights above the route UI.
 * @deps    React children and shared drag-region CSS utilities.
 * @gotcha  Do not put a no-drag region around the route tree: app-region cannot be reliably
 *          restored by a draggable descendant. Mark only concrete interactive controls no-drag.
 */

import type { ReactNode } from "react"

interface TitleBarProps {
  children: ReactNode
}

export function TitleBar({ children }: TitleBarProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg)]">
      <div
        data-tauri-drag-region
        data-window-drag-handle
        className="drag-region h-6 shrink-0 bg-white"
      />
      {children}
    </div>
  )
}
