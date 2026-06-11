import { useEffect } from "react"
import { Toaster } from "@flowm/ui"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { useFlowmStore } from "../lib/stores/flowmStore"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const loadSnapshot = useFlowmStore((state) => state.loadSnapshot)

  useEffect(() => {
    void loadSnapshot()
  }, [loadSnapshot])

  return (
    <div
      style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg)" }}
      data-electron-drag-region
    >
      <div style={{ height: "100%", overflow: "hidden" }} data-electron-no-drag-region>
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
