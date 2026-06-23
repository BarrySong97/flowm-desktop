/**
 * @purpose Subscribe to main-process auto-update events and drive the bottom-right update popup.
 * @role    Renderer-side update controller: mirrors update state into a shared atom and a Sonner toast.
 * @deps    React, jotai, @flowm/ui notify, and the preload updater bridge.
 * @gotcha  Render inside the Jotai provider tree; the toast id is stable so one toast updates in place.
 */

import { useEffect } from "react"
import { useSetAtom } from "jotai"
import { notify } from "@flowm/ui"
import { updateStatusAtom } from "@/lib/state/uiAtoms"

const UPDATE_TOAST_ID = "flowm-update"

/**
 * Mounted once for the whole session. Launch checks stay silent (only the
 * settings row reflects "checking"/"not-available"); a visible popup appears
 * once an update is available and follows it through to the auto-restart.
 */
export function AutoUpdateController() {
  const setStatus = useSetAtom(updateStatusAtom)

  useEffect(() => {
    return window.flowm.updater.onStatus((event) => {
      setStatus(event)

      switch (event.state) {
        case "available":
          notify.action(`发现新版本 ${event.version ?? ""}`.trim(), {
            id: UPDATE_TOAST_ID,
            description: "点击更新以下载并自动重启",
            actionLabel: "更新",
            onAction: () => void window.flowm.updater.download(),
          })
          break
        case "downloading":
          notify.action(`正在下载更新… ${event.percent ?? 0}%`, {
            id: UPDATE_TOAST_ID,
            description: "下载完成后将自动重启完成更新",
          })
          break
        case "downloaded":
          notify.action(`更新已就绪 ${event.version ?? ""}`.trim(), {
            id: UPDATE_TOAST_ID,
            description: "正在重启以完成更新…",
          })
          break
        case "error":
          notify.dismiss(UPDATE_TOAST_ID)
          notify.error(`更新失败：${event.message ?? "未知错误"}`)
          break
        // "checking" / "not-available" only update the shared atom (settings row).
      }
    })
  }, [setStatus])

  return null
}
