# Tauri Auto-Updater - Implementation Plan

- Date: 2026-08-19
- Status: in progress
- Reference implementation: `/Users/songtianjian/journal_todo`

## Goal

Replace the removed Electron updater path with Tauri v2 signed in-app updates.
FlowM should check the latest GitHub Release at startup, offer an explicit
install-and-restart action, and expose the same workflow from Settings.

## Constraints

- Preserve `com.flowm.desktop` so an update reuses the current ledgers.
- Keep the renderer behind the typed `window.flowm` adapter.
- Sign updater artifacts with a FlowM-specific key. Only the public key belongs
  in source; the encrypted private key stays outside the repository and in CI
  secrets.
- Do not silently install. Download and installation require a user action.
- Development builds must not check the production release feed.

## Implementation

1. Register Tauri's updater and process plugins and grant only their default
   updater/relaunch capabilities.
2. Enable updater artifacts and point production builds at the release-hosted
   `latest.json` signed by the FlowM updater key.
3. Add narrow `window.flowm` methods for checking, downloading, installing,
   progress reporting, and restarting.
4. Mount a production-only startup checker and replace Settings' manual
   download link with check/install/restart status.
5. Have release CI sign updater artifacts, upload their signatures and
   `latest.json`, prefer NSIS on Windows, and fail clearly when updater secrets
   are absent.
6. Update the runbook, desktop module, testing guide, and architecture ADR.

## Release And Verification

The already-installed `0.1.13` cannot acquire an updater by itself. Publish and
manually install the first updater-enabled baseline, then publish one further
version and verify that the baseline:

1. discovers the newer version;
2. downloads a signature-verified artifact;
3. installs it and relaunches;
4. reports the new application version while preserving the active ledger.

Run the desktop tests and type checks first, then workspace lint, formatting,
documentation, tests, type checks, and build. Validate the published
`latest.json` contains direct GitHub download URLs for every released desktop
platform.
