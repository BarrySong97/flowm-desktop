import { useEffect, useId, useMemo, useState, type ComponentType } from "react"
import { Landmark, LayoutDashboard, Repeat, Settings, Upload, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@flowm/ui"
import { Link, useMatchRoute, useRouterState, type LinkProps } from "@tanstack/react-router"
import { routeLoopLog } from "../../lib/debug/routeLoop"
import { buildDisplacementMapDataUrl } from "./displacementMap"

const WIDTH = 420
const HEIGHT = 56
const RADIUS = 28
const EDGE = 18
const DISPLACE_SCALE = 36

interface NavItem {
  to: "/" | "/imports" | "/assets" | "/subscriptions" | "/loans" | "/settings"
  Icon: ComponentType<{ className?: string }>
  labelKey: string
  exact: boolean
}

const ITEMS: NavItem[] = [
  { to: "/", Icon: LayoutDashboard, labelKey: "nav.dashboard", exact: true },
  { to: "/imports", Icon: Upload, labelKey: "nav.imports", exact: false },
  { to: "/assets", Icon: Wallet, labelKey: "nav.assets", exact: false },
  { to: "/subscriptions", Icon: Repeat, labelKey: "nav.subscriptions", exact: false },
  { to: "/loans", Icon: Landmark, labelKey: "nav.loans", exact: false },
  { to: "/settings", Icon: Settings, labelKey: "nav.settings", exact: false },
]

const LINK_OPTIONS_EXACT: LinkProps["activeOptions"] = { exact: true }
const LINK_OPTIONS_PREFIX: LinkProps["activeOptions"] = { exact: false }

export function LiquidGlassNav() {
  const { t } = useTranslation()
  const filterId = useId().replace(/:/g, "")
  const containerFilterId = `liquid-bar-${filterId}`
  const activeFilterId = `liquid-active-${filterId}`
  const [containerMap, setContainerMap] = useState<string>("")
  const [activeMap, setActiveMap] = useState<string>("")
  const matchRoute = useMatchRoute()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  routeLoopLog("LiquidGlassNav.render", {
    pathname,
    hasContainerMap: containerMap.length > 0,
    hasActiveMap: activeMap.length > 0,
  })

  useEffect(() => {
    routeLoopLog("LiquidGlassNav.maps.effect")
    setContainerMap(
      buildDisplacementMapDataUrl({
        width: WIDTH,
        height: HEIGHT,
        radius: RADIUS,
        edge: EDGE,
      }),
    )
    const activeSize = HEIGHT - 8
    setActiveMap(
      buildDisplacementMapDataUrl({
        width: activeSize,
        height: activeSize,
        radius: activeSize / 2,
        edge: 12,
        curve: 1.8,
      }),
    )
  }, [])

  const containerFilterRef = useMemo(() => `url(#${containerFilterId})`, [containerFilterId])
  const activeFilterRef = useMemo(() => `url(#${activeFilterId})`, [activeFilterId])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={containerFilterId} colorInterpolationFilters="sRGB">
          {containerMap ? (
            <feImage
              href={containerMap}
              x="0"
              y="0"
              width={WIDTH}
              height={HEIGHT}
              result="cmap"
            />
          ) : null}
          <feDisplacementMap
            in="SourceGraphic"
            in2="cmap"
            scale={containerMap ? DISPLACE_SCALE : 0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={activeFilterId} colorInterpolationFilters="sRGB">
          {activeMap ? (
            <feImage href={activeMap} x="0" y="0" width={HEIGHT - 8} height={HEIGHT - 8} result="amap" />
          ) : null}
          <feDisplacementMap
            in="SourceGraphic"
            in2="amap"
            scale={activeMap ? 26 : 0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <nav
        aria-label="Main"
        className="pointer-events-auto relative flex h-14 items-center gap-1 overflow-hidden rounded-full border border-white/55 bg-white/25 px-2 shadow-[0_18px_42px_-12px_rgba(15,32,24,0.45),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.05)]"
        style={{
          width: `min(${WIDTH}px, calc(100vw - 24px))`,
          backdropFilter: `${containerFilterRef} blur(14px) saturate(180%)`,
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />
        {ITEMS.map((item) => {
          const isActive = item.exact
            ? Boolean(matchRoute({ to: item.to, fuzzy: false }))
            : Boolean(matchRoute({ to: item.to, fuzzy: true }))
          routeLoopLog("LiquidGlassNav.itemActive", { pathname, to: item.to, isActive })
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.exact ? LINK_OPTIONS_EXACT : LINK_OPTIONS_PREFIX}
              className="group relative flex h-12 flex-1 items-center justify-center"
              aria-label={t(item.labelKey)}
              title={t(item.labelKey)}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-1 rounded-full transition",
                  isActive
                    ? "border border-white/65 bg-white/22 shadow-[0_2px_10px_-2px_rgba(15,32,24,0.18),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(0,0,0,0.04)]"
                    : "group-hover:bg-white/15",
                )}
                style={
                  isActive
                    ? {
                        backdropFilter: `${activeFilterRef} blur(6px) saturate(160%) brightness(1.06)`,
                        WebkitBackdropFilter: "blur(6px) saturate(160%) brightness(1.06)",
                      }
                    : undefined
                }
              />
              <item.Icon
                className={cn(
                  "relative size-5 transition",
                  isActive
                    ? "text-[var(--term-ink-1)]"
                    : "text-[var(--term-ink-2)] group-hover:text-[var(--term-ink-1)]",
                )}
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
