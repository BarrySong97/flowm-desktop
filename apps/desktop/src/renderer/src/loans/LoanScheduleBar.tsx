import { useState } from "react"
import { createPortal } from "react-dom"
import type { SchedRow } from "./loanSchedule"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

interface TipState {
  k: number
  paid: boolean
  principal: number
  interest: number
  /** viewport coords of the hovered bar */
  centerX: number
  topY: number
  /** position of the hovered bar inside the track (0..1) for arrow alignment */
  ratio: number
}

interface LoanScheduleBarProps {
  sched: SchedRow[]
  paid: number
  termTotal: number
  monthly: number
  height?: number
}

/**
 * Interactive segmented repayment bar shared by the loans list and the loan
 * detail page. Each segment is one period; paid periods are accent-filled.
 *
 * The hover tooltip is rendered through a portal to `document.body` with fixed
 * positioning, so it is never clipped by a scroll container nor covered by the
 * page header.
 */
export function LoanScheduleBar({ sched, paid, termTotal, monthly, height = 42 }: LoanScheduleBarProps) {
  const [tip, setTip] = useState<TipState | null>(null)

  return (
    <div
      style={{ position: "relative", display: "flex", gap: 2, height, flex: 1, alignItems: "stretch" }}
      onMouseLeave={() => setTip(null)}
    >
      {sched.map((s, k) => {
        const isPaid = k < paid
        const isCur = k === paid - 1
        const isHov = tip?.k === k
        return (
          <div
            key={k}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              borderRadius: 2,
              cursor: "pointer",
              background: isPaid ? "var(--accent)" : "var(--surface-3)",
              boxShadow: isCur
                ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--accent)"
                : isPaid
                  ? "none"
                  : "inset 0 0 0 1px var(--hair)",
              zIndex: isCur ? 2 : isHov ? 3 : undefined,
              transform: isHov ? "scaleY(1.12)" : undefined,
              outline: isHov ? "1.5px solid var(--ink)" : undefined,
              outlineOffset: isHov ? 0 : undefined,
              transition: "transform .08s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              const rect = el.getBoundingClientRect()
              const track = el.parentElement?.getBoundingClientRect()
              const ratio = track && track.width > 0 ? (rect.left + rect.width / 2 - track.left) / track.width : 0.5
              setTip({
                k,
                paid: isPaid,
                principal: s.principal,
                interest: s.interest,
                centerX: rect.left + rect.width / 2,
                topY: rect.top,
                ratio,
              })
            }}
          />
        )
      })}

      {tip
        && createPortal(
          (() => {
            const al = tip.ratio > 0.8 ? "r" : tip.ratio < 0.2 ? "l" : "c"
            const tf =
              (al === "r" ? "translate(-100%,-100%)" : al === "l" ? "translate(0,-100%)" : "translate(-50%,-100%)")
              + " translateY(-9px)"
            const arLeft = al === "r" ? "calc(100% - 14px)" : al === "l" ? "10px" : "50%"
            return (
              <div
                style={{
                  position: "fixed",
                  left: tip.centerX,
                  top: tip.topY,
                  transform: tf,
                  zIndex: 9999,
                  pointerEvents: "none",
                  background: "var(--ink)",
                  color: "var(--surface)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.65, marginBottom: 5, letterSpacing: ".03em" }}>
                  第 {tip.k + 1} / {termTotal} 期 · {tip.paid ? "已还" : "未还"}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {([["本金", tip.principal], ["利息", tip.interest], ["月供", monthly]] as Array<[string, number]>).map(
                    ([label, val]) => (
                      <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.6 }}>{label}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>¥{fmt(val)}</span>
                      </div>
                    ),
                  )}
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: -4,
                    left: arLeft,
                    transform: "translateX(-50%) rotate(45deg)",
                    width: 8,
                    height: 8,
                    background: "var(--ink)",
                  }}
                />
              </div>
            )
          })(),
          document.body,
        )}
    </div>
  )
}
