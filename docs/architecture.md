# Flowm Desktop Architecture

Flowm Desktop is an Electron workspace with a TypeScript renderer and shared
business packages.

## Runtime Path

```text
React UI
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
- `packages/api` owns the product facade used by the UI.
- `packages/business` owns domain services and calculations.
- `packages/db` owns schema, migrations, and SQL execution primitives used by
  the main process.
- `packages/shared` owns shared primitives and utilities.
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
