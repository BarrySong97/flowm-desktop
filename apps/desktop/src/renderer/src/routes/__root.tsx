import { useEffect } from "react"
import { Toaster } from "@flowm/ui"
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { GlobalBar } from "../components/terminal/GlobalBar"
import { LiquidGlassNav } from "../components/glass/LiquidGlassNav"
import { routeLoopLog } from "../lib/debug/routeLoop"
import { useFlowmStore } from "../lib/stores/flowmStore"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const loadSnapshot = useFlowmStore((state) => state.loadSnapshot)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  routeLoopLog("RootLayout.render", { pathname })

  useEffect(() => {
    routeLoopLog("RootLayout.loadSnapshot.effect", { pathname })
    void loadSnapshot()
  }, [loadSnapshot])

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[var(--term-bg)] font-sans text-[var(--term-ink-1)]">
      <GlobalBar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <LiquidGlassNav />
      <Toaster />
    </div>
  )
}
