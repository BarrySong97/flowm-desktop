/**
 * @purpose Shared settings menu-item building blocks (group labels, rows, controls).
 * @role    Renderer UI primitives reused across the settings surfaces.
 * @deps    React and @heroui/react Tabs.
 * @gotcha  RowShell is the single source of row sizing — keep every settings row on it.
 */

import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { Tabs } from "@heroui/react"

const CHEVRON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3l5 5-5 5" />
  </svg>
)

/** Shared row metrics — the single source of truth for settings row sizing. */
const ROW_BASE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  padding: "15px 0",
}

function rowBorder(first?: boolean): string {
  return first ? "none" : "1px solid var(--hair-3)"
}

export function GroupLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "var(--ink-4)",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

/** A settings group: top margin + group label + its rows. */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 30 }}>
      <GroupLabel>{title}</GroupLabel>
      {children}
    </div>
  )
}

/**
 * Row container that owns the shared sizing (padding / divider / flex). Every
 * settings row — Row, LinkRow, ledger rows — renders through this so heights and
 * separators stay consistent. `gap` may be overridden for layout-specific rows.
 */
export function RowShell({
  first,
  gap,
  className,
  style,
  children,
}: {
  first?: boolean
  gap?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div
      className={className}
      style={{
        ...ROW_BASE,
        ...(gap != null ? { gap } : null),
        borderTop: rowBorder(first),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Row({
  label,
  sub,
  first,
  children,
}: {
  label: string
  sub?: string
  first?: boolean
  children: ReactNode
}) {
  return (
    <RowShell first={first}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>{children}</div>
    </RowShell>
  )
}

export function LinkRow({
  children,
  note,
  danger,
  onClick,
}: {
  children: string
  note?: string
  danger?: boolean
  onClick?: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...ROW_BASE,
        borderTop: rowBorder(),
        font: "500 13.5px var(--sans)",
        color: danger ? (hov ? "#a23a31" : "#b4493f") : hov ? "var(--ink)" : "var(--ink-2)",
        width: "100%",
        textAlign: "left",
        background: "none",
        cursor: "pointer",
        transition: "color .12s",
      }}
    >
      {children}
      {note && (
        <span
          style={{
            fontWeight: 400,
            fontSize: 11.5,
            marginLeft: "auto",
            whiteSpace: "nowrap",
            color: "var(--ink-4)",
          }}
        >
          {note}
        </span>
      )}
      <span style={{ marginLeft: note ? 0 : "auto", color: "var(--ink-4)" }}>{CHEVRON}</span>
    </button>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 23,
        borderRadius: 100,
        cursor: "pointer",
        flexShrink: 0,
        background: on ? "var(--accent)" : "var(--hair)",
        position: "relative",
        transition: "background .18s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: 2.5,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(20,40,30,.28)",
          transform: on ? "translateX(17px)" : "none",
          transition: "transform .18s",
          display: "block",
        }}
      />
    </div>
  )
}

export function SegTabs({
  opts,
  val,
  onChange,
}: {
  opts: string[]
  val: string
  onChange: (v: string) => void
}) {
  return (
    <Tabs selectedKey={val} onSelectionChange={(k) => onChange(String(k))}>
      <Tabs.ListContainer>
        <Tabs.List>
          {opts.map((o) => (
            <Tabs.Tab key={o} id={o} className="h-6 px-3 text-xs">
              {o}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
