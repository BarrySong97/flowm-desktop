# Web Blog Images - Implementation Plan

- Date: 2026-07-14
- Related spec: none

## Approach

Adapt Jade's blog image pipeline to Flowm's Velite/Next.js content structure:
keep the same Sharp, BLAKE2b, ThumbHash, R2, and Motion concepts while emitting
React-compatible `<BlogImage>` tags without Astro hydration directives.

## Files And Modules

- `scripts/img.mjs` and `scripts/lib` - local processing, R2 upload, and MDX rewrite.
- `apps/web/components/blog` - ThumbHash renderer, lightbox, and cover integration.
- `apps/web/content/blog` - replace sample content with the hosted accounting article.

## Tasks

1. [x] Port the local image CLI and credential template.
2. [x] Integrate ThumbHash/loading/lightbox behavior with Velite MDX and covers.
3. [x] Replace the three sample posts with the accounting article and existing R2 assets.
4. [x] Verify dry-run idempotence, image processing, types, static export, and sensors.

## Risks

Astro hydration props are invalid in the Next.js MDX runtime and must not be
copied. The CLI must never upload during dry-run, real credentials must remain
ignored, and heading/TOC behavior must stay independent of image rendering.

## Verification

Run the CLI against the migrated article with `--dry-run`, exercise the pure
image processor on a local image, then run web type checking/build plus workspace
format, lint, architecture, and documentation checks.
