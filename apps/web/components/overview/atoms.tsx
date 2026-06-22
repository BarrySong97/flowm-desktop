/**
 * @purpose Presentational Overview atoms ported from the desktop renderer.
 * @role    Shared UI primitives so the marketing mock matches the real app 1:1.
 * @deps    Raw CSS tokens (var(--ink-*), var(--hair-*), var(--accent), ...).
 * @gotcha  Pure presentational — no data fetching; money is pre-formatted via lib/format.
 */

import type { CSSProperties, ReactNode } from "react"
import { fmt } from "@/lib/format"

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-4)] ${className}`}
    >
      {children}
    </div>
  )
}

export function BigNumber({
  children,
  style,
  className = "",
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      className={`font-['IBM_Plex_Mono'] font-semibold tracking-[-0.03em] text-[var(--ink)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function StatBlock({
  label,
  value,
  className = "",
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="text-[11px] text-[var(--ink-3)]">{label}</div>
      <div className="text-sm font-medium text-[var(--ink)]">{value}</div>
    </div>
  )
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`text-[12.5px] font-semibold text-[var(--ink)] ${className}`}>{children}</span>
  )
}

export function Dim({
  children,
  className = "",
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <span className={`text-[var(--ink-4)] ${className}`} style={style}>
      {children}
    </span>
  )
}

export function ColorDot({
  color,
  size = 7,
  className = "",
}: {
  color: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-full flex-none ${className}`}
      style={{ background: color, width: size, height: size }}
    />
  )
}

export function UpcomingRow({
  date,
  color,
  name,
  kind,
  amount,
}: {
  date: string
  color: string
  name: string
  kind: string
  amount: string
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] py-2 border-t border-[var(--hair)] min-w-0">
      <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[var(--ink-4)] w-[34px] flex-none">
        {date}
      </span>
      <ColorDot color={color} size={7} className="flex-none" />
      <span className="flex-1 truncate text-[var(--ink-2)]">{name}</span>
      <span className="text-[10px] text-[var(--ink-4)]">{kind}</span>
      <span className="font-['IBM_Plex_Mono'] text-[12px] font-medium text-[var(--ink)] flex-none ml-1">
        {amount}
      </span>
    </div>
  )
}

export function BudgetBar({
  color,
  spent,
  limit,
  label,
  scaleMax,
}: {
  color: string
  spent: number
  limit: number
  label: string
  /** When provided, all bars scale relative to this maximum (overview mode). */
  scaleMax?: number
}) {
  const max = scaleMax ?? limit
  const over = spent > limit
  const inPct = (Math.min(spent, limit) / max) * 100
  const limPct = (limit / max) * 100
  const spentPct = (spent / max) * 100

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr 120px",
        gap: 11,
        alignItems: "center",
      }}
    >
      <span className="inline-flex items-center gap-[7px] min-w-0">
        <ColorDot color={color} size={8} className="flex-none" />
        <span className="text-[12px] text-[var(--ink-2)] truncate">{label}</span>
      </span>

      <div className="relative h-[9px] rounded-[6px]" style={{ background: "var(--hair-2)" }}>
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: inPct + "%",
            background: over ? "var(--accent)" : color,
            borderRadius: over ? "6px 0 0 6px" : 6,
          }}
        />
        {over && (
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: limPct + "%",
              width: Math.max(spentPct - limPct, 0) + "%",
              background: "var(--red)",
              borderRadius: "0 6px 6px 0",
              boxShadow: "-1px 0 0 white",
            }}
          />
        )}
      </div>

      <div className="text-right whitespace-nowrap">
        <span
          className="font-['IBM_Plex_Mono'] text-[12px] font-semibold"
          style={{ color: over ? "var(--red)" : "var(--ink)" }}
        >
          ¥{fmt(spent)}
        </span>
        <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[var(--ink-4)]">
          {" "}
          / {fmt(limit)}
        </span>
        <span
          className="font-['IBM_Plex_Mono'] text-[10px] ml-[7px]"
          style={{ color: over ? "var(--red)" : "var(--ink-4)" }}
        >
          {over ? "超" + fmt(spent - limit) : "剩" + fmt(limit - spent)}
        </span>
      </div>
    </div>
  )
}
