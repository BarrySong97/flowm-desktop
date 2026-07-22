/**
 * @purpose Mount the React application router and top-level renderer providers.
 * @role    Renderer composition root below Electron preload.
 * @deps    React effects, TanStack Router route tree, preload platform metadata, and app-level providers.
 * @gotcha  Keep native and database access behind the tRPC/preload boundary.
 */

import { useEffect } from "react"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { installMouseHistoryNavigation } from "./lib/mouseHistoryNavigation"

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  history: createHashHistory(),
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function App() {
  useEffect(() => {
    if (!window.flowm.platform.isMac) return
    return installMouseHistoryNavigation(router.history)
  }, [])

  return <RouterProvider router={router} />
}

export default App
