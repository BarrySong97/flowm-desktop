/**
 * @purpose Start the React renderer in the Tauri shell.
 * @role    Browser-side entry point for Flowm Desktop UI.
 * @deps    React DOM, App, renderer styles, and the desktop runtime bridge.
 * @gotcha  Install the bridge before providers issue any native or data requests.
 */

import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./i18n"
import "./index.css"
import { installDesktopRuntimeBridge } from "./lib/desktop-runtime"
import { TRPCProvider } from "./providers/trpc-provider"

installDesktopRuntimeBridge()

createRoot(document.getElementById("root")!).render(
  <TRPCProvider>
    <App />
  </TRPCProvider>,
)
