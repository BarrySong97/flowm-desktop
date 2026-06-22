/**
 * @purpose Shared building blocks for the mocked app pages (headers, donut, etc).
 * @role    Keep the per-page mocks consistent with the desktop app's chrome.
 * @gotcha  Presentational only; mirrors var(--ink-*)/var(--hair-*) tokens.
 */

import type { ReactNode } from "react"

/** Fixed page header band with a bottom hairline. */
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-[var(--hair-2)] pb-4">
      {children}
    </div>
  )
}

/** Header stat: small label + a monospace number (lg = the headline figure). */
export function HeadStat({
  label,
  value,
  size = "sm",
  color,
}: {
  label: string
  value: ReactNode
  size?: "lg" | "sm"
  color?: string
}) {
  return (
    <div className={size === "sm" ? "pt-1.5" : ""}>
      <div className="text-[11px] text-[var(--ink-3)]">{label}</div>
      <div
        className={`mt-[3px] font-['IBM_Plex_Mono'] text-[var(--ink)] ${
          size === "lg"
            ? "text-[32px] font-semibold tracking-[-0.03em]"
            : "text-[15px] font-medium tracking-[-0.01em]"
        }`}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  )
}

/** Static primary "add" pill, matching the app's header CTA. */
export function AddBtn({ children }: { children: ReactNode }) {
  return (
    <span className="ml-auto mt-1 inline-flex flex-none items-center gap-1 rounded-[8px] bg-green px-[14px] py-[8px] text-[12.5px] font-semibold text-white">
      {children}
    </span>
  )
}

/** Conic-gradient donut with a center label, used for composition charts. */
export function Donut({
  segments,
  centerLabel,
  centerValue,
  size = 168,
}: {
  segments: { color: string; pct: number }[]
  centerLabel: string
  centerValue: string
  size?: number
}) {
  let acc = 0
  const stops = segments
    .map((s) => {
      const from = acc
      acc += s.pct
      return `${s.color} ${from}% ${acc}%`
    })
    .join(", ")
  const hole = Math.round(size * 0.42)
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="rounded-full"
        style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
      />
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-white"
        style={{ inset: (size - hole) / 2 }}
      >
        <div className="text-[9.5px] text-[var(--ink-4)]">{centerLabel}</div>
        <div className="font-['IBM_Plex_Mono'] text-[15px] font-bold text-[var(--ink)]">
          {centerValue}
        </div>
      </div>
    </div>
  )
}

/** Legend row: color dot + name + amount + optional percent. */
export function LegendRow({
  color,
  name,
  amount,
  pct,
}: {
  color: string
  name: string
  amount: string
  pct?: string
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: color }} />
      <span className="flex-1 truncate text-[var(--ink-2)]">{name}</span>
      <span className="font-['IBM_Plex_Mono'] text-[11.5px] text-[var(--ink-3)]">{amount}</span>
      {pct ? <span className="w-7 text-right text-[11px] text-[var(--ink-4)]">{pct}</span> : null}
    </div>
  )
}
