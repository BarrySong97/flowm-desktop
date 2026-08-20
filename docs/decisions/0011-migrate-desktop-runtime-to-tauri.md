# 0011. Migrate The Desktop Runtime To Tauri

- Status: accepted
- Date: 2026-08-08
- Update: the manual-update-only decision was superseded by [0012](0012-add-signed-tauri-updates.md) on 2026-08-19.

## Context

Flowm previously shipped its React renderer inside Electron. The desktop
runtime needed to change without rewriting the product UI or changing the
asymmetric finance model, SQLite schema, ledger files, and user-visible data
workflows. The current user can download a new installer manually, so an
Electron-to-Tauri automatic-update bridge is unnecessary.

## Decision

Use Tauri v2 as the sole desktop runtime.

Keep the existing TypeScript tRPC router, `@flowm/api`, Drizzle schema, and
`better-sqlite3` implementation inside a private Node 22 sidecar. Package it as
a target-specific self-contained executable with `@yao-pkg/pkg`, embed it with
Tauri, and communicate through newline-delimited JSON owned by narrow Rust
commands. Do not expose generic process execution, filesystem access, or raw
SQL to the renderer.

Keep `FlowM` as the product name, `com.flowm.desktop` as the production
identifier/data identity, and `com.flowm.desktop.dev` for isolated development.
Do not add a LocalStorage data implementation or a second SQLite compatibility
layer.

Release macOS and Windows installers from GitHub Actions using Tauri. The app's
settings page opens the latest GitHub Release for manual download; there is no
in-app updater in this architecture.

## Rationale

Reusing the renderer and the tested TypeScript business/database stack limits
the migration to runtime boundaries. The bundled sidecar avoids a broad Rust
rewrite, keeps one SQLite owner, and requires no Node installation on the user
machine. Preserving the identifier keeps existing ledgers in place even though
the installer technology changes.

## Consequences

- Rust/Cargo and Node 22 are desktop build dependencies.
- `better-sqlite3` uses the Node 22 ABI for workspace tests, CLI development,
  and sidecar packaging.
- Release runners build the sidecar on the matching OS/architecture and sign
  the nested executable with the app.
- Electron main/preload code, Electron dependencies, electron-builder,
  electron-updater, and Electron release metadata are removed.
- Existing Electron installations are not upgraded automatically; users
  download and install the latest Tauri artifact.
