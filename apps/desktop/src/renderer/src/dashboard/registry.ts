import type { ComponentType } from "react"

export type CardCategory =
  | "chart"
  | "view"
  | "other"
  | "kpi"
  | "reminder"
  | "budget"
  | "query"
  | "panel"

export interface CardRenderProps<TConfig = Record<string, unknown>> {
  cardId: string
  config: TConfig
  onConfigChange: (next: TConfig) => void
}

export interface CardIconProps {
  className?: string
}

export interface CardConfigDialogProps<TConfig = Record<string, unknown>> {
  cardId: string
  config: TConfig
  onSave: (next: TConfig) => void
  onClose: () => void
}

export interface CardSpec<TConfig = Record<string, unknown>> {
  type: string
  category: CardCategory
  titleKey: string
  descriptionKey?: string
  code: string
  defaultSize: { w: number; h: number; minW: number; minH: number }
  defaultConfig: TConfig
  Icon?: ComponentType<CardIconProps>
  Render: ComponentType<CardRenderProps<TConfig>>
  ConfigDialog?: ComponentType<CardConfigDialogProps<TConfig>>
}

const registry = new Map<string, CardSpec<Record<string, unknown>>>()

export function registerCard<TConfig extends Record<string, unknown>>(spec: CardSpec<TConfig>): void {
  registry.set(spec.type, spec as unknown as CardSpec<Record<string, unknown>>)
}

export function getCardSpec(type: string): CardSpec<Record<string, unknown>> | undefined {
  return registry.get(type)
}

export function listCardSpecs(): CardSpec<Record<string, unknown>>[] {
  return [...registry.values()]
}

export function listCardSpecsByCategory(): Record<CardCategory, CardSpec<Record<string, unknown>>[]> {
  const grouped: Record<CardCategory, CardSpec<Record<string, unknown>>[]> = {
    chart: [],
    view: [],
    other: [],
    kpi: [],
    reminder: [],
    budget: [],
    query: [],
    panel: [],
  }
  for (const spec of registry.values()) {
    grouped[spec.category].push(spec)
  }
  return grouped
}
