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
