import { ColorDot } from "./ColorDot"

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface Props {
  color: string
  spent: number
  limit: number
  label: string
  /** When provided, all bars scale relative to this maximum (overview mode).
   *  When omitted, the bar fills 100% at the limit value (budget-page mode). */
  scaleMax?: number
}

export function BudgetBar({ color, spent, limit, label, scaleMax }: Props) {
  const max = scaleMax ?? limit
  const over = spent > limit
  const inPct  = (Math.min(spent, limit) / max) * 100
  const limPct  = (limit / max) * 100
  const spentPct = (spent / max) * 100

  return (
    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 120px", gap: 11, alignItems: "center" }}>
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
            transition: "width 0.35s ease",
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
              transition: "width 0.35s ease",
            }}
          />
        )}
        {!over && (
          <div
            className="absolute"
            style={{ left: limPct + "%", top: -2, bottom: -2, width: 1.5, background: "var(--ink-4)", opacity: 0.55 }}
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
        <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[var(--ink-4)]"> / {fmt(limit)}</span>
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
