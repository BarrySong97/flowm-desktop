/**
 * @purpose Verify ui atoms.test behavior in the renderer test suite.
 * @role    Regression test for renderer utilities and shared UI behavior.
 * @deps    Vitest and the module under test.
 * @gotcha  Keep assertions deterministic and independent of live SQLite data.
 */

import { createStore } from "jotai/vanilla"
import { beforeEach, describe, expect, it } from "vitest"
import {
  activeDashboardViewIdAtom,
  appendCommandLogAtom,
  commandInputAtom,
  commandLogAtom,
  createCommandLogEntry,
  editingDashboardCardIdAtom,
  resetUiStateAtom,
} from "../lib/state/uiAtoms"

describe("uiAtoms", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("keeps cross-component UI state outside server data", () => {
    const store = createStore()

    store.set(activeDashboardViewIdAtom, "overview")
    store.set(editingDashboardCardIdAtom, "card_1")
    store.set(commandInputAtom, "REFRESH")

    expect(store.get(activeDashboardViewIdAtom)).toBe("overview")
    expect(store.get(editingDashboardCardIdAtom)).toBe("card_1")
    expect(store.get(commandInputAtom)).toBe("REFRESH")
  })

  it("clips command log to the newest 80 entries", () => {
    const store = createStore()

    for (let index = 0; index < 82; index += 1) {
      store.set(
        appendCommandLogAtom,
        createCommandLogEntry(
          "SYS",
          `entry-${index}`,
          new Date(`2026-06-13T00:00:${String(index % 60).padStart(2, "0")}`),
        ),
      )
    }

    const log = store.get(commandLogAtom)
    expect(log).toHaveLength(80)
    expect(log[0]?.message).toBe("entry-2")
    expect(log[79]?.message).toBe("entry-81")
  })

  it("resets local UI atoms without any api facade", () => {
    const store = createStore()

    store.set(activeDashboardViewIdAtom, "overview")
    store.set(editingDashboardCardIdAtom, "card_1")
    store.set(commandInputAtom, "REFRESH")
    store.set(appendCommandLogAtom, createCommandLogEntry("USR", "REFRESH"))

    store.set(resetUiStateAtom)

    expect(store.get(activeDashboardViewIdAtom)).toBeNull()
    expect(store.get(editingDashboardCardIdAtom)).toBeNull()
    expect(store.get(commandInputAtom)).toBe("")
    expect(store.get(commandLogAtom)).toEqual([])
  })
})
