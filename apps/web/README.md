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
- `components/` — landing sections (`Nav`, `Hero`, `ThreeLayers`, `Features`,
  `Privacy`, `Creed`, `CTA`, `Footer`) plus `primitives` and `SectionHead`.
- `components/releases/ReleaseTimeline.tsx` — public release notes data and UI.
  `pnpm release <version>` validates that the first entry matches the target
  version and carries the only `badge: "latest"`.

## Styling

Theme tokens live in `app/globals.css` under the Tailwind v4 `@theme` block
(colors, fonts, the `blink` animation). `@heroui/styles` bundles Tailwind v4 and
the HeroUI theme; both `@heroui/styles` and `tailwindcss` come from the workspace
pnpm catalog (`pnpm-workspace.yaml`), shared with `apps/desktop`.
