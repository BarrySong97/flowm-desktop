/**
 * @purpose Render the persistent top navigation for every desktop route.
 * @role    Root-shell route tabs plus the global amount-visibility preference.
 * @deps    TanStack Router, Jotai UI state, and renderer performance logging.
 * @gotcha  Keep this navigation in the root shell so feature pages never add their own copy.
 *          The separate TitleBar row clears native traffic lights; keep horizontal padding aligned
 *          with overview content. Keep containers draggable and only interactive controls no-drag.
 */

import { Link, useRouterState } from "@tanstack/react-router"
import { useAtom } from "jotai"
import { flowmPerfLog } from "@/lib/debug/perf"
import { amountsHiddenAtom } from "@/lib/state/uiAtoms"

const PRIMARY_NAV = [
  { label: "看板", href: "/", matches: ["/", "/analysis"] },
  { label: "资产", href: "/assets", matches: ["/assets"] },
  { label: "流水", href: "/imports", matches: ["/imports"] },
  { label: "订阅", href: "/subscriptions", matches: ["/subscriptions"] },
  { label: "贷款", href: "/loans", matches: ["/loans"] },
  { label: "预算", href: "/budget", matches: ["/budget"] },
] as const

function pathMatches(pathname: string, matches: readonly string[]): boolean {
  return matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)))
}

export function TopNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [hidden, setHidden] = useAtom(amountsHiddenAtom)
  const settingsActive = pathname.startsWith("/settings")

  return (
    <header
      data-tauri-drag-region
      className="drag-region relative z-30 flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--hair)] bg-white px-7"
    >
      <nav
        data-tauri-drag-region
        aria-label="主导航"
        className="drag-region flex h-full items-center gap-1"
      >
        {PRIMARY_NAV.map((item) => {
          const active = pathMatches(pathname, item.matches)
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() =>
                flowmPerfLog("nav", "click", {
                  from: pathname,
                  to: item.href,
                  label: item.label,
                  active,
                })
              }
              className={[
                "no-drag-region relative flex h-full min-w-[58px] items-center justify-center px-3 text-[12px] font-medium no-underline transition-colors",
                active
                  ? "text-[var(--ink)] after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-[var(--ink)]"
                  : "text-[var(--ink-3)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div data-tauri-drag-region className="drag-region flex h-full items-center gap-1">
        <button
          type="button"
          aria-pressed={hidden}
          onClick={() => setHidden((value) => !value)}
          className={[
            "no-drag-region rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
            hidden
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--ink-3)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {hidden ? "显示金额" : "隐藏金额"}
        </button>
        <Link
          to="/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={[
            "no-drag-region relative flex h-full items-center px-3 text-[12px] font-medium no-underline transition-colors",
            settingsActive
              ? "text-[var(--ink)] after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-[var(--ink)]"
              : "text-[var(--ink-3)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          设置
        </Link>
      </div>
    </header>
  )
}
