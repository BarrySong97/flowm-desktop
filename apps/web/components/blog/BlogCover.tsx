/**
 * @purpose Render an article cover or a title-seeded gradient placeholder.
 * @role    Shared visual used by blog cards, featured posts, and article details.
 * @deps    BlogImage plus Flowm website surface and border theme tokens.
 * @gotcha  Processed covers use their ThumbHash; unprocessed/local covers still
 *          fall back to a plain image, and missing covers retain stable geometry.
 */

import { BlogImage } from "./BlogImage"

interface BlogCoverProps {
  cover?: string
  width?: number
  height?: number
  thumbhash?: string
  title: string
  className?: string
  aspectRatio?: string
  zoomable?: boolean
}

export function BlogCover({
  cover,
  width,
  height,
  thumbhash,
  title,
  className = "",
  aspectRatio,
  zoomable = false,
}: BlogCoverProps) {
  const frame = `relative overflow-hidden bg-surface-2 ${className}`

  if (cover && width && height) {
    return (
      <BlogImage
        src={cover}
        alt={title}
        width={width}
        height={height}
        thumbhash={thumbhash}
        className={className}
        aspectRatio={aspectRatio}
        zoomable={zoomable}
        imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  if (cover) {
    return (
      <div className={frame}>
        <img
          src={cover}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    )
  }

  const initial = title.trim().charAt(0).toUpperCase() || "F"

  return (
    <div className={frame}>
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-hair">
        <span className="text-4xl font-bold tracking-tight text-ink/25">{initial}</span>
      </div>
    </div>
  )
}
