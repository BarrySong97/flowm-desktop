/**
 * @purpose Render the decorative macOS traffic-light dots for app mock frames.
 * @role    Shared visual chrome used by hero and feature-showcase mock windows.
 * @gotcha  Decorative only: keep aria-hidden and pointer-events disabled.
 */

type TrafficLightsProps = {
  className?: string
}

export function TrafficLights({ className = "" }: TrafficLightsProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-4 top-3 z-30 flex h-3 items-center gap-1.5 ${className}`}
    >
      <span className="h-3 w-3 rounded-full bg-[#e6635a] shadow-[inset_0_0_0_1px_rgba(106,34,30,0.14)]" />
      <span className="h-3 w-3 rounded-full bg-[#e4b04a] shadow-[inset_0_0_0_1px_rgba(113,76,19,0.14)]" />
      <span className="h-3 w-3 rounded-full bg-[#54b864] shadow-[inset_0_0_0_1px_rgba(28,91,43,0.14)]" />
    </div>
  )
}
