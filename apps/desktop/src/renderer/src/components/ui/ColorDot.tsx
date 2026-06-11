interface ColorDotProps { color: string; size?: number; className?: string }

export function ColorDot({ color, size = 7, className = "" }: ColorDotProps) {
  return (
    <span
      className={`inline-block rounded-full flex-none ${className}`}
      style={{ background: color, width: size, height: size }}
    />
  )
}
