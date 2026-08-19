/**
 * @purpose Reproduce the desktop top navigation inside the Website App mock.
 * @role    Interactive mock route tabs and amount-visibility control.
 * @deps    React callbacks and Flowm marketing-site theme tokens.
 * @gotcha  Navigation swaps local mock pages; it must not navigate the marketing site.
 */

const PRIMARY_NAV = [
  { label: "看板", key: "overview" },
  { label: "资产", key: "assets" },
  { label: "流水", key: "flow" },
  { label: "订阅", key: "subs" },
  { label: "贷款", key: "loans" },
  { label: "预算", key: "budget" },
] as const

export function TopNavigationMock({
  active,
  amountsHidden,
  onSelect,
  onToggleAmounts,
}: {
  active: string
  amountsHidden?: boolean
  onSelect: (key: string) => void
  onToggleAmounts?: () => void
}) {
  return (
    <header className="relative z-30 flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--hair)] bg-white px-7">
      <nav aria-label="模拟应用主导航" className="flex h-full items-center gap-1">
        {PRIMARY_NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={active === item.key}
            onClick={() => onSelect(item.key)}
            className={[
              "relative flex h-full min-w-[58px] items-center justify-center px-3 text-[12px] font-medium transition-colors",
              active === item.key
                ? "text-[var(--ink)] after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-[var(--ink)]"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex h-full items-center gap-1">
        <button
          type="button"
          aria-pressed={amountsHidden}
          onClick={onToggleAmounts}
          className={[
            "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
            amountsHidden
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--ink-3)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {amountsHidden ? "显示金额" : "隐藏金额"}
        </button>
        <button
          type="button"
          aria-pressed={active === "settings"}
          onClick={() => onSelect("settings")}
          className={[
            "relative flex h-full items-center px-3 text-[12px] font-medium transition-colors",
            active === "settings"
              ? "text-[var(--ink)] after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-[var(--ink)]"
              : "text-[var(--ink-3)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          设置
        </button>
      </div>
    </header>
  )
}
