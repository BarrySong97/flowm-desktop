# Conventions

## Naming

- Directories and files: follow the surrounding package style. Renderer feature folders use domain names such as `assets`, `budget`, `imports`, `loans`, and `subscriptions`.
- Variables and functions: `camelCase`.
- Types, React components, and classes: `PascalCase`.
- Constants: use `UPPER_SNAKE_CASE` only for true constants; otherwise prefer named `const` values.

## Architecture Boundaries

- Renderer code must not import Electron main-process modules or open SQLite directly.
- The preload bridge is the renderer boundary. Add typed preload APIs in `apps/desktop/src/preload` and serve product operations through the main tRPC router.
- Product-facing data access belongs in `packages/api`; schema and migrations belong in `packages/db`.
- `packages/shared` must stay platform-light and reusable. Do not put Electron, DOM, or database concerns there.
- `packages/ui` owns reusable primitives and styles, not product-specific finance workflows.

## Database Rules

- Use Drizzle query builder against the exported `@flowm/db` schema.
- Do not use raw SQL strings or `db.$client` from product code.
- `sql\`...\`` fragments are allowed for expressions Drizzle cannot represent directly, such as aggregate expressions or window functions.
- Imported cashflow, asset snapshots, and future obligations are separate domain layers; do not create implicit reconciliation logic.

## File Headers

New and substantially changed source files should carry a compact AI header near the top:

```ts
/**
 * @purpose What this file is responsible for.
 * @role    How it participates in the module.
 * @deps    Important local dependencies or runtime boundaries.
 * @gotcha  Constraints future agents must not miss.
 */
```

Do not duplicate function signatures or implementation details in headers.

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
