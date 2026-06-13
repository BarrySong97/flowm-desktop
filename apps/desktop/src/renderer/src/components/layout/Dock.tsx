import { Link, useRouterState } from "@tanstack/react-router"
import { flowmPerfLog } from "@/lib/debug/perf"

const ICONS: Record<string, string> = {
  overview: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z",
  assets:   "M2 5l6-3 6 3-6 3zM2 5v6l6 3 6-3V5",
  flow:     "M2 4h12M2 8h12M2 12h8",
  subs:     "M3 8a5 5 0 018-3.5M13 8a5 5 0 01-8 3.5M11 3v2H9M5 13v-2h2",
  loans:    "M2 6l6-3 6 3M3 6v6M13 6v6M6 6v6M10 6v6M2 13h12",
  budget:   "M2.5 12a5.5 5.5 0 1 1 11 0M8 12l3.2-2.6M8 12V6.5",
  settings: "M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 1.2V3M8 13v1.8M2 8H3.4M12.6 8H14M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1",
}

function Glyph({ k }: { k: string }) {
  return (
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[k]} />
    </svg>
  )
}

const NAV = [
  { label: "看板",   key: "overview", href: "/" },
  { label: "资产",   key: "assets",   href: "/assets" },
  { label: "流水",   key: "flow",     href: "/imports" },
  { label: "订阅",   key: "subs",     href: "/subscriptions" },
  { label: "贷款",   key: "loans",    href: "/loans" },
  { label: "预算",   key: "budget",   href: "/budget" },
  { label: "设置",   key: "settings", href: "/settings" },
] as const

export function Dock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="absolute left-1/2 bottom-[18px] -translate-x-1/2 z-20 flex items-stretch gap-0.5 p-1.5 rounded-2xl border border-black/10 shadow-[0_14px_40px_-12px_rgba(20,40,30,0.28)]"
      style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)" }}
      data-electron-no-drag-region
    >
      {NAV.map((item, i) => (
        <span key={item.href} style={{ display: "contents" }}>
          {i === 5 && (
            <span className="w-px self-center h-[30px] bg-black/10 mx-1" />
          )}
          <Link to={item.href} style={{ textDecoration: "none" }}>
            <button
              type="button"
              onClick={() => {
                flowmPerfLog("nav", "click", {
                  from: pathname,
                  to: item.href,
                  label: item.label,
                  active: isActive(item.href),
                })
              }}
              className={[
                "flex flex-col items-center justify-center gap-1 w-[62px] py-2 rounded-[11px] text-[10.5px] font-medium tracking-[0.02em] transition-colors duration-[120ms]",
                isActive(item.href)
                  ? "bg-[#14794a] text-white"
                  : "text-gray-500 hover:bg-black/5 hover:text-gray-900",
              ].join(" ")}
            >
              <Glyph k={item.key} />
              <span>{item.label}</span>
            </button>
          </Link>
        </span>
      ))}
    </nav>
  )
}
