# Flowm Desktop

Flowm Desktop is the Electron + React implementation of Flowm.

## Architecture

- Runtime shell: Electron, built with electron-vite
- UI: React, TanStack Router, Zustand, Tailwind CSS, HeroUI, shadcn-style local primitives
- Business layer: TypeScript packages under `packages/*`
- Data: SQLite through Electron IPC

The workspace is organized as:

```text
apps/
  desktop/   Electron main/preload process plus React renderer
packages/
  api/       Product facade used by the renderer
  business/  Domain services
  db/        SQLite schema, migrations, storage adapter, SQL executor
  shared/    Shared types and utilities
  ui/        Shared UI primitives and styles
```

At runtime, the renderer talks to the Electron main process through tRPC IPC.
The main process owns the SQLite connection, runs migrations, and serves
product APIs backed by `@flowm/api` and `@flowm/db` against:

```text
~/Library/Application Support/com.flowm.desktop/flowm.sqlite3
```

That path intentionally matches the previous desktop app data directory so the
Electron app can read the existing Flowm SQLite database.

## Commands

```bash
pnpm install
pnpm dev
pnpm check-types
pnpm test
pnpm build
pnpm package
```

The main workbench lives in:

```text
apps/desktop/src/renderer/src/components/terminal/TerminalApp.tsx
```
