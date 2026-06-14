/**
 * @purpose Expose platform helpers that can be shared without importing Electron.
 * @role    Small cross-package platform utility module.
 * @deps    Node/browser-safe platform values.
 * @gotcha  Keep Electron-specific detection in desktop preload or main process.
 */

export const isElectron = (): boolean => {
  if (typeof window === "undefined") return false
  return "flowm" in window
}

export const isBrowser = (): boolean => {
  if (typeof window === "undefined") return false
  return !isElectron()
}

export const getPlatform = (): "electron" | "browser" | "server" => {
  if (typeof window === "undefined") return "server"
  return isElectron() ? "electron" : "browser"
}
