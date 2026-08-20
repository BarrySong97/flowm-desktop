# 0012. Add Signed Tauri In-App Updates

- Status: accepted
- Date: 2026-08-19
- Supersedes: the manual-update-only part of [0011](0011-migrate-desktop-runtime-to-tauri.md)

## Context

The initial Electron-to-Tauri migration deliberately omitted an updater bridge,
so Settings could only open the latest GitHub Release. That made the first
runtime migration simple, but every later release still required a manual DMG
or NSIS installation. The old Electron updater cannot consume Tauri artifacts
or metadata.

## Decision

Use Tauri v2's official updater and process plugins. Production builds check a
static `latest.json` hosted on the latest GitHub Release. Update bundles are
signed with a FlowM-specific updater key in addition to the platform's normal
code signing and notarization. The public updater key is embedded in
`tauri.conf.json`; the encrypted private key and password are CI secrets and
must never enter the repository.

The renderer accesses checking and installation through narrow typed
`window.flowm` methods. It checks once on startup and also exposes a manual
check in Settings. Installation always requires an explicit user action and
relaunches only after the signed update has installed.

## Consequences

- The first updater-enabled Tauri build still requires manual installation.
- Every later release must retain the same updater key, produce updater
  artifacts and signatures, and publish valid macOS ARM64 and Windows x64
  entries in `latest.json`.
- Losing the updater private key or password breaks the update path for every
  installed updater-enabled build; the local encrypted key requires an
  independent secure backup.
- Release CI fails when updater signing secrets or supported-platform metadata
  are missing.
