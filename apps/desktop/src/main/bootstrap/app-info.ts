/**
 * @purpose Keep the desktop app's visible identity in one place.
 * @role    Shared main-process constants for app naming and OS integration.
 * @deps    Electron bootstrap and package metadata decisions.
 * @gotcha  Keep userData paths and production bundle identifiers stable separately from display names.
 */

export const APP_DISPLAY_NAME = "FlowM"
export const APP_USER_MODEL_ID = "com.flowm.desktop"

// Development runs under a distinct name and identifier so its window, Dock entry,
// and user-data directory never collide with an installed production build.
export const APP_DEV_DISPLAY_NAME = "FlowM Dev"
export const APP_DEV_USER_MODEL_ID = "com.flowm.desktop.dev"

export function appDisplayName(isDev: boolean): string {
  return isDev ? APP_DEV_DISPLAY_NAME : APP_DISPLAY_NAME
}

export function appUserModelId(isDev: boolean): string {
  return isDev ? APP_DEV_USER_MODEL_ID : APP_USER_MODEL_ID
}
