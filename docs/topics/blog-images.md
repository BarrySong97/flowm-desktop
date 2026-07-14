# Blog Image Pipeline

## Purpose

Flowm's blog image pipeline combines a local authoring CLI with a runtime image
component. It compresses article images, uploads immutable content-addressed
objects to Cloudflare R2, embeds a ThumbHash placeholder in MDX, and renders a
lazy-loading image that can expand into a lightbox.

## Authoring Workflow

1. Copy `.env.example` to the ignored `.env` file and fill the R2 credentials.
2. Add local images to an article with standard Markdown image syntax. Paths may
   be relative to the MDX file, under `apps/web/public`, or repository-relative.
3. Run `pnpm img <slug> --dry-run` to inspect processing without upload or file
   changes, then run `pnpm img <slug>` to upload and rewrite the MDX.

The CLI accepts either the content slug or an explicit `.md`/`.mdx` path. It
also processes the frontmatter `cover` field. A processed cover receives
`coverWidth`, `coverHeight`, and `coverThumbhash` fields.

## Processing Contract

- Sharp applies EXIF orientation, limits width to 1600px without upscaling, and
  encodes WebP at quality 80.
- The final WebP bytes are named with the first 32 hexadecimal characters of a
  BLAKE2b-512 digest, producing `blog/<hash>.webp` by default.
- A base64 ThumbHash is derived from a maximum 100x100 RGBA thumbnail and stored
  directly in MDX, avoiding a separate placeholder request.
- R2 uploads use `Cache-Control: public, max-age=31536000, immutable`.
- Markdown images are rewritten as self-contained `<BlogImage>` elements with
  URL, dimensions, alt text, and ThumbHash. Existing components and processed
  covers are idempotently skipped.

## Runtime Behavior

`apps/web/components/blog/BlogImage.tsx` decodes the ThumbHash into an average
background color and blurred PNG data URL, reserves the image aspect ratio, and
fades in the lazy-loaded WebP. Zoomable images open in a standard-image lightbox
with a Motion shared-layout transition; backdrop click, close button, and Escape
all close it, while body scrolling is locked.

The lightbox deliberately reuses the processed WebP. It does not use WebGL
because the existing R2 origin does not guarantee the CORS headers needed for
texture loading, and the current pipeline does not upload a separate original.
