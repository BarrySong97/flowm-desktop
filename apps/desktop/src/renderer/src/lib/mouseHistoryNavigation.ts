/**
 * @purpose Map browser-native mouse and keyboard navigation inputs to router history.
 * @role    Browser-safe renderer adapter for every Tauri desktop platform.
 * @deps    DOM mouse/keyboard events and a narrow back/forward history controller.
 * @gotcha  Prevent native auxiliary-click defaults before changing TanStack Router history.
 */

type HistoryController = {
  back: () => void
  forward: () => void
}

export function directionForMouseButton(button: number): "back" | "forward" | null {
  if (button === 3) return "back"
  if (button === 4) return "forward"
  return null
}

export function directionForHistoryKey(
  input: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">,
): "back" | "forward" | null {
  if (input.key === "BrowserBack") return "back"
  if (input.key === "BrowserForward") return "forward"
  if (!input.metaKey || input.altKey || input.ctrlKey || input.shiftKey) return null
  if (input.code === "BracketLeft") return "back"
  if (input.code === "BracketRight") return "forward"
  return null
}

export function installMouseHistoryNavigation(
  history: HistoryController,
  target: Window = window,
): () => void {
  const onMouseDown = (event: MouseEvent) => {
    const direction = directionForMouseButton(event.button)
    if (!direction) return

    event.preventDefault()
    event.stopPropagation()
    history[direction]()
  }

  const preventAuxiliaryDefault = (event: MouseEvent) => {
    if (!directionForMouseButton(event.button)) return
    event.preventDefault()
  }

  target.addEventListener("mousedown", onMouseDown, true)
  target.addEventListener("auxclick", preventAuxiliaryDefault, true)

  return () => {
    target.removeEventListener("mousedown", onMouseDown, true)
    target.removeEventListener("auxclick", preventAuxiliaryDefault, true)
  }
}

export function installKeyboardHistoryNavigation(
  history: HistoryController,
  target: Window = window,
): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    const direction = directionForHistoryKey(event)
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    history[direction]()
  }

  target.addEventListener("keydown", onKeyDown, true)
  return () => target.removeEventListener("keydown", onKeyDown, true)
}
