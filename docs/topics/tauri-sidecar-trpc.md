# Tauri Sidecar And tRPC Boundary

## Why This Exists

The React renderer is a browser environment. It must not import Node,
`better-sqlite3`, Drizzle, filesystem APIs, or arbitrary Rust commands. Flowm
keeps its existing TypeScript business layer in a private bundled Node sidecar
and exposes only narrow operations through Tauri.

## Flow

```text
React renderer
  -> tRPC client
  -> window.flowm.trpcRequest(operation)
  -> narrow Tauri Rust command
  -> private NDJSON Node sidecar
  -> tRPC router
  -> @flowm/api
  -> @flowm/db / better-sqlite3
  -> SQLite
```

Rust owns the child-process lifecycle and serializes requests through one
managed sidecar. Sidecar stdout is protocol-only; diagnostics go to stderr.
The renderer receives no shell, arbitrary filesystem, generic sidecar, or raw
SQL capability.

## Rules

- Renderer feature code does not import Node, Tauri Rust modules,
  `better-sqlite3`, Drizzle, or files under `src/main`/`src/tauri-sidecar`.
- Add renderer data workflows to the tRPC router and expose only the minimum
  native command needed for operations such as file selection or reveal.
- Keep `src/renderer/src/env.d.ts` aligned with
  `src/renderer/src/lib/desktop-runtime.ts`.
- Only `TauriLedgerStore` owns the active SQLite connection and ledger
  lifecycle.
- Do not introduce a LocalStorage data implementation or a second SQLite
  compatibility layer.

## Native History Navigation

TanStack Router owns hash history. The renderer maps mouse side buttons,
browser back/forward keys, and Command+[ / Command+] to that history on every
Tauri desktop platform. Do not add a second native history handler that would
double-navigate.

## External CLI Refresh

The sidecar owns a local ledger-change socket used by `flowm-cli` after a
successful `--commit`. The socket is a refresh hint only. Accepted events whose
database path matches the active ledger are queued in memory; the renderer
polls a narrow Rust drain command while `window.flowm.onLedgerChanged` has a
subscriber. All writes still pass through `@flowm/api`.

## Ledger Switching

Switching closes one SQLite connection and opens another. Because React Query
keys do not include the active ledger id, use the shared switch helper in
`src/renderer/src/lib/switchLedger.ts`; it clears query state, navigates to a
stable route, displays a transition, and reloads the window.

## Files To Read

- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src/renderer/src/lib/desktop-runtime.ts`
- `apps/desktop/src/renderer/src/env.d.ts`
- `apps/desktop/src/tauri-sidecar/index.ts`
- `apps/desktop/src/tauri-sidecar/ledger-store.ts`
- `apps/desktop/src/main/trpc/router.ts`
- `apps/desktop/src/main/trpc/transport.ts`
- `apps/desktop/src/main/local-ledger-change-server.ts`
