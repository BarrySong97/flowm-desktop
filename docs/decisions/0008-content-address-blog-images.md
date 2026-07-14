# 0008. Use Content-Addressed R2 Images With Inline ThumbHash

- Status: accepted
- Date: 2026-07-14

## Context

Blog articles need hosted images without committing large source assets, layout
shift, blank loading states, duplicate uploads, or mutable cache keys. The site
is statically exported, while authors need a repeatable local workflow that can
update MDX without runtime storage access.

## Decision

Process blog images locally with Sharp, name the final WebP from its BLAKE2b
content hash, upload it to Cloudflare R2 with immutable caching, and write image
dimensions plus an inline base64 ThumbHash into MDX. Render processed images
through a shared React `BlogImage` component with lazy fade-in and a Motion
lightbox.

## Rationale

Content-addressed names deduplicate identical output and make immutable caching
safe. ThumbHash provides a compact, self-contained placeholder without another
network request. Keeping processing in a CLI preserves the static hosting model
and keeps credentials out of the web runtime.

## Consequences

Authors must configure an ignored `.env` before uploading, while dry-run remains
credential-free. The component currently uses the processed WebP in the
lightbox; supporting full-resolution originals would require an additional
uploaded variant and MDX field. The checked-in `.env.example` is explicitly
allowed by the secret-file guard, but real `.env` files remain blocked and
ignored.
