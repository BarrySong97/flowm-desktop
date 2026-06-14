/**
 * @purpose Render the color dot renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

interface ColorDotProps { color: string; size?: number; className?: string }

export function ColorDot({ color, size = 7, className = "" }: ColorDotProps) {
  return (
    <span
      className={`inline-block rounded-full flex-none ${className}`}
      style={{ background: color, width: size, height: size }}
    />
  )
}
