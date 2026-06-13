import { useEffect, useRef } from "react"
import { Toaster } from "@flowm/ui"
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { TitleBar } from "../components/layout/TitleBar"
import { flowmPerfLog, flowmPerfMeasure, roundMs } from "../lib/debug/perf"
import { useFlowmStore } from "../lib/stores/flowmStore"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const loadSnapshot = useFlowmStore((state) => state.loadSnapshot)
  const href = useRouterState({ select: (state) => state.location.href })
  const previousHref = useRef<string | null>(null)
  const previousCommitAt = useRef(performance.now())

  useEffect(() => {
    const startedAt = performance.now()
    flowmPerfLog("root", "loadSnapshot.start", { href })
    void loadSnapshot().finally(() => {
      flowmPerfMeasure("root", "loadSnapshot.end", startedAt, { href })
    })
  }, [loadSnapshot])

  useEffect(() => {
    const now = performance.now()
    flowmPerfLog("route", "commit", {
      href,
      previousHref: previousHref.current,
      msSincePreviousCommit: roundMs(now - previousCommitAt.current),
    })
    previousHref.current = href
    previousCommitAt.current = now
  }, [href])

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg)" }}>
      <TitleBar />
      <div style={{ height: "100vh", overflow: "hidden" }}>
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
