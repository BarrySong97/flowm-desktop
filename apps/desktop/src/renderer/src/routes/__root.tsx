/**
 * @purpose Declare the TanStack Router route for the __root screen.
 * @role    Route module connecting URL paths to renderer feature components.
 * @deps    TanStack Router and the matching feature page component.
 * @gotcha  Keep route params and component expectations aligned with generated routeTree output.
 */

import { useEffect, useRef } from "react"
import { Toaster } from "@flowm/ui"
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { TitleBar } from "../components/layout/TitleBar"
import { DemoLedgerBanner } from "../components/layout/DemoLedgerBanner"
import { GlobalConfirmModal } from "../components/ui/ConfirmModal"
import { flowmPerfLog, roundMs } from "../lib/debug/perf"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const href = useRouterState({ select: (state) => state.location.href })
  const previousHref = useRef<string | null>(null)
  const previousCommitAt = useRef(performance.now())

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
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <TitleBar />
      <DemoLedgerBanner />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Outlet />
      </div>
      <Toaster />
      <GlobalConfirmModal />
    </div>
  )
}
