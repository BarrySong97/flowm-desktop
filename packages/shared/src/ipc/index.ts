/**
 * @purpose Define local IPC contracts shared by Flowm desktop and CLI.
 * @role    Browser-safe event and socket-path helpers for cross-process app refresh.
 * @deps    TypeScript runtime only.
 * @gotcha  Keep this module free of Node/Electron imports so shared stays platform-light.
 */

export type LedgerChangeSource = "flowm-cli"

export interface LedgerChangeEvent {
  type: "ledger.changed"
  dbPath: string
  ledgerId?: string
  source: LedgerChangeSource
  command: string
  pid: number
  changedAt: string
}

function trimTrailingSeparators(path: string): string {
  return path.replace(/[\\/]+$/, "")
}

function hashText(input: string): string {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }
  return (hash >>> 0).toString(36)
}

export function getFlowmLedgerChangeSocketPath({
  platform,
  userDataDir,
}: {
  platform: string
  userDataDir: string
}): string {
  const normalizedUserDataDir = trimTrailingSeparators(userDataDir)
  if (platform === "win32") {
    return `\\\\.\\pipe\\flowm-ledger-${hashText(normalizedUserDataDir)}`
  }

  return `${normalizedUserDataDir}/flowm-ledger.sock`
}
