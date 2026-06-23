# Release Automation

## Goal

Add a one-command release path for FlowM after the human/AI-written release
note is added to the marketing site.

## Scope

- Add a release note source at `apps/web/components/releases/ReleaseTimeline.tsx`.
- Add `pnpm release <version>` backed by `scripts/release.mjs`.
- Bump root, desktop, web, and CLI package versions.
- Commit, push `main`, tag `v<version>`, wait for the tag-triggered GitHub
  Actions release build, then publish the draft release as latest and publish
  `@barrysongdev4real/flowm-cli` to npm.
- Keep optional Homebrew cask support configurable but disabled by default until
  a tap repository exists.
- Update docs so the release operator has a short runbook.

## Validation

- `node scripts/release.mjs <current-version> --dry-run --no-wait --no-publish --no-cask`
- `pnpm -F web check-types`
- `pnpm check-docs`
