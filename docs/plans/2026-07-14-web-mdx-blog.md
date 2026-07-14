# Web MDX Blog - Implementation Plan

- Date: 2026-07-14
- Related spec: none

## Approach

Port the build-time Velite/MDX blog pipeline and blog-body presentation from the
Post website into `apps/web`. Keep Flowm's existing navigation, footer, and
brand tokens; add blog links without replacing the shared site shell.

## Files And Modules

- `apps/web/content/blog` - author-maintained MDX posts.
- `apps/web/velite.config.ts` and `apps/web/lib/blog.ts` - content schema,
  compilation, filtering, sorting, and lookup.
- `apps/web/app/blog` and `apps/web/components/blog` - static list/detail routes,
  article rendering, responsive cards, and right-gutter table of contents.

## Tasks

1. [x] Add the Velite content pipeline and initial finance articles.
2. [x] Add the blog list, detail route, SEO, sitemap, and Flowm navigation links.
3. [x] Verify the static export, responsive layout, types, lint, formatting, and docs.

## Risks

Static export requires every published slug to be returned from
`generateStaticParams`. Velite's TOC slugger and rendered heading slugger must
stay aligned, and generated `.velite` output must remain untracked.

## Verification

Run `pnpm -F web check-types`, `pnpm -F web build`, `pnpm format:check`,
`pnpm lint`, `pnpm check-types`, `pnpm build`, and `pnpm check-docs`. Manually
verify list/detail navigation, heading anchors, responsive TOC visibility, and
scroll-spy highlighting.
