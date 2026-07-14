# `apps/web` — Flowm marketing site

Next.js (App Router) + Tailwind CSS v4 + TypeScript landing page for Flowm.

## Commands

```bash
pnpm -F web dev          # next dev (http://localhost:3000)
pnpm -F web build        # next static export (writes apps/web/out)
pnpm -F web deploy:pages # build and deploy apps/web/out to flowmoney.pages.dev
pnpm -F web start        # serve the static export locally
pnpm -F web check-types  # tsc --noEmit
```

## Layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`).
- `app/blog/` — statically exported blog list and MDX detail routes.
- `components/` — landing sections (`Nav`, `Hero`, `ThreeLayers`, `Features`,
  `Privacy`, `Creed`, `CTA`, `Footer`) plus `primitives` and `SectionHead`.
- `components/blog/` — blog cards, ThumbHash-backed image/lightbox rendering,
  cover fallback, MDX renderer, and responsive right-gutter table of contents.
- `content/blog/` — author-maintained MDX articles. Frontmatter accepts `title`,
  `date`, `author`, `excerpt`, `cover`, processed-cover dimensions/ThumbHash, and
  `draft`.
- `velite.config.ts` — build-time content schema and MDX/TOC compilation.
- `components/releases/ReleaseTimeline.tsx` — public release notes data and UI.
  `pnpm release <version>` validates that the first entry matches the target
  version and carries the only `badge: "latest"`.

## Styling

Theme tokens live in `app/globals.css` under the Tailwind v4 `@theme` block
(colors, fonts, the `blink` animation). `@heroui/styles` bundles Tailwind v4 and
the HeroUI theme; both `@heroui/styles` and `tailwindcss` come from the workspace
pnpm catalog (`pnpm-workspace.yaml`), shared with `apps/desktop`.

The blog uses Velite to compile `content/blog/**/*.mdx` into the ignored
`.velite/` directory. Development watches the content tree; production builds
run one clean compilation before Next statically exports `/blog` and every
published `/blog/<slug>` page. Draft posts are excluded from routes and sitemap.

Blog images are prepared from the repository root with
`pnpm img <slug> [--dry-run]`. The pipeline compresses to a content-addressed
WebP, uploads to R2, generates an inline ThumbHash, and rewrites Markdown images
to `<BlogImage>`. See [Blog Image Pipeline](../../docs/topics/blog-images.md).
