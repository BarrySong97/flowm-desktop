/**
 * @purpose Define renderer UI state atoms shared across pages.
 * @role    Client-side state module for view preferences and transient UI state.
 * @deps    Jotai atoms and local renderer state types.
 * @gotcha  Keep persisted finance data in the API/database layer, not UI atoms.
 */

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

interface CommandLogEntry {
  time: string
  who: "USR" | "SYS" | "AI"
  message: string
}

export const activeDashboardViewIdAtom = atomWithStorage<string | null>(
  "flowm.activeDashboardViewId",
  null,
)

export const editingDashboardCardIdAtom = atom<string | null>(null)
export const commandInputAtom = atom("")
export const commandLogAtom = atom<CommandLogEntry[]>([])

export const resetUiStateAtom = atom(null, (_get, set) => {
  set(activeDashboardViewIdAtom, null)
  set(editingDashboardCardIdAtom, null)
  set(commandInputAtom, "")
  set(commandLogAtom, [])
})

export const appendCommandLogAtom = atom(null, (get, set, entry: CommandLogEntry) => {
  set(commandLogAtom, [...get(commandLogAtom), entry].slice(-80))
})

export function createCommandLogEntry(
  who: CommandLogEntry["who"],
  message: string,
  now = new Date(),
): CommandLogEntry {
  return { who, message, time: now.toTimeString().slice(0, 8) }
}
