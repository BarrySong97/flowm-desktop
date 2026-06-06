export const CHART_PALETTE = [
  "var(--term-accent)",
  "var(--term-accent-2)",
  "var(--term-red)",
  "var(--term-amber)",
  "var(--term-blue)",
  "var(--term-purple)",
  "var(--term-pink)",
  "var(--term-teal)",
] as const

export const AXIS_TICK = { fill: "var(--term-ink-2)", fontSize: 10 } as const

export const GRID_STROKE = "var(--term-border)"

export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  background: "var(--term-panel)",
  border: "1px solid var(--term-border)",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
  color: "var(--term-ink-1)",
  padding: "4px 8px",
}

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "var(--term-ink-2)",
  marginBottom: 2,
}

export const LEGEND_WRAPPER_STYLE: React.CSSProperties = {
  fontSize: 10,
  color: "var(--term-ink-2)",
}
