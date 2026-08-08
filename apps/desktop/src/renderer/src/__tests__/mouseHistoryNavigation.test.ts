/**
 * @purpose Verify browser-style mouse and keyboard history navigation.
 * @role    Regression test for Tauri renderer history adapters.
 * @deps    Vitest, jsdom, and the browser history navigation helpers.
 * @gotcha  Dispatch cancelable events so preventDefault behavior remains observable.
 */

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  directionForHistoryKey,
  directionForMouseButton,
  installKeyboardHistoryNavigation,
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

describe("keyboard history navigation", () => {
  it("maps browser keys and macOS bracket shortcuts", () => {
    expect(
      directionForHistoryKey({
        key: "BrowserBack",
        code: "BrowserBack",
        metaKey: false,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
      }),
    ).toBe("back")
    expect(
      directionForHistoryKey({
        key: "[",
        code: "BracketLeft",
        metaKey: true,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
      }),
    ).toBe("back")
  })

  it("installs and removes a keyboard listener", () => {
    const history = { back: vi.fn(), forward: vi.fn() }
    const cleanup = installKeyboardHistoryNavigation(history)

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "BrowserForward" }))
    expect(history.forward).toHaveBeenCalledOnce()

    cleanup()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "BrowserForward" }))
    expect(history.forward).toHaveBeenCalledOnce()
  })
})
