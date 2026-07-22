/**
 * @purpose Verify macOS mouse side-button routing behavior.
 * @role    Regression test for the renderer history navigation adapter.
 * @deps    Vitest, jsdom, and the mouse history navigation helper.
 * @gotcha  Dispatch cancelable events so preventDefault behavior remains observable.
 */

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  directionForMouseButton,
  installMouseHistoryNavigation,
} from "../lib/mouseHistoryNavigation"

describe("mouse history navigation", () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    cleanup?.()
    cleanup = undefined
  })

  it("maps only browser-style side buttons", () => {
    expect(directionForMouseButton(3)).toBe("back")
    expect(directionForMouseButton(4)).toBe("forward")
    expect(directionForMouseButton(0)).toBeNull()
  })

  it("moves through router history once per side-button press", () => {
    const history = { back: vi.fn(), forward: vi.fn() }
    cleanup = installMouseHistoryNavigation(history)

    window.dispatchEvent(new MouseEvent("mousedown", { button: 3, cancelable: true }))
    window.dispatchEvent(new MouseEvent("mousedown", { button: 4, cancelable: true }))

    expect(history.back).toHaveBeenCalledOnce()
    expect(history.forward).toHaveBeenCalledOnce()
  })

  it("prevents a follow-up auxiliary default navigation", () => {
    const history = { back: vi.fn(), forward: vi.fn() }
    cleanup = installMouseHistoryNavigation(history)
    const event = new MouseEvent("auxclick", { button: 3, cancelable: true })

    expect(window.dispatchEvent(event)).toBe(false)
    expect(history.back).not.toHaveBeenCalled()
  })
})
