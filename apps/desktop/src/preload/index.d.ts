/**
 * @purpose Declare the renderer-visible Flowm preload bridge on window.
 * @role    Type contract shared by renderer code and preload implementation.
 * @deps    Electron preload types and IPC request shape.
 * @gotcha  Update this declaration whenever preload APIs change.
 */

import type { ElectronAPI } from "@electron-toolkit/preload"
import type { LedgerChangeEvent } from "@flowm/shared/ipc"

type RendererLedgerChangeEvent = LedgerChangeEvent & { receivedAt: string }

declare global {
  interface Window {
    electron: ElectronAPI
    flowm: {
      platform: {
        isMac: boolean
        isWindows: boolean
        isLinux: boolean
        name: NodeJS.Platform
      }
      getDatabasePath: () => Promise<string | null>
      databaseExists: () => Promise<boolean>
      trpcRequest: (request: { type: string; path: string; input: unknown }) => Promise<unknown>
      onLedgerChanged: (callback: (event: RendererLedgerChangeEvent) => void) => () => void
    }
  }
}

export {}
