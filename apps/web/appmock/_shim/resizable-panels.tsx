/**
 * @purpose Static drop-in for react-resizable-panels so verbatim-copied pages render their split layout.
 * @role    Non-interactive Group/Panel/Separator replacements for the marketing app mock.
 * @gotcha  Resizing is inert; `defaultSize`/`minSize`/`orientation` are accepted then mapped to flex.
 *          Group renders a flex row, Panels become flex children sized by `defaultSize` (as a ratio).
 */

import type { CSSProperties, ReactNode } from "react"

interface GroupProps {
  orientation?: "horizontal" | "vertical"
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

export function Group({ orientation = "horizontal", style, className, children }: GroupProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface PanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

export function Panel({ defaultSize = 1, minSize, style, className, children }: PanelProps) {
  return (
    <div
      className={className}
      style={{
        flexGrow: defaultSize,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: minSize != null ? `${minSize}%` : 0,
        minHeight: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface SeparatorProps {
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

export function Separator({ style, className, children }: SeparatorProps) {
  return (
    <div className={className} style={{ flexShrink: 0, ...style }}>
      {children}
    </div>
  )
}
