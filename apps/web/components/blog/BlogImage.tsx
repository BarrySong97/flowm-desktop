"use client"

/**
 * @purpose Render ThumbHash-backed blog images with lazy fade-in and an animated lightbox.
 * @role    Shared runtime image component used by MDX content and processed article covers.
 * @deps    React, Motion shared-layout animation, and thumbhash decoding.
 * @gotcha  The lightbox deliberately uses a normal img instead of WebGL because
 *          the existing R2 origin does not guarantee texture-compatible CORS headers.
 */

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash"

interface BlogImageProps {
  src: string
  alt: string
  width: number
  height: number
  thumbhash?: string
  className?: string
  imageClassName?: string
  zoomable?: boolean
  aspectRatio?: string
  loading?: "eager" | "lazy"
}

const MORPH = { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const }

function classNames(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(" ")
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function BlogImage({
  src,
  alt,
  width,
  height,
  thumbhash,
  className,
  imageClassName,
  zoomable = true,
  aspectRatio,
  loading = "lazy",
}: BlogImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const layoutId = useId()

  const placeholder = useMemo(() => {
    if (!thumbhash) return null

    try {
      const bytes = base64ToBytes(thumbhash)
      const { r, g, b, a } = thumbHashToAverageRGBA(bytes)
      return {
        averageColor: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
          b * 255,
        )}, ${a})`,
        dataUrl: thumbHashToDataURL(bytes),
      }
    } catch {
      return null
    }
  }, [thumbhash])

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setLoaded(true)
  }, [src])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <>
      <figure
        className={classNames("relative overflow-hidden rounded-md", className)}
        style={{
          aspectRatio: aspectRatio ?? `${width}/${height}`,
          backgroundColor: placeholder?.averageColor,
          backgroundImage: placeholder ? `url(${placeholder.dataUrl})` : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <motion.img
          ref={imageRef}
          layoutId={layoutId}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onClick={zoomable ? () => setOpen(true) : undefined}
          className={classNames(
            "h-full w-full object-cover transition-opacity duration-700 ease-out",
            open ? "opacity-0" : loaded ? "opacity-100" : "opacity-0",
            zoomable && "cursor-zoom-in",
            imageClassName,
          )}
        />
      </figure>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="图片查看器"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              aria-label="关闭图片"
              onClick={(event) => {
                event.stopPropagation()
                setOpen(false)
              }}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <motion.img
              layoutId={layoutId}
              src={src}
              alt={alt}
              onClick={(event) => event.stopPropagation()}
              transition={MORPH}
              className="max-h-full max-w-full cursor-zoom-out rounded-sm object-contain shadow-2xl"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
