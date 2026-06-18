# 0005 Local CLI Commit Refresh Socket

## Status

Accepted

## Date

2026-06-18

## Context

Agents can update a Flowm ledger through `flowm-cli --commit` while the desktop
app is open. Those writes go through the guarded API layer, but the renderer's
React Query cache does not know that another process changed the active SQLite
file. Without a notification path, users must navigate or reload before seeing
agent-written data.

## Decision

Flowm Desktop opens a local IPC socket from the Electron main process. After a
successful CLI commit, `flowm-cli` sends a best-effort `ledger.changed` event to
that socket. The event includes the written database path. The main process
forwards the event to renderer windows only when that path matches the active
ledger, and the renderer invalidates React Query state through the preload
bridge.

The socket is not a write API. Durable writes remain in `flowm-cli` and
`@flowm/api`.

## Consequences

- Open app windows refresh quickly after agent or developer CLI commits.
- CLI remains usable when the app is closed; notification failure is graceful and
  does not change stdout JSON.
- Socket path calculation must stay shared between the desktop app and CLI.
- Renderer code continues to respect the Electron boundary and never touches the
  socket or SQLite directly.
