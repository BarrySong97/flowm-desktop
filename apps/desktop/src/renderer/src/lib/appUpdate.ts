/**
 * @purpose Coordinate renderer-facing checks and user-approved app update installation.
 * @role    Shared updater workflow for startup prompts and the Settings page.
 * @deps    The typed window.flowm adapter and the shared toast primitive.
 * @gotcha  Never install silently; every download starts from an explicit user action.
 */

import { notify } from "@flowm/ui"

export type UpdateInstallState = {
  downloaded: number
  contentLength: number | null
}

export const UPDATE_TOAST_ID = "flowm-app-update"

export function updateProgressPercent(state: UpdateInstallState): number | null {
  if (!state.contentLength || state.contentLength <= 0) return null
  return Math.min(100, Math.round((state.downloaded / state.contentLength) * 100))
}

export async function installAvailableUpdate(
  version: string,
  onProgress?: (percent: number | null) => void,
): Promise<void> {
  const state: UpdateInstallState = { downloaded: 0, contentLength: null }

  notify.loading(`正在更新到 v${version}`, {
    id: UPDATE_TOAST_ID,
    description: "准备下载…",
    duration: Infinity,
  })

  try {
    await window.flowm.installUpdate((progress) => {
      if (progress.event === "started") {
        state.contentLength = progress.contentLength
        state.downloaded = 0
      } else if (progress.event === "progress") {
        state.downloaded += progress.chunkLength
      }

      const percent = progress.event === "finished" ? 100 : updateProgressPercent(state)
      onProgress?.(percent)
      notify.loading(`正在更新到 v${version}`, {
        id: UPDATE_TOAST_ID,
        description:
          progress.event === "finished"
            ? "下载完成，正在安装并重新启动…"
            : percent == null
              ? "正在下载…"
              : `正在下载 ${percent}%`,
        duration: Infinity,
      })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    notify.error(`更新到 v${version} 失败`, {
      id: UPDATE_TOAST_ID,
      description: message,
      duration: Infinity,
    })
    throw error
  }
}
