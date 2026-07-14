# 0007. Build The Web Blog With Velite

- Status: accepted
- Date: 2026-07-14

## Context

The statically exported Flowm marketing site needs author-maintained MDX posts,
typed frontmatter, derived excerpts and reading time, heading anchors, a table of
contents, and one generated route per published slug. Runtime filesystem access
is unavailable on Cloudflare Pages static hosting.

## Decision

Compile `apps/web/content/blog/**/*.mdx` with Velite before type checking and as
part of the Next.js development/build startup. Import the generated `.velite`
collection from App Router pages, filter drafts centrally, and statically export
the blog list and detail routes.

## Rationale

Velite provides the required schema validation, typed generated data, MDX
compilation, excerpts, reading metadata, and nested TOC in one build-time layer.
`rehype-slug` keeps rendered heading ids aligned with Velite's TOC anchors, and
the output remains compatible with the site's existing `output: "export"` model.

## Consequences

The generated `.velite` directory is ignored and must be recreated before a
fresh type check. New blog content follows the frontmatter schema in
`velite.config.ts`; drafts are absent from routes and sitemap. Changes to the MDX
compiler or schema must preserve static export and heading/TOC slug alignment.
