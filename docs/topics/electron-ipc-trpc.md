# Electron IPC And tRPC Boundary

## Why This Exists

The renderer is a browser environment. The Electron main process owns filesystem, SQLite, migrations, and native modules. tRPC over the preload bridge is the application boundary between them.

## Flow

```text
React renderer
  -> tRPC client
  -> window.flowm.trpcRequest(operation)
  -> Electron preload IPC
  -> Electron main tRPC router
  -> @flowm/api
  -> @flowm/db
  -> SQLite
```

## Rules

- Renderer code does not import `electron`, `better-sqlite3`, `node:fs`, or main-process modules.
- New renderer data workflows should be added to the main tRPC router and typed through the preload bridge.
- Keep `apps/desktop/src/preload/index.ts` and `index.d.ts` in sync.
- Main process code may use Node and Electron APIs; renderer feature code should stay browser-compatible.

## Files To Read

- `apps/desktop/src/main/index.ts`
- `apps/desktop/src/main/trpc/router.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/preload/index.d.ts`
