import type { CustomCardConfig, CustomVizKind } from "./types"

const KPI_DEFAULT_SQL =
  "SELECT ROUND(SUM(CAST(value_number AS REAL)), 2) AS total FROM asset_snapshots WHERE id IN (SELECT MAX(id) FROM asset_snapshots GROUP BY account_name)"
const SERIES_DEFAULT_SQL =
  "SELECT strftime('%Y-%m', date) AS month, ROUND(SUM(CAST(amount AS REAL)), 2) AS total FROM financial_events WHERE flow_kind IN ('consumption_expense', 'financial_cost') GROUP BY month ORDER BY month"
const CATEGORY_DEFAULT_SQL =
  "SELECT COALESCE(c.name, '未分类') AS category, ROUND(SUM(CAST(fe.amount AS REAL)), 2) AS total FROM financial_events fe LEFT JOIN categories c ON c.id = fe.category_id WHERE fe.flow_kind IN ('consumption_expense', 'financial_cost') GROUP BY category ORDER BY total DESC LIMIT 8"
const TABLE_DEFAULT_SQL =
  "SELECT date, COALESCE(counterparty, description, '—') AS payee, ROUND(CAST(amount AS REAL), 2) AS amount, flow_kind AS kind FROM financial_events ORDER BY date DESC, id DESC LIMIT 20"

export function defaultConfigForViz(viz: CustomVizKind): CustomCardConfig {
  switch (viz) {
    case "kpi":
      return { viz, sql: KPI_DEFAULT_SQL, valueColumn: "total", format: { kind: "currency", decimals: 2 } }
    case "table":
      return { viz, sql: TABLE_DEFAULT_SQL }
    case "line":
      return { viz, sql: SERIES_DEFAULT_SQL, xColumn: "month", yColumns: ["total"], smooth: true }
    case "area":
      return { viz, sql: SERIES_DEFAULT_SQL, xColumn: "month", yColumns: ["total"], smooth: true }
    case "bar":
      return { viz, sql: SERIES_DEFAULT_SQL, xColumn: "month", yColumns: ["total"], stacked: false }
    case "pie":
      return { viz, sql: CATEGORY_DEFAULT_SQL, labelColumn: "category", valueColumn: "total" }
    case "donut":
      return { viz, sql: CATEGORY_DEFAULT_SQL, labelColumn: "category", valueColumn: "total" }
    case "text":
      return { viz, markdown: "" }
    case "progress":
      return { viz, sql: KPI_DEFAULT_SQL, valueColumn: "total", target: 0, format: { kind: "currency", decimals: 0 } }
  }
}

export const DEFAULT_SIZE_FOR_VIZ: Record<
  CustomVizKind,
  { w: number; h: number; minW: number; minH: number }
> = {
  kpi: { w: 3, h: 3, minW: 2, minH: 2 },
  table: { w: 6, h: 6, minW: 4, minH: 4 },
  line: { w: 6, h: 5, minW: 4, minH: 4 },
  area: { w: 6, h: 5, minW: 4, minH: 4 },
  bar: { w: 6, h: 5, minW: 4, minH: 4 },
  pie: { w: 4, h: 5, minW: 3, minH: 4 },
  donut: { w: 4, h: 5, minW: 3, minH: 4 },
  text: { w: 4, h: 3, minW: 2, minH: 2 },
  progress: { w: 4, h: 3, minW: 2, minH: 2 },
}
