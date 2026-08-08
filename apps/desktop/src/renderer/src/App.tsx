/**
 * @purpose Mount the React application router and desktop history adapters.
 * @role    Renderer composition root for the Tauri desktop app.
 * @deps    React effects, TanStack Router, and history adapters.
 * @gotcha  Install each native history adapter once and clean it up with the root component.
 */

import { useEffect } from "react"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import {
  installKeyboardHistoryNavigation,
  installMouseHistoryNavigation,
} from "./lib/mouseHistoryNavigation"

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
    const removeMouse = installMouseHistoryNavigation(router.history)
    const removeKeyboard = installKeyboardHistoryNavigation(router.history)
    return () => {
      removeMouse()
      removeKeyboard()
    }
  }, [])

  return <RouterProvider router={router} />
}

export default App
