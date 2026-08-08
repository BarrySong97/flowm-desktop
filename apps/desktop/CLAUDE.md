# CLAUDE.md — `apps/desktop`

This app owns the Flowm Tauri shell, bundled Node data sidecar, and React renderer.

## Responsibilities

- Tauri Rust process and native window lifecycle
- Browser-safe adapter exposed on `window.flowm`, including private tRPC requests
- Bundled Node sidecar owning Drizzle/SQLite and ledger lifecycle
- React renderer, routes, Jotai UI atoms, and feature pages
- Desktop packaging config

## Commands

```bash
pnpm -F desktop dev
pnpm -F desktop check-types
pnpm -F desktop test
pnpm -F desktop build
pnpm -F desktop package
```

File-based TanStack Router routes live in `src/renderer/src/routes`; the
generated route tree is `src/renderer/src/routeTree.gen.ts`.
