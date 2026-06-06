import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { routeLoopLog } from "../../../../lib/debug/routeLoop"

interface Props {
  children: (size: { width: number; height: number }) => ReactNode
}

/**
 * Measures the host element via ResizeObserver and passes explicit width/height
 * to children. Replaces Recharts' `ResponsiveContainer` which has a known
 * setState loop when the container briefly reports negative dimensions during
 * route transitions / grid reflow (Recharts 3 + React 19).
 */
export function SafeChartContainer({ children }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const hasCommittedRef = useRef(false)
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  routeLoopLog("SafeChartContainer.render", size)

  useEffect(() => {
    const el = hostRef.current
    if (el == null) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let nextSize: { width: number; height: number } | null = null

    const commit = (pending: { width: number; height: number } | null = nextSize) => {
      timer = null
      nextSize = null
      if (pending == null) return
      const current = sizeRef.current
      const widthDelta = Math.abs(current.width - pending.width)
      const heightDelta = Math.abs(current.height - pending.height)
      if (widthDelta < 2 && heightDelta < 2) return
      sizeRef.current = pending
      hasCommittedRef.current = true
      setSize(pending)
    }

    const scheduleCommit = (pending: { width: number; height: number }) => {
      const hasUsableSize = pending.width > 0 && pending.height > 0
      if (!hasCommittedRef.current && hasUsableSize) {
        if (timer != null) clearTimeout(timer)
        commit(pending)
        return
      }
      if (!hasCommittedRef.current) {
        return
      }
      nextSize = pending
      if (timer != null) clearTimeout(timer)
      timer = setTimeout(() => {
        const current = sizeRef.current
        if (nextSize != null && nextSize.width > 0 && nextSize.height > 0) {
          commit(nextSize)
          return
        }
        if (current.width > 0 && current.height > 0) {
          nextSize = null
          timer = null
          return
        }
        commit(nextSize)
      }, 120)
    }

    const apply = (rect: DOMRectReadOnly | DOMRect) => {
      const w = Math.max(0, Math.floor(rect.width))
      const h = Math.max(0, Math.floor(rect.height))
      routeLoopLog("SafeChartContainer.measure", { width: w, height: h })
      scheduleCommit({ width: w, height: h })
    }
    apply(el.getBoundingClientRect())
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry != null) apply(entry.contentRect)
    })
    observer.observe(el)
    return () => {
      if (timer != null) clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%", minWidth: 0, minHeight: 0 }}>
      {size.width > 0 && size.height > 0 ? (
        <Fragment key={`${size.width}x${size.height}`}>{children(size)}</Fragment>
      ) : null}
    </div>
  )
}
