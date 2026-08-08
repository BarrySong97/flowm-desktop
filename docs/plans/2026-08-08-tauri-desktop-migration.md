# Tauri Desktop Migration - Implementation Plan

- Date: 2026-08-08
- Related spec: Plane FLOWM-5
- Status: completed

## Approach

Replace Electron with Tauri v2 without changing Flowm's React product UI,
asymmetric finance model, SQLite schema, ledger file format, or user-visible
finance workflows. Preserve the existing TypeScript `@flowm/api`, tRPC router,
Drizzle schema, and `better-sqlite3` implementation in a private Node 22
sidecar bundled with the Tauri application.

There is no LocalStorage data implementation or SQLite compatibility
experiment. The first Tauri release is installed by downloading the latest
installer; there is no Electron-to-Tauri automatic-update bridge.

## Implemented Shape

- `apps/desktop/src-tauri/` owns the Rust shell, narrow commands, capabilities,
  production/development identifiers, embedded sidecar, resources, and bundle
  configuration.
- `apps/desktop/src/renderer/` remains the existing React renderer and reaches
  native/data operations only through `window.flowm`.
- `apps/desktop/src/tauri-sidecar/` hosts the existing tRPC, `@flowm/api`,
  Drizzle, and SQLite stack.
- `@yao-pkg/pkg` produces a target-specific self-contained sidecar so users do
  not install Node.
- Tauri's dialog and opener plugins provide ledger import, file reveal, and
  the manual download link.
- GitHub Actions builds and uploads Tauri DMG/NSIS installers.

## Tasks

1. [x] Add a Tauri v2 shell loading the existing renderer (FLOWM-6).
2. [x] Replace preload/main data IPC with narrow Rust commands backed by the
       existing tRPC/Drizzle/SQLite stack (FLOWM-7).
3. [x] Port ledger lifecycle, CLI refresh, navigation, file dialog, reveal, and
       app metadata; omit the waived updater bridge (FLOWM-8).
4. [x] Package the self-contained sidecar, switch releases to Tauri, remove
       Electron, and expose manual latest-download behavior (FLOWM-9).
5. [x] Run workspace, package, signature, and installed-app verification.

## Preserved Identity And Data

- Product name: `FlowM`
- Production identifier: `com.flowm.desktop`
- Development identifier: `com.flowm.desktop.dev`
- Production app data directory remains the identifier-backed existing
  location, so the current SQLite ledgers are reused directly.

## Verification

```bash
pnpm check-types
pnpm test
pnpm build
pnpm check-architecture
pnpm check-docs
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm -F desktop package
codesign --verify --deep --strict apps/desktop/src-tauri/target/release/bundle/macos/FlowM.app
```

The isolated `FlowM Dev.app` was launched against
`com.flowm.desktop.dev`; its data-backed dashboard, native dialog/reveal path,
and Tauri URL were verified without writing production data.
