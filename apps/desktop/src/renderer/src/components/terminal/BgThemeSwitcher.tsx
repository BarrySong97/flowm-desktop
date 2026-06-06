import { useEffect, useState } from "react"

type BgTheme = "warm" | "neutral" | "green" | "amber"

const THEMES: { id: BgTheme; label: string; bg: string }[] = [
  { id: "warm",    label: "原始 · 暖沙",   bg: "#f4f3ee" },
  { id: "neutral", label: "A · Fey冷灰",  bg: "oklch(92% 0.004 240)" },
  { id: "green",   label: "B · Linear纯灰", bg: "oklch(92% 0 0)" },
  { id: "amber",   label: "C · 暖灰",      bg: "oklch(92% 0.006 70)" },
]

const STORAGE_KEY = "flowm-bg-theme"

function applyTheme(theme: BgTheme) {
  if (theme === "warm") {
    document.documentElement.removeAttribute("data-bg-theme")
  } else {
    document.documentElement.setAttribute("data-bg-theme", theme)
  }
}

export function BgThemeSwitcher() {
  const [active, setActive] = useState<BgTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored as BgTheme | null) ?? "warm"
  })

  useEffect(() => {
    applyTheme(active)
  }, [active])

  const handleClick = (theme: BgTheme) => {
    setActive(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Background theme">
      {THEMES.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => handleClick(t.id)}
            className="size-[18px] rounded-full border-2 transition-[box-shadow,border-color] duration-[120ms]"
            style={{
              background: t.bg,
              borderColor: isActive ? "var(--term-accent)" : "var(--term-border-hi)",
              boxShadow: isActive ? "0 0 0 2px var(--term-accent-soft)" : "none",
            }}
            aria-pressed={isActive}
          />
        )
      })}
    </div>
  )
}
