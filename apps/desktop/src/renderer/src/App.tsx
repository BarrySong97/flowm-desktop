/**
 * @purpose Mount the React application router and top-level renderer providers.
 * @role    Renderer composition root below Electron preload.
 * @deps    TanStack Router route tree and app-level providers.
 * @gotcha  Keep native and database access behind the tRPC/preload boundary.
 */

import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

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
  return <RouterProvider router={router} />
}

export default App
