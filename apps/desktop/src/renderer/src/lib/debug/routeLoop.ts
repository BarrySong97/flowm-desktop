const counters = new Map<string, { count: number; lastAt: number }>()

function enabled() {
  if (typeof window === "undefined") return false
  const flag = window.localStorage.getItem("flowm:debug-route-loop")
  return flag == null || flag === "1" || flag === "true"
}

export function routeLoopLog(label: string, payload?: Record<string, unknown>) {
  if (!enabled()) return
  const now = performance.now()
  const current = counters.get(label) ?? { count: 0, lastAt: now }
  current.count += 1
  const deltaMs = Math.round(now - current.lastAt)
  current.lastAt = now
  counters.set(label, current)

  if (current.count <= 80 || current.count % 50 === 0) {
    console.debug(`[flowm-route-loop] ${label} #${current.count} +${deltaMs}ms`, payload ?? {})
  }
}
