import { LineChart, Line, ResponsiveContainer } from "recharts"

function seededRng(seed: number) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function generatePoints(seed: number, count = 10): { v: number }[] {
  const rng = seededRng(seed)
  let v = 50 + rng() * 30
  return Array.from({ length: count }, () => {
    v = Math.max(10, Math.min(90, v + (rng() - 0.48) * 14))
    return { v }
  })
}

/** Returns a fake ±X.X% change string derived from the seed, e.g. "▲ 3.5%" */
export function fakeChange(seed: number): { label: string; positive: boolean } {
  const rng = seededRng(seed + 9999)
  const pct = (rng() * 12).toFixed(1)
  const positive = rng() > 0.38
  return { label: `${positive ? "▲" : "▼"} ${pct}%`, positive }
}

interface Props {
  seed: number
  color?: string
  width?: number
  height?: number
}

export function MiniSparkline({ seed, color = "var(--ink-4)", width = 88, height = 32 }: Props) {
  const data = generatePoints(seed)
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
