/**
 * @purpose Start the React renderer and attach it to the Electron web page.
 * @role    Browser-side entry point for Flowm Desktop UI.
 * @deps    React DOM, App, and renderer styles.
 * @gotcha  Do not import Electron main-process modules here.
 */

import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./i18n"
import "./index.css"
import { TRPCProvider } from "./providers/trpc-provider"

createRoot(document.getElementById("root")!).render(
  <TRPCProvider>
    <App />
  </TRPCProvider>,
)
