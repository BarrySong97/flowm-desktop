export const isElectron = (): boolean => {
  if (typeof window === "undefined") return false
  return "flowmSql" in window
}

export const isBrowser = (): boolean => {
  if (typeof window === "undefined") return false
  return !isElectron()
}

export const getPlatform = (): "electron" | "browser" | "server" => {
  if (typeof window === "undefined") return "server"
  return isElectron() ? "electron" : "browser"
}
