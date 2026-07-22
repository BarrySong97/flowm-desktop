/**
 * @purpose Connect native browser-style navigation commands to Electron history.
 * @role    Main-process adapter for mouse app commands, macOS driver shortcuts, and trackpad swipes.
 * @deps    Electron BrowserWindow and its WebContents NavigationHistory.
 * @gotcha  macOS mouse drivers may synthesize Command+[ / Command+] instead of emitting mouse buttons.
 */

import type { BrowserWindow } from "electron"

export type HistoryDirection = "back" | "forward"

export function directionForAppCommand(command: string): HistoryDirection | null {
  if (command === "browser-backward") return "back"
  if (command === "browser-forward") return "forward"
  return null
}

export function directionForSwipe(direction: string): HistoryDirection | null {
  if (direction === "right") return "back"
  if (direction === "left") return "forward"
  return null
}

type KeyboardNavigationInput = {
  type: string
  code: string
  key: string
  alt: boolean
  control: boolean
  meta: boolean
  shift: boolean
}

export function directionForKeyboardInput(input: KeyboardNavigationInput): HistoryDirection | null {
  if (input.type !== "keyDown") return null
  if (input.key === "BrowserBack") return "back"
  if (input.key === "BrowserForward") return "forward"
  if (!input.meta || input.alt || input.control || input.shift) return null
  if (input.code === "BracketLeft") return "back"
  if (input.code === "BracketRight") return "forward"
  return null
}

function navigateHistory(window: BrowserWindow, direction: HistoryDirection): void {
  const history = window.webContents.navigationHistory

  if (direction === "back" && history.canGoBack()) {
    history.goBack()
  } else if (direction === "forward" && history.canGoForward()) {
    history.goForward()
  }
}

export function installNativeHistoryNavigation(window: BrowserWindow): void {
  window.on("app-command", (event, command) => {
    const direction = directionForAppCommand(command)
    if (!direction) return

    event.preventDefault()
    navigateHistory(window, direction)
  })

  window.on("swipe", (event, swipeDirection) => {
    const direction = directionForSwipe(swipeDirection)
    if (!direction) return

    event.preventDefault()
    navigateHistory(window, direction)
  })

  if (process.platform === "darwin") {
    window.webContents.on("before-input-event", (event, input) => {
      const direction = directionForKeyboardInput(input)
      if (!direction) return

      event.preventDefault()
      navigateHistory(window, direction)
    })
  }
}
