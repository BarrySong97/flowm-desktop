export type CustomVizKind =
  | "kpi"
  | "table"
  | "line"
  | "area"
  | "bar"
  | "pie"
  | "donut"
  | "text"
  | "progress"

export interface CustomKpiFormat {
  kind: "number" | "currency" | "percent"
  decimals?: number
  currency?: string
}

export interface CustomCardConfig extends Record<string, unknown> {
  viz: CustomVizKind
  sql?: string
  format?: CustomKpiFormat
  xColumn?: string
  yColumns?: string[]
  seriesColumn?: string
  labelColumn?: string
  valueColumn?: string
  target?: number
  markdown?: string
  smooth?: boolean
  stacked?: boolean
}
