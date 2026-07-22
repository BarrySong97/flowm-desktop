/**
 * @purpose Verify native Electron navigation command direction mapping.
 * @role    Regression tests for browser-style app commands and macOS swipes.
 * @deps    Vitest and the native navigation adapter.
 * @gotcha  Keep this test pure so it does not need a live BrowserWindow.
 */

import { describe, expect, it } from "vitest"
import {
  directionForAppCommand,
  directionForKeyboardInput,
  directionForSwipe,
} from "./native-navigation"

describe("native navigation direction mapping", () => {
  it("maps browser app commands", () => {
    expect(directionForAppCommand("browser-backward")).toBe("back")
    expect(directionForAppCommand("browser-forward")).toBe("forward")
    expect(directionForAppCommand("media-play-pause")).toBeNull()
  })

  it("maps horizontal macOS swipes", () => {
    expect(directionForSwipe("right")).toBe("back")
    expect(directionForSwipe("left")).toBe("forward")
    expect(directionForSwipe("up")).toBeNull()
  })

  it("maps macOS mouse-driver browser shortcuts", () => {
    const input = {
      type: "keyDown",
      key: "[",
      code: "BracketLeft",
      alt: false,
      control: false,
      meta: true,
      shift: false,
    }

    expect(directionForKeyboardInput(input)).toBe("back")
    expect(directionForKeyboardInput({ ...input, key: "]", code: "BracketRight" })).toBe("forward")
    expect(directionForKeyboardInput({ ...input, meta: false })).toBeNull()
    expect(directionForKeyboardInput({ ...input, shift: true })).toBeNull()
  })
})
