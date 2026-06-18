# Conventions

## Naming

- Directories and files: follow the surrounding package style. Renderer feature folders use domain names such as `assets`, `budget`, `imports`, `loans`, and `subscriptions`.
- Variables and functions: `camelCase`.
- Types, React components, and classes: `PascalCase`.
- Constants: use `UPPER_SNAKE_CASE` only for true constants; otherwise prefer named `const` values.

## Formatting And Linting

- Use Oxfmt for formatting and Oxlint for JavaScript/TypeScript linting.
- Run `pnpm format:check` before broad verification; use `pnpm format` only when you intend to write formatting changes.
- Run `pnpm lint` after tooling, shared code, or cross-package TypeScript changes.

## Architecture Boundaries

- Renderer code must not import Electron main-process modules or open SQLite directly.
- The preload bridge is the renderer boundary. Add typed preload APIs in `apps/desktop/src/preload` and serve product operations through the main tRPC router.
- Product-facing data access belongs in `packages/api`; schema and migrations belong in `packages/db`.
- `packages/shared` must stay platform-light and reusable. Do not put Electron, DOM, or database concerns there.
- `packages/ui` owns reusable primitives and styles, not product-specific finance workflows.

## Renderer UI Rules

- Prefer existing HeroUI controls and local renderer primitives before building
  custom controls. Tabs, selects, inputs, buttons, modals, drawers, labels,
  calendars, and form fields should not be hand-rolled when HeroUI already
  covers the behavior.
- Prefer Tailwind `className` utilities for renderer layout, spacing,
  typography, borders, radius, shadows, and token colors.
- Use inline `style` only for values that are genuinely dynamic at runtime,
  chart-library object props, or CSS values that Tailwind cannot express
  cleanly. Do not use inline styles as the default way to design new UI.
- When touching an old component with nearby inline styles, avoid expanding that
  pattern. New UI in the same file should still follow HeroUI and Tailwind first.

## Database Rules

- Use Drizzle query builder against the exported `@flowm/db` schema.
- Do not use raw SQL strings or `db.$client` from product code.
- `sql\`...\`` fragments are allowed for expressions Drizzle cannot represent directly, such as aggregate expressions or window functions.
- Imported cashflow, asset snapshots, and future obligations are separate domain layers; do not create implicit reconciliation logic.

## File Headers

Handwritten source files should carry a compact AI header near the top:

```ts
/**
 * @purpose What this file is responsible for.
 * @role    How it participates in the module.
 * @deps    Important local dependencies or runtime boundaries.
 * @gotcha  Constraints future agents must not miss.
 */
```

Do not duplicate function signatures or implementation details in headers.

Generated files and ambient tool declarations should be excluded in `check-docs.config.json` instead of edited. Current examples are `apps/desktop/src/renderer/src/routeTree.gen.ts` and `apps/desktop/src/renderer/src/vite-env.d.ts`.

## Errors And User Data

- Prefer explicit errors at process boundaries and clear UI error states in the renderer.
- Do not log secrets, raw financial files, or unnecessary personally identifiable data.
- Treat the SQLite file as user data. Avoid destructive writes unless the feature explicitly calls for them.

## Commits

- Use Conventional Commit style: `type(scope): subject`.
- Keep commits focused. Document durable architectural changes in [decisions](decisions/) as well as code.

## Review Checklist

- [ ] The change respects the asymmetric finance model.
- [ ] Electron main/preload/renderer boundaries remain intact.
- [ ] SQLite access goes through the Drizzle-backed API layer.
- [ ] Relevant module docs and file headers are updated.
- [ ] Tests or manual verification cover the changed behavior.
- [ ] `pnpm check-docs` has no hard failures.
