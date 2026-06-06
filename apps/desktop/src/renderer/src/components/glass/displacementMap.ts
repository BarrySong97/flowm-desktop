export interface DisplacementMapInput {
  width: number
  height: number
  radius: number
  /** Width of the refracting edge band, in pixels. */
  edge: number
  /** Falloff curve exponent — 1 = linear, >1 = softer center, <1 = sharper edge. */
  curve?: number
}

/**
 * Builds a PNG data URL whose R/G channels encode an outward refraction vector
 * for each pixel of a rounded rectangle. Pixels deeper than `edge` from the
 * border encode no displacement (128, 128). The result is consumed by an
 * SVG `<feDisplacementMap>` referenced through `backdrop-filter: url(...)`.
 */
export function buildDisplacementMapDataUrl({
  width,
  height,
  radius,
  edge,
  curve = 1.6,
}: DisplacementMapInput): string {
  if (typeof document === "undefined") return ""
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const ctx = canvas.getContext("2d")
  if (ctx == null) return ""
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data
  const w = canvas.width
  const h = canvas.height

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let dist: number
      let nx = 0
      let ny = 0
      const leftCorner = x < radius
      const rightCorner = x >= w - radius
      const topCorner = y < radius
      const bottomCorner = y >= h - radius
      const inCorner = (leftCorner || rightCorner) && (topCorner || bottomCorner)

      if (inCorner) {
        const cx = leftCorner ? radius : w - 1 - radius
        const cy = topCorner ? radius : h - 1 - radius
        const dxc = x - cx
        const dyc = y - cy
        const r = Math.sqrt(dxc * dxc + dyc * dyc)
        dist = radius - r
        if (r > 0.001) {
          nx = dxc / r
          ny = dyc / r
        }
      } else {
        const dxLeft = x
        const dxRight = w - 1 - x
        const dyTop = y
        const dyBottom = h - 1 - y
        const minHoriz = Math.min(dxLeft, dxRight)
        const minVert = Math.min(dyTop, dyBottom)
        if (minHoriz < minVert) {
          dist = minHoriz
          nx = dxLeft < dxRight ? -1 : 1
          ny = 0
        } else {
          dist = minVert
          nx = 0
          ny = dyTop < dyBottom ? -1 : 1
        }
      }

      let t = 1 - dist / edge
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const magnitude = Math.pow(t, curve)

      const idx = (y * w + x) * 4
      data[idx] = Math.round(128 + nx * magnitude * 127)
      data[idx + 1] = Math.round(128 + ny * magnitude * 127)
      data[idx + 2] = 128
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL("image/png")
}
