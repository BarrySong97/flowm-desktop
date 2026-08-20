/**
 * @purpose Check production releases and present a user-approved update action.
 * @role    Root-level updater sensor mounted once for the lifetime of the renderer.
 * @deps    React effects, window.flowm updater methods, and shared toast UI.
 * @gotcha  Development builds must never query or install the production release feed.
 */

import { useEffect } from "react"
import { notify } from "@flowm/ui"
import { installAvailableUpdate, UPDATE_TOAST_ID } from "@/lib/appUpdate"

export function AppUpdateTracker() {
  useEffect(() => {
    if (!import.meta.env.PROD) return

    let active = true
    void window.flowm
      .checkForUpdate()
      .then((update) => {
        if (!active || !update) return
        notify.action(`发现 FlowM v${update.version}`, {
          id: UPDATE_TOAST_ID,
          description: "新版本已准备好，可立即下载、安装并重启。",
          actionLabel: "更新并重启",
          onAction: () => void installAvailableUpdate(update.version).catch(() => {}),
        })
      })
      .catch((error) => {
        console.warn("FlowM updater check failed", error)
      })

    return () => {
      active = false
    }
  }, [])

  return null
}
