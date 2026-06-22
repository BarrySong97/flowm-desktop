/**
 * @purpose Floating dock (bottom nav) ported from the desktop shell.
 * @role    Switches the mocked app page inside the hero window.
 * @gotcha  Mock-only: clicking a tab swaps the previewed page; no real routing.
 */

const ICONS: Record<string, string> = {
  overview: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z",
  assets: "M2 5l6-3 6 3-6 3zM2 5v6l6 3 6-3V5",
  flow: "M2 4h12M2 8h12M2 12h8",
  subs: "M3 8a5 5 0 018-3.5M13 8a5 5 0 01-8 3.5M11 3v2H9M5 13v-2h2",
  loans: "M2 6l6-3 6 3M3 6v6M13 6v6M6 6v6M10 6v6M2 13h12",
  budget: "M2.5 12a5.5 5.5 0 1 1 11 0M8 12l3.2-2.6M8 12V6.5",
  settings:
    "M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 1.2V3M8 13v1.8M2 8H3.4M12.6 8H14M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1",
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

function EyeGlyph() {
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
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

const NAV = [
  { label: "看板", key: "overview" },
  { label: "资产", key: "assets" },
  { label: "流水", key: "flow" },
  { label: "订阅", key: "subs" },
  { label: "贷款", key: "loans" },
  { label: "预算", key: "budget" },
  { label: "设置", key: "settings" },
]

const ITEM =
  "flex flex-col items-center justify-center gap-1 w-[62px] py-2 rounded-[11px] text-[10.5px] font-medium tracking-[0.02em] transition-colors"

export function DockMock({
  active,
  onSelect,
}: {
  active: string
  onSelect: (key: string) => void
}) {
  return (
    <nav
      className="absolute left-1/2 bottom-[18px] -translate-x-1/2 z-20 flex items-stretch gap-0.5 p-1.5 rounded-2xl border border-black/10 shadow-[0_14px_40px_-12px_rgba(20,40,30,0.28)]"
      style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)" }}
    >
      {NAV.map((item, i) => (
        <span key={item.key} style={{ display: "contents" }}>
          {i === 5 && <span className="w-px self-center h-[30px] bg-black/10 mx-1" />}
          <button
            type="button"
            onClick={() => onSelect(item.key)}
            className={`${ITEM} ${
              active === item.key
                ? "bg-[#14794a] text-white"
                : "text-gray-500 hover:bg-black/5 hover:text-gray-900"
            }`}
          >
            <Glyph k={item.key} />
            <span>{item.label}</span>
          </button>
        </span>
      ))}
      <span className="w-px self-center h-[30px] bg-black/10 mx-1" />
      <div className={`${ITEM} text-gray-500`}>
        <EyeGlyph />
        <span>隐藏</span>
      </div>
    </nav>
  )
}
