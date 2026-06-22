# `apps/web` — Flowm marketing site

Next.js (App Router) + Tailwind CSS v4 + TypeScript landing page for Flowm.

## Commands

```bash
pnpm -F web dev          # next dev (http://localhost:3000)
pnpm -F web build        # next build
pnpm -F web start        # serve the production build
pnpm -F web check-types  # tsc --noEmit
```

## Layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`).
- `components/` — landing sections (`Nav`, `Hero`, `ThreeLayers`, `Features`,
  `Privacy`, `Creed`, `CTA`, `Footer`) plus `primitives` and `SectionHead`.

## Styling

Theme tokens live in `app/globals.css` under the Tailwind v4 `@theme` block
(colors, fonts, the `blink` animation). `@heroui/styles` bundles Tailwind v4 and
the HeroUI theme; both `@heroui/styles` and `tailwindcss` come from the workspace
pnpm catalog (`pnpm-workspace.yaml`), shared with `apps/desktop`.
