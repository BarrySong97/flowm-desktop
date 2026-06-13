# CLAUDE.md — `apps/desktop`

This app owns the Flowm Electron shell and React renderer.

## Responsibilities

- Electron main process and window lifecycle
- Preload API exposed on `window.flowm`, including tRPC IPC requests
- React renderer, routes, Jotai UI atoms, and feature pages
- Desktop packaging config

## Commands

```bash
pnpm -F desktop dev
pnpm -F desktop check-types
pnpm -F desktop test
pnpm -F desktop build
```

File-based TanStack Router routes live in `src/renderer/src/routes`; the
generated route tree is `src/renderer/src/routeTree.gen.ts`.
