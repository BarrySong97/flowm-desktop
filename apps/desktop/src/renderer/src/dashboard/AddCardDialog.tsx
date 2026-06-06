import { useMemo, useState } from "react"
import { Button, Card, Input, Modal } from "@heroui/react"
import { useTranslation } from "react-i18next"
import { Plus, Search } from "lucide-react"
import { ScrollArea } from "@flowm/ui"
import type { DashboardLayoutEntry } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import {
  listCardSpecsByCategory,
  type CardCategory,
  type CardSpec,
} from "./registry"

const CATEGORY_ORDER: CardCategory[] = [
  "chart",
  "view",
  "other",
  "kpi",
  "reminder",
  "budget",
  "query",
  "panel",
]

const BREAKPOINTS: Array<DashboardLayoutEntry["breakpoint"]> = ["lg", "md", "sm", "xs", "xxs"]

const BREAKPOINT_COLUMNS: Record<DashboardLayoutEntry["breakpoint"], number> = {
  lg: 12,
  md: 12,
  sm: 6,
  xs: 4,
  xxs: 2,
}

export function AddCardDialog() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const dashboardLayouts = useFlowmStore((state) => state.dashboardLayouts)
  const addDashboardCard = useFlowmStore((state) => state.addDashboardCard)
  const setEditingCardId = useFlowmStore((state) => state.setEditingCardId)

  const grouped = useMemo(() => listCardSpecsByCategory(), [])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length === 0) return grouped
    const next: Record<CardCategory, CardSpec[]> = {
      chart: [],
      view: [],
      other: [],
      kpi: [],
      reminder: [],
      budget: [],
      query: [],
      panel: [],
    }
    for (const category of CATEGORY_ORDER) {
      for (const spec of grouped[category]) {
        const title = t(spec.titleKey).toLowerCase()
        const code = spec.code.toLowerCase()
        if (title.includes(term) || code.includes(term) || spec.type.includes(term)) {
          next[category].push(spec)
        }
      }
    }
    return next
  }, [grouped, query, t])

  const submit = async (spec: CardSpec) => {
    const baseLayouts = BREAKPOINTS.map<DashboardLayoutEntry>((breakpoint) => {
      const cols = BREAKPOINT_COLUMNS[breakpoint]
      const w = Math.min(spec.defaultSize.w, cols)
      const y = computeNextRow(dashboardLayouts, breakpoint)
      return {
        cardId: "pending",
        breakpoint,
        x: 0,
        y,
        w,
        h: spec.defaultSize.h,
      }
    })
    const card = await addDashboardCard({
      type: spec.type,
      title: null,
      code: spec.code,
      config: spec.defaultConfig,
      layouts: baseLayouts,
    })
    if (card != null) {
      setOpen(false)
      setQuery("")
      if (spec.ConfigDialog != null) {
        setEditingCardId(card.id)
      }
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onPress={() => setOpen(true)}>
        <Plus className="size-3" />
        {t("cards.addButton")}
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop />
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("cards.add.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-[12px] text-[var(--term-ink-3)]">{t("cards.add.description")}</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--term-ink-3)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("cards.add.search")}
                  className="pl-7"
                />
              </div>
              <ScrollArea className="max-h-[55vh]">
                <div className="flex flex-col gap-3 pr-1">
                  {CATEGORY_ORDER.map((category) => {
                    const specs = filtered[category]
                    if (specs.length === 0) return null
                    return (
                      <section key={category} className="flex flex-col gap-2">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">
                          {t(`cards.category.${category}`)}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {specs.map((spec) => {
                            const Icon = spec.Icon
                            return (
                              <button
                                key={spec.type}
                                type="button"
                                onClick={() => void submit(spec)}
                                className="group"
                              >
                                <Card className="aspect-square cursor-pointer rounded-[8px] p-2 shadow-none border border-[var(--term-border)] transition-colors group-hover:border-[var(--term-accent)] group-hover:bg-[var(--term-accent-soft)]">
                                  <Card.Content className="flex flex-col items-center justify-center gap-1.5 p-0">
                                    <span className="flex size-9 items-center justify-center text-[var(--term-accent)]">
                                      {Icon != null ? <Icon className="size-7" /> : <span className="font-mono text-[10px]">{spec.code}</span>}
                                    </span>
                                    <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-[var(--term-ink-1)]">
                                      {t(spec.titleKey)}
                                    </span>
                                  </Card.Content>
                                </Card>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                  {Object.values(filtered).every((bucket) => bucket.length === 0) && (
                    <div className="px-3 py-6 text-center text-[12px] text-[var(--term-ink-3)]">
                      {t("cards.add.noMatches")}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setOpen(false)}>{t("dialog.cancel")}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </>
  )
}

function computeNextRow(
  layouts: DashboardLayoutEntry[],
  breakpoint: DashboardLayoutEntry["breakpoint"],
): number {
  let maxBottom = 0
  for (const entry of layouts) {
    if (entry.breakpoint !== breakpoint) continue
    const bottom = entry.y + entry.h
    if (bottom > maxBottom) maxBottom = bottom
  }
  return maxBottom
}
