import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { getFlowmApi, type FlowQueryResult } from "@flowm/api"
import type { CardRenderProps } from "../../registry"
import { defaultConfigForViz } from "./defaults"
import type { CustomCardConfig, CustomVizKind } from "./types"
import { AreaRenderer } from "./renderers/AreaRenderer"
import { BarRenderer } from "./renderers/BarRenderer"
import { DonutRenderer } from "./renderers/DonutRenderer"
import { KpiRenderer } from "./renderers/KpiRenderer"
import { LineRenderer } from "./renderers/LineRenderer"
import { PieRenderer } from "./renderers/PieRenderer"
import { ProgressRenderer } from "./renderers/ProgressRenderer"
import { TableRenderer } from "./renderers/TableRenderer"
import { TextRenderer } from "./renderers/TextRenderer"

function normalizeConfig(raw: CustomCardConfig | undefined): CustomCardConfig {
  const viz = (raw?.viz as CustomVizKind | undefined) ?? "table"
  return {
    ...defaultConfigForViz(viz),
    ...(raw as Partial<CustomCardConfig> | undefined),
    viz,
  }
}

export function CustomCard({ config }: CardRenderProps<CustomCardConfig>) {
  const { t } = useTranslation()
  const current = useMemo(() => normalizeConfig(config), [config])
  const viz = current.viz
  const sql = current.sql ?? ""

  const [result, setResult] = useState<FlowQueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastRunSql = useRef<string | null>(null)

  const run = useCallback(async (nextSql: string) => {
    if (nextSql.trim().length === 0) {
      setResult(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const api = getFlowmApi()
      const response = await api.runFlowQuery({ sql: nextSql })
      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error)
        setResult(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (viz === "text") return
    if (sql === lastRunSql.current) return
    lastRunSql.current = sql
    void run(sql)
  }, [viz, sql, run])

  if (viz === "text") {
    return <TextRenderer markdown={current.markdown ?? ""} />
  }

  if (error) {
    return (
      <pre className="whitespace-pre-wrap px-3 py-3 font-mono text-[11px] text-[var(--term-red)]">
        {error}
      </pre>
    )
  }
  if (loading && result == null) {
    return <div className="px-3 py-3 text-[11px] text-[var(--term-ink-3)]">{t("cards.custom.loading")}</div>
  }
  if (result == null) {
    return <div className="px-3 py-3 text-[11px] text-[var(--term-ink-3)]">{t("cards.custom.empty")}</div>
  }
  if (result.rows.length === 0) {
    return <div className="px-3 py-3 text-[11px] text-[var(--term-ink-3)]">{t("cards.custom.noRows")}</div>
  }
  return renderViz(viz, result, current)
}

function renderViz(viz: CustomVizKind, result: FlowQueryResult, config: CustomCardConfig) {
  switch (viz) {
    case "kpi":
      return <KpiRenderer result={result} valueColumn={config.valueColumn} format={config.format} />
    case "table":
      return <TableRenderer result={result} />
    case "line":
      return (
        <LineRenderer
          result={result}
          xColumn={config.xColumn}
          yColumns={config.yColumns}
          seriesColumn={config.seriesColumn}
          valueColumn={config.valueColumn}
          smooth={config.smooth}
        />
      )
    case "area":
      return (
        <AreaRenderer
          result={result}
          xColumn={config.xColumn}
          yColumns={config.yColumns}
          seriesColumn={config.seriesColumn}
          valueColumn={config.valueColumn}
          smooth={config.smooth}
        />
      )
    case "bar":
      return (
        <BarRenderer
          result={result}
          xColumn={config.xColumn}
          yColumns={config.yColumns}
          seriesColumn={config.seriesColumn}
          valueColumn={config.valueColumn}
          stacked={config.stacked}
        />
      )
    case "pie":
      return (
        <PieRenderer
          result={result}
          labelColumn={config.labelColumn}
          valueColumn={config.valueColumn}
        />
      )
    case "donut":
      return (
        <DonutRenderer
          result={result}
          labelColumn={config.labelColumn}
          valueColumn={config.valueColumn}
        />
      )
    case "progress":
      return (
        <ProgressRenderer
          result={result}
          valueColumn={config.valueColumn}
          target={config.target}
          format={config.format}
        />
      )
    case "text":
      return null
  }
}
