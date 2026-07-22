/**
 * @purpose Map macOS mouse side buttons to the application router history.
 * @role    Browser-safe renderer adapter for auxiliary mouse navigation.
 * @deps    DOM mouse events and a narrow back/forward history controller.
 * @gotcha  Install this only on macOS; Windows/Linux use Electron app-command events to avoid double navigation.
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
