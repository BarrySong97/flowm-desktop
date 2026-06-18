/**
 * @purpose Keep the desktop app's visible identity in one place.
 * @role    Shared main-process constants for app naming and OS integration.
 * @deps    Electron bootstrap and package metadata decisions.
 * @gotcha  Keep userData paths and production bundle identifiers stable separately from display names.
 */

export const APP_DISPLAY_NAME = "FlowM"
export const APP_USER_MODEL_ID = "com.flowm.desktop"
