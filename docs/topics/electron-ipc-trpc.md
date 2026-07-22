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

## Native History Navigation

TanStack Router owns renderer route history through `createHashHistory()`. Native
browser-style navigation inputs are adapted at the platform boundary:

- Electron `app-command` events drive `WebContents.navigationHistory` on
  Windows and Linux.
- Electron window `swipe` events drive the same history on macOS.
- Raw macOS mouse side buttons are handled as DOM buttons 3/4 in the renderer.
  Drivers that synthesize the standard browser shortcuts Command+[ and
  Command+] are captured in the main process. Electron does not expose
  `app-command` on macOS.

Keep the macOS DOM listener platform-gated so one physical input cannot be
handled by both Electron and the renderer on Windows or Linux.

## External CLI Refresh

The desktop main process owns a local ledger-change socket used by `flowm-cli`
after successful `--commit` writes. This socket carries refresh hints only:
`flowm-cli` writes through `@flowm/api`, then notifies the running app with the
changed database path. The main process checks that path against the active
ledger and forwards valid events over preload as `window.flowm.onLedgerChanged`.
Renderer code responds by invalidating React Query state; it does not read the
socket or database directly.

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
