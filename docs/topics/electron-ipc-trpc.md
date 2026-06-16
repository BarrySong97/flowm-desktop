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

## Ledger Switching

Ledger switching is not a normal query parameter change. The Electron main process closes one SQLite connection and opens another, then rebuilds the `@flowm/api` facade against the new database.

Because React Query keys do not currently include the active ledger id, the renderer cannot rely on ordinary query invalidation after a switch. Use the shared ledger switch helper in `apps/desktop/src/renderer/src/lib/switchLedger.ts`, which clears renderer query state, navigates to a stable route, shows a transition overlay, and reloads the window.

Do not hand-roll ledger switching in individual pages. If a future implementation adds the active ledger id to every query key and proves all mounted routes refetch correctly, this reload requirement can be revisited.

## Files To Read

- `apps/desktop/src/main/index.ts`
- `apps/desktop/src/main/trpc/router.ts`
- `apps/desktop/src/main/ledgers.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/preload/index.d.ts`
- `apps/desktop/src/renderer/src/lib/switchLedger.ts`
