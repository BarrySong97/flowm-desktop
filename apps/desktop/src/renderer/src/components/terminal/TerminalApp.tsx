import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@heroui/react"
import { RefreshCw } from "lucide-react"
import { Responsive, useContainerWidth, type LayoutItem, type ResponsiveLayouts } from "react-grid-layout"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@flowm/ui"
import type { DashboardCard, DashboardLayoutEntry, DashboardSnapshot, ExchangeRateSummary } from "@flowm/api"
import { BusinessActionDialog } from "../forms/BusinessActionDialog"
import { routeLoopLog } from "../../lib/debug/routeLoop"
import { useFlowmStore } from "../../lib/stores/flowmStore"
import { AddCardDialog } from "../../dashboard/AddCardDialog"
import { registerBuiltinCards } from "../../dashboard/cards"
import { getCardSpec, type CardSpec } from "../../dashboard/registry"
import { BgThemeSwitcher } from "./BgThemeSwitcher"
import { CommandBar } from "./CommandBar"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Panel } from "./Panel"

registerBuiltinCards()

type FlowmBreakpoint = "lg" | "md" | "sm" | "xs" | "xxs"

const BREAKPOINT_ORDER: FlowmBreakpoint[] = ["lg", "md", "sm", "xs", "xxs"]

const breakpoints: Record<FlowmBreakpoint, number> = {
  lg: 1200,
  md: 860,
  sm: 640,
  xs: 420,
  xxs: 0,
}

const cols: Record<FlowmBreakpoint, number> = {
  lg: 12,
  md: 12,
  sm: 6,
  xs: 4,
  xxs: 2,
}

const PERSIST_DEBOUNCE_MS = 300

interface VisibleCard {
  card: DashboardCard
  spec: CardSpec
  title: string
  code: string
}

