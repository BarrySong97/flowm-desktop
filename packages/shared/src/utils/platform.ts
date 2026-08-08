/**
 * @purpose Expose platform helpers that can be shared without importing the desktop runtime.
 * @role    Small cross-package platform utility module.
 * @deps    Node/browser-safe platform values.
 * @gotcha  The presence of window.flowm identifies the native desktop bridge.
 */

export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false
  return "flowm" in window
}

export const isBrowser = (): boolean => {
  if (typeof window === "undefined") return false
  return !isDesktop()
}

export const getPlatform = (): "desktop" | "browser" | "server" => {
  if (typeof window === "undefined") return "server"
  return isDesktop() ? "desktop" : "browser"
}
