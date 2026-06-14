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
  db/        Drizzle schema, migrations, and typed database handle
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
pnpm check-docs
pnpm test
pnpm build
pnpm package
```

`pnpm test` runs Vitest through Electron's Node runtime after rebuilding native
dependencies for Electron. This keeps `better-sqlite3` on the same ABI used by
the desktop app.

## Agent Harness Docs

Agents should start at [AGENTS.md](AGENTS.md). Detailed run, testing, design,
module, topic, and decision docs live under [docs/](docs/). The documentation
sensor is:

```bash
pnpm check-docs
```

The renderer entry and route shell live in:

```text
apps/desktop/src/renderer/src/App.tsx
apps/desktop/src/renderer/src/routes/__root.tsx
```