export function TerminalApp() {
  const { t } = useTranslation()
  const loadSnapshot = useFlowmStore((state) => state.loadSnapshot)
  const snapshot = useFlowmStore((state) => state.snapshot)
  const exchangeRates = useFlowmStore((state) => state.exchangeRates)
  const currencySettings = useFlowmStore((state) => state.currencySettings)
  const dashboardCards = useFlowmStore((state) => state.dashboardCards)
  const dashboardLayouts = useFlowmStore((state) => state.dashboardLayouts)
  const removeDashboardCard = useFlowmStore((state) => state.removeDashboardCard)
  const updateDashboardCard = useFlowmStore((state) => state.updateDashboardCard)
  const saveDashboardLayouts = useFlowmStore((state) => state.saveDashboardLayouts)
  const editingCardId = useFlowmStore((state) => state.editingCardId)
  const setEditingCardId = useFlowmStore((state) => state.setEditingCardId)
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 })
  const [maximizedCardId, setMaximizedCardId] = useState<string | null>(null)
  const pendingLayouts = useRef<DashboardLayoutEntry[] | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  routeLoopLog("TerminalApp.render", {
    width,
    mounted,
    cards: dashboardCards.length,
    layouts: dashboardLayouts.length,
    editingCardId,
    maximizedCardId,
  })

  const visibleCards = useMemo<VisibleCard[]>(() => {
    return dashboardCards
      .filter((card) => !card.hidden)
      .map((card) => {
        const spec = getCardSpec(card.type)
        if (spec == null) return null
        return {
          card,
          spec,
          title: card.title ?? t(spec.titleKey),
          code: card.code ?? spec.code,
        }
      })
      .filter((entry): entry is VisibleCard => entry != null)
  }, [dashboardCards, t])

  const layouts = useMemo<ResponsiveLayouts<FlowmBreakpoint>>(() => {
    const grouped: Record<FlowmBreakpoint, LayoutItem[]> = {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: [],
    }
    for (const entry of dashboardLayouts) {
      const visible = visibleCards.find((item) => item.card.id === entry.cardId)
      if (visible == null) continue
      grouped[entry.breakpoint as FlowmBreakpoint].push({
        i: entry.cardId,
        x: entry.x,
        y: entry.y,
        w: entry.w,
        h: entry.h,
        minW: visible.spec.defaultSize.minW,
        minH: visible.spec.defaultSize.minH,
      })
    }
    return grouped
  }, [dashboardLayouts, visibleCards])

  useEffect(() => {
    return () => {
      if (saveTimer.current != null) clearTimeout(saveTimer.current)
    }
  }, [])

  const handleLayoutChange = (
    _current: ResponsiveLayouts<FlowmBreakpoint>["lg"],
    nextLayouts: ResponsiveLayouts<FlowmBreakpoint>,
  ) => {
    const flat: DashboardLayoutEntry[] = []
    for (const breakpoint of BREAKPOINT_ORDER) {
      const entries = nextLayouts[breakpoint] ?? []
      for (const entry of entries) {
        flat.push({
          cardId: String(entry.i),
          breakpoint,
          x: entry.x,
          y: entry.y,
          w: entry.w,
          h: entry.h,
        })
      }
    }
    const sameLayout = isSameLayoutSnapshot(flat, dashboardLayouts)
    routeLoopLog("TerminalApp.onLayoutChange", {
      sameLayout,
      incoming: flat.length,
      existing: dashboardLayouts.length,
      width,
      first: flat[0],
    })
    if (sameLayout) return
    pendingLayouts.current = flat
    if (saveTimer.current != null) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const rows = pendingLayouts.current
      pendingLayouts.current = null
      routeLoopLog("TerminalApp.saveLayouts.timer", {
        rows: rows?.length ?? 0,
        first: rows?.[0],
      })
      if (rows != null) void saveDashboardLayouts(rows)
    }, PERSIST_DEBOUNCE_MS)
  }

  const closeCard = (cardId: string) => {
    if (maximizedCardId === cardId) setMaximizedCardId(null)
    void removeDashboardCard(cardId)
  }

  const maximizedCard = visibleCards.find((entry) => entry.card.id === maximizedCardId)

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--term-bg)] font-sans text-[var(--term-ink-1)]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-3">
        <BusinessActionDialog />
        <AddCardDialog />
        <Button size="sm" variant="outline" onPress={() => void loadSnapshot()}>
          <RefreshCw className="size-3" />
          {t("toolbar.refresh")}
        </Button>
        <span className="ml-auto text-[11px] text-[var(--term-ink-3)]">{t("toolbar.shortcutHint")}</span>
        <BgThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <CommandBar onBeforeViewSwitch={() => setMaximizedCardId(null)} />
      <div className="relative min-h-0 flex-1 bg-[var(--term-bg)]">
        <ScrollArea
          ref={containerRef}
          className={`h-full min-h-0 bg-[var(--term-bg)] ${maximizedCard ? "pointer-events-none" : ""}`}
          contentClassName="pb-[var(--flowm-bottom-nav-safe)]"
          aria-hidden={maximizedCard ? "true" : undefined}
        >
          {mounted && (
            <Responsive
              width={width}
              layouts={layouts}
              breakpoints={breakpoints}
              cols={cols}
              rowHeight={55}
              margin={[8, 8]}
              containerPadding={[8, 8]}
              dragConfig={{ enabled: true, bounded: true, handle: ".react-grid-item:hover .flowm-grid-drag-handle", cancel: ".flowm-grid-action", threshold: 3 }}
              resizeConfig={{ enabled: true, handles: ["n", "s", "e", "w", "ne", "nw", "se", "sw"] }}
              onLayoutChange={handleLayoutChange}
            >
              {visibleCards.map(({ card, spec, title, code }) => {
                const RenderCard = spec.Render
                return (
                  <div key={card.id} className="min-h-0">
                    <Panel
                      title={title}
                      code={code}
                      className="h-full"
                      onClose={() => closeCard(card.id)}
                      onMaximize={() => setMaximizedCardId(card.id)}
                      onRenameSubmit={(next) =>
                        void updateDashboardCard({
                          id: card.id,
                          title: next.length === 0 ? null : next,
                        })
                      }
                      onConfigure={spec.ConfigDialog != null ? () => setEditingCardId(card.id) : undefined}
                    >
                      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <RenderCard
                          cardId={card.id}
                          config={card.config}
                          onConfigChange={(nextConfig) =>
                            void updateDashboardCard({ id: card.id, config: nextConfig })
                          }
                        />
                      </div>
                    </Panel>
                  </div>
                )
              })}
            </Responsive>
          )}
        </ScrollArea>
        {maximizedCard ? (
          <div className="absolute inset-0 z-30 overflow-hidden bg-[var(--term-bg)] p-1.5">
            <Panel
              title={maximizedCard.title}
              code={maximizedCard.code}
              className="h-full"
              isMaximized
              onClose={() => closeCard(maximizedCard.card.id)}
              onRestore={() => setMaximizedCardId(null)}
              onRenameSubmit={(next) =>
                void updateDashboardCard({
                  id: maximizedCard.card.id,
                  title: next.length === 0 ? null : next,
                })
              }
              onConfigure={
                maximizedCard.spec.ConfigDialog != null
                  ? () => setEditingCardId(maximizedCard.card.id)
                  : undefined
              }
            >
              <maximizedCard.spec.Render
                cardId={maximizedCard.card.id}
                config={maximizedCard.card.config}
                onConfigChange={(nextConfig) =>
                  void updateDashboardCard({ id: maximizedCard.card.id, config: nextConfig })
                }
              />
            </Panel>
          </div>
        ) : null}
      </div>
      {(() => {
        if (editingCardId == null) return null
        const entry = visibleCards.find((item) => item.card.id === editingCardId)
        if (entry == null) return null
        const Dialog = entry.spec.ConfigDialog
        if (Dialog == null) return null
        return (
          <Dialog
            cardId={entry.card.id}
            config={entry.card.config}
            onSave={(nextConfig) => {
              void updateDashboardCard({ id: entry.card.id, config: nextConfig })
              setEditingCardId(null)
            }}
            onClose={() => setEditingCardId(null)}
          />
        )
      })()}
      <footer className="flex h-6 shrink-0 items-center border-t border-[var(--term-border)] bg-[var(--term-topbar)] text-[11px] text-[var(--term-ink-2)]">
        <FooterRates exchangeRates={exchangeRates} displayCurrency={currencySettings?.displayCurrency ?? "CNY"} />
        <span className="flex-1" />
        <FooterMetrics snapshot={snapshot} />
      </footer>
    </main>
  )
}

