import type { ComponentType } from "react"
import type { CardIconProps } from "../registry"
import { registerCard } from "../registry"
import { CustomCard } from "./custom/CustomCard"
import { CustomCardConfigDialog } from "./custom/ConfigDialog"
import { DEFAULT_SIZE_FOR_VIZ, defaultConfigForViz } from "./custom/defaults"
import {
  AreaIcon,
  BarIcon,
  DonutIcon,
  KpiIcon,
  LineIcon,
  PieIcon,
  ProgressIcon,
  TableIcon,
  TextIcon,
} from "./custom/icons"
import type { CustomCardConfig, CustomVizKind } from "./custom/types"

const CHART_VIZ: Array<{ viz: CustomVizKind; code: string; Icon: ComponentType<CardIconProps> }> = [
  { viz: "kpi", code: "KPI", Icon: KpiIcon },
  { viz: "line", code: "LINE", Icon: LineIcon },
  { viz: "area", code: "AREA", Icon: AreaIcon },
  { viz: "bar", code: "BAR", Icon: BarIcon },
  { viz: "pie", code: "PIE", Icon: PieIcon },
  { viz: "donut", code: "DONUT", Icon: DonutIcon },
]

let registered = false

export function registerBuiltinCards(): void {
  if (registered) return
  registered = true

  for (const entry of CHART_VIZ) {
    registerCard<CustomCardConfig>({
      type: `custom-${entry.viz}`,
      category: "chart",
      titleKey: `cards.custom.title.${entry.viz}`,
      code: entry.code,
      defaultSize: DEFAULT_SIZE_FOR_VIZ[entry.viz],
      defaultConfig: defaultConfigForViz(entry.viz),
      Icon: entry.Icon,
      Render: CustomCard,
      ConfigDialog: CustomCardConfigDialog,
    })
  }

  registerCard<CustomCardConfig>({
    type: "custom-table",
    category: "view",
    titleKey: "cards.custom.title.table",
    code: "TABLE",
    defaultSize: DEFAULT_SIZE_FOR_VIZ.table,
    defaultConfig: defaultConfigForViz("table"),
    Icon: TableIcon,
    Render: CustomCard,
    ConfigDialog: CustomCardConfigDialog,
  })

  registerCard<CustomCardConfig>({
    type: "custom-text",
    category: "other",
    titleKey: "cards.custom.title.text",
    code: "TEXT",
    defaultSize: DEFAULT_SIZE_FOR_VIZ.text,
    defaultConfig: defaultConfigForViz("text"),
    Icon: TextIcon,
    Render: CustomCard,
    ConfigDialog: CustomCardConfigDialog,
  })

  registerCard<CustomCardConfig>({
    type: "custom-progress",
    category: "other",
    titleKey: "cards.custom.title.progress",
    code: "PROG",
    defaultSize: DEFAULT_SIZE_FOR_VIZ.progress,
    defaultConfig: defaultConfigForViz("progress"),
    Icon: ProgressIcon,
    Render: CustomCard,
    ConfigDialog: CustomCardConfigDialog,
  })
}
