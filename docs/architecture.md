# Flowm Desktop Architecture

Flowm Desktop is an Electron workspace with a TypeScript renderer and shared
business packages.

## Runtime Path

```text
React UI
  -> @flowm/shared/contracts DTOs
  -> React Query / tRPC client
  -> Electron preload IPC
  -> Electron main tRPC router
  -> @flowm/api
  -> @flowm/db
  -> better-sqlite3 connection
  -> SQLite
```

The renderer never imports Node or Electron main-process modules directly.
Database calls cross the preload bridge through:

- `window.flowm.trpcRequest(operation)`
- `window.flowm.getDatabasePath()`
- `window.flowm.databaseExists()`

## Workspace Ownership

- `apps/desktop` owns the Electron app, preload bridge, renderer UI, routes,
  Vite config, and packaging config.
- `packages/api` owns the product facade used by the UI, with backend-style
  `domain/`, `use-cases/`, `infrastructure/`, and `presentation/` folders as
  modules migrate.
- `packages/db` owns schema, migrations, and SQL execution primitives used by
  the main process.
- `packages/shared` owns browser-safe contracts, shared primitives, and
  utilities.
- `packages/ui` owns reusable UI primitives and global styles.

## SQLite Location

The Electron main process explicitly points `app.getPath("userData")` at:

```text
~/Library/Application Support/com.flowm.desktop
```

The database file is:

```text
flowm.sqlite3
```

This preserves compatibility with the previous desktop app data location.

## Layered Package Shape

The workspace maps the frontend/backend layered reference architecture onto the
existing Electron monorepo:

```text
apps/desktop/src/renderer/          frontend
packages/shared/src/contracts/      shared contracts
apps/desktop/src/main/trpc/         presentation / tRPC adapter
packages/api/src/use-cases/         application workflows
packages/api/src/domain/            pure business rules
packages/api/src/infrastructure/    database and side-effect adapters
packages/api/src/presentation/      renderer-safe DTO mappers
packages/db/                        Drizzle schema and migrations
```

Renderer code should prefer `@flowm/shared/contracts` for DTO-like types.
Backend code may re-export contracts from `@flowm/api` for compatibility, but
shared contracts must not import API, DB, Electron, or renderer modules.

## Validation

```bash
pnpm install
pnpm check-types
pnpm test
pnpm build
pnpm -F desktop dev
```

When validating against the existing database, open the app and confirm that
the dashboard and data-backed pages load without creating sample data or
performing write actions.