function FooterRates({ exchangeRates, displayCurrency }: { exchangeRates: ExchangeRateSummary[]; displayCurrency: string }) {
  const rates = exchangeRates
    .filter((r) => r.toCurrency === displayCurrency && r.fromCurrency !== displayCurrency)
    .slice(0, 3)

  if (rates.length === 0) return null

  return (
    <>
      {rates.map((r) => (
        <span key={r.fromCurrency} className="border-r border-[var(--term-border)] px-2 font-mono tabular-nums">
          <span className="text-[var(--term-ink-3)]">{r.fromCurrency} </span>
          <span className="text-[var(--term-ink-1)]">{Number(r.rate).toFixed(4)}</span>
        </span>
      ))}
    </>
  )
}

function FooterMetrics({ snapshot }: { snapshot: DashboardSnapshot | null }) {
  if (snapshot == null) return null
  const { netWorth, expenseMtd } = snapshot.metrics

  const fmt = (amount: { number: string; currency: string }) => {
    const n = Number(amount.number)
    if (!Number.isFinite(n)) return "—"
    const abs = Math.abs(n)
    const sign = n < 0 ? "-" : ""
    let display: string
    if (abs >= 1_000_000) {
      display = `${sign}${(abs / 1_000_000).toFixed(2)}M`
    } else if (abs >= 10_000) {
      display = `${sign}${(abs / 10_000).toFixed(2)}万`
    } else {
      display = `${sign}${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    return `${amount.currency} ${display}`
  }

  return (
    <>
      <span className="border-l border-[var(--term-border)] px-2 font-mono tabular-nums">
        <span className="text-[var(--term-ink-3)]">净资产 </span>
        <span className="text-[var(--term-ink-1)]">{fmt(netWorth)}</span>
      </span>
      <span className="border-l border-[var(--term-border)] px-2 font-mono tabular-nums">
        <span className="text-[var(--term-ink-3)]">本月支出 </span>
        <span className="text-[var(--term-accent-2)]">{fmt(expenseMtd)}</span>
      </span>
    </>
  )
}

function isSameLayoutSnapshot(
  next: DashboardLayoutEntry[],
  existing: DashboardLayoutEntry[],
): boolean {
  if (next.length === 0) return true
  const map = new Map<string, DashboardLayoutEntry>()
  for (const entry of existing) {
    map.set(`${entry.cardId}::${entry.breakpoint}`, entry)
  }
  for (const entry of next) {
    const prev = map.get(`${entry.cardId}::${entry.breakpoint}`)
    if (prev == null) return false
    if (prev.x !== entry.x || prev.y !== entry.y || prev.w !== entry.w || prev.h !== entry.h) {
      return false
    }
  }
  return true
}
