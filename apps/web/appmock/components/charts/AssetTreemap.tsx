/**
 * @purpose Render the asset treemap finance chart component.
 * @role    Reusable renderer chart used by dashboard or feature pages.
 * @deps    React charting primitives, formatted finance data, and CSS tokens.
 * @gotcha  Charts must preserve the distinction between cashflow, snapshots, and forecasts.
 */

import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { useMoney } from "@mock/lib/useMoney"

interface Group {
  name: string
  sum: number
  color: string
}

interface Props {
  groups: Group[]
  total: number
  height?: number
  /** Currency symbol for the (already base-converted) values. */
  symbol?: string
}

function Cell({
  x,
  y,
  width,
  height,
  name,
  value,
  color,
  total,
  symbol,
}: {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  value?: number
  color?: string
  total?: number
  symbol?: string
}) {
  const fmt = useMoney()
  const _x = x ?? 0,
    _y = y ?? 0,
    _w = width ?? 0,
    _h = height ?? 0
  const _v = value ?? 0,
    _t = total ?? 1
  const showName = _w > 44 && _h > 22
  const showValue = _w > 60 && _h > 44
  return (
    <g>
      <rect
        x={_x + 1}
        y={_y + 1}
        width={_w - 2}
        height={_h - 2}
        fill={color ?? "transparent"}
        rx={5}
        style={{ outline: "none" }}
      />
      {showName && (
        <text
          x={_x + 9}
          y={_y + 16}
          fill="rgba(255,255,255,0.92)"
          fontSize={10}
          fontWeight={600}
          style={{ fontFamily: "Noto Sans SC, sans-serif" }}
        >
          {name}
        </text>
      )}
      {showValue && (
        <text
          x={_x + 9}
          y={_y + 32}
          fill="rgba(255,255,255,0.82)"
          fontSize={10.5}
          fontWeight={500}
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          {`${symbol ?? "¥"}${fmt(_v)}`}
        </text>
      )}
      {showValue && (
        <text
          x={_x + 9}
          y={_y + 46}
          fill="rgba(255,255,255,0.6)"
          fontSize={9.5}
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          {_t > 0 ? Math.round((_v / _t) * 100) : 0}%
        </text>
      )}
    </g>
  )
}

function TooltipContent({
  active,
  payload,
  symbol,
}: {
  active?: boolean
  payload?: { payload: { name: string; value: number; color: string; total: number } }[]
  symbol?: string
}) {
  const fmt = useMoney()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--hair-2)",
        borderRadius: 8,
        padding: "6px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: 12,
        color: "var(--ink)",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.name}</div>
      <div
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >{`${symbol ?? "¥"}${fmt(d.value)}`}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
        {d.total > 0 ? Math.round((d.value / d.total) * 100) : 0}%
      </div>
    </div>
  )
}

export function AssetTreemap({ groups, total, height = 200, symbol = "¥" }: Props) {
  const data = groups.map((g) => ({
    name: g.name,
    value: g.sum,
    color: g.color,
    total,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey="value"
        content={<Cell total={total} symbol={symbol} />}
        isAnimationActive={false}
        style={{ outline: "none" }}
      >
        <Tooltip content={<TooltipContent symbol={symbol} />} />
      </Treemap>
    </ResponsiveContainer>
  )
}
