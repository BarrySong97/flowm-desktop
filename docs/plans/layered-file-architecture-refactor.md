# Layered File Architecture Refactor

## Context

The reference architecture at `/Users/songtianjian/Documents/post/docs/reference/frontend-backend-layered-architecture.md` recommends keeping shared contracts browser-safe, keeping transport adapters thin, moving user workflows into use cases, isolating pure domain rules, and placing side effects behind infrastructure adapters.

Flowm Desktop already has the runtime boundary:

```text
renderer -> preload/tRPC -> Electron main -> @flowm/api -> @flowm/db -> SQLite
```

The current weak point is inside `packages/api`, where SQLite access, workflow orchestration, mapping, and pure normalization helpers live together under `src/sqlite/`. Renderer code also imports some DTO-like types from `@flowm/api` instead of a browser-safe contract package.

## Target Shape

Use the existing monorepo packages rather than adding a new top-level `src/backend`:

```text
apps/desktop/src/renderer/          frontend
packages/shared/src/contracts/      browser-safe shared contracts
apps/desktop/src/main/trpc/         presentation / tRPC adapter
packages/api/src/use-cases/         application workflows
packages/api/src/domain/            pure business rules
packages/api/src/infrastructure/    database and side-effect adapters
packages/api/src/presentation/      transport-safe DTO mappers
packages/db/                        Drizzle schema and migrations
```

## First Migration Slice

1. Add browser-safe shared contracts for common primitives and asset DTO/input types.
2. Re-export those contracts from `@flowm/api` for compatibility while moving renderer asset imports toward `@flowm/shared/contracts`.
3. Move asset normalization into `packages/api/src/domain/assets/`.
4. Move asset SQLite row access into `packages/api/src/infrastructure/db/repositories/`.
5. Move SQLite row-to-contract mapping out of `sqlite/base.ts` into `packages/api/src/presentation/mappers/`.
6. Keep existing tRPC procedure names, database schema, and product behavior unchanged.

## Follow-Up Migration Order

1. Move shared cashflow, future obligation, budget, and reference DTOs into `packages/shared/src/contracts/`.
2. Extract repositories for cashflow, imports, subscriptions, loans, budgets, links, and reference data, matching the existing asset repository pattern.
3. Change remaining renderer type imports from `@flowm/api` to `@flowm/shared/contracts`.
4. Add boundary checks once the package graph is stable enough to enforce them.

## Second Migration Slice

Completed after the first asset slice:

1. Moved facade-compatible implementation files from `packages/api/src/sqlite/` into `packages/api/src/use-cases/*/*-api.ts`.
2. Moved the shared SQLite base class into `packages/api/src/infrastructure/db/sqlite-api-base.ts`.
3. Left `packages/api/src/sqlite/` as thin compatibility re-exports for older package-internal imports.
4. Pointed `createFlowmApi` at `packages/api/src/use-cases/dashboard/dashboard-api.ts`.

## Third Migration Slice

Completed after the directory migration:

1. Moved remaining Drizzle/schema-facing facade implementations into `packages/api/src/infrastructure/db/repositories/*-api.repository.ts`.
2. Reduced `packages/api/src/use-cases/*/*-api.ts` to boundary wrappers that do not import Drizzle, `@flowm/db`, or access `this.db`.
3. Added `scripts/check-architecture.mjs` and `pnpm check-architecture` to enforce the dependency direction.
4. Extended architecture checks so shared contracts remain browser-safe and `packages/api/src/sqlite/` remains thin compatibility glue.

## Final Boundary Cleanup

Completed after the third migration slice:

1. Kept the multi-step asset snapshot upsert workflow in `packages/api/src/use-cases/assets/upsert-asset-snapshot.ts`.
2. Removed the duplicate upsert workflow from the asset repository class so infrastructure stays focused on persistence.
3. Wired the final `FlowmSqliteApi` facade to call the asset upsert use-case facade explicitly.

## Verification

Run the smallest meaningful checks first:

```bash
pnpm -F @flowm/shared check-types
pnpm -F @flowm/api check-types
pnpm -F @flowm/api test
pnpm check-docs
```

Broaden to `pnpm check-types`, `pnpm test`, and `pnpm build` if time and native dependency state allow.
