/**
 * @purpose Detect development runtime even when dev launches through a branded Electron bundle.
 * @role    Main-process runtime helper for resource path and dev-only behavior decisions.
 * @deps    electron-vite environment variables and @electron-toolkit dev detection.
 * @gotcha  Branded dev .app bundles can make Electron look packaged; do not rely only on app.isPackaged.
 */

import { is } from "@electron-toolkit/utils"

export function isDevRuntime(): boolean {
  return is.dev || process.env.NODE_ENV_ELECTRON_VITE === "development"
}
