import { memo, useMemo } from "react"

interface Props {
  values: number[]
  color?: string
  width?: number
  height?: number
}

const MARGIN = 3

// Fritsch–Carlson monotone cubic interpolation — same curve family as
// Recharts' type="monotone", so swapping away from Recharts keeps the look.
function monotonePath(xs: number[], ys: number[]): string {
  const n = xs.length
  if (n === 2) return `M${xs[0]},${ys[0]}L${xs[1]},${ys[1]}`
  const dx: number[] = []
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i])
    slopes.push((ys[i + 1] - ys[i]) / dx[i])
  }
  const tangents: number[] = [slopes[0]]
  for (let i = 1; i < n - 1; i++) {
    const a = slopes[i - 1]
    const b = slopes[i]
    if (a * b <= 0) {
      tangents.push(0)
    } else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      tangents.push((w1 + w2) / (w1 / a + w2 / b))
    }
  }
  tangents.push(slopes[n - 2])
  let d = `M${xs[0]},${ys[0]}`
  for (let i = 0; i < n - 1; i++) {
    const t = dx[i] / 3
    d += `C${xs[i] + t},${ys[i] + tangents[i] * t},${xs[i + 1] - t},${ys[i + 1] - tangents[i + 1] * t},${xs[i + 1]},${ys[i + 1]}`
  }
  return d
}

function buildPath(values: number[], width: number, height: number): string {
  const n = values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const innerW = width - MARGIN * 2
  const innerH = height - MARGIN * 2
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < n; i++) {
    xs.push(MARGIN + (i / (n - 1)) * innerW)
    ys.push(max === min ? height / 2 : MARGIN + ((max - values[i]) / (max - min)) * innerH)
  }
  return monotonePath(xs, ys)
}

function MiniSparklineBase({ color = "var(--ink-4)", values, width = 160, height = 40 }: Props) {
  const path = useMemo(() => {
    const finite = values.filter((value) => Number.isFinite(value))
    if (finite.length < 2) return null
    return buildPath(finite, width, height)
  }, [values, width, height])

  if (!path) {
    return <div aria-hidden="true" style={{ width, height, flexShrink: 0 }} />
  }

  // Size must be inline style: HeroUI's `.button svg` rule force-shrinks
  // descendant svgs to icon size, and only inline styles win over it.
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, height, margin: 0, display: "block", flexShrink: 0 }}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const MiniSparkline = memo(MiniSparklineBase)
