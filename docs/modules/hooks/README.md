# Harness Hooks

## Responsibility

`scripts/check-docs.mjs` and `scripts/hooks/*` provide the first harness sensors for documentation drift and common unsafe agent actions.

## Key Files

- `scripts/check-docs.mjs` - checks AI file headers, local markdown links, and module doc drift.
- `scripts/hooks/guard.mjs` - blocks high-risk shell commands in AI tool hooks.
- `scripts/hooks/guard-files.mjs` - blocks edits to sensitive files such as `.env` and keys.
- `scripts/hooks/format-lint.mjs` - optional post-edit lint/format feedback hook.
- `scripts/hooks/pre-commit` - optional git hook entry point.
- `.claude/settings.json` - Claude Code hook wiring.
- `.codex/hooks.json` and `.codex/config.toml` - Codex hook wiring.

## Data Flow

AI tool event JSON is passed to hook scripts on stdin. Scripts either stay silent or return hook-specific JSON that denies the action or feeds extra context back to the agent.

## Interfaces

- Manual check: `pnpm check-docs`.
- Stop hook check: `node scripts/check-docs.mjs --hook`.
- Strict audit: `node scripts/check-docs.mjs --strict`.

## Watchouts

- Hooks are guardrails, not security boundaries.
- `check-docs.config.json` currently scopes header enforcement to `scripts/` so the harness can start incrementally. Expand `sourceRoots` as modules receive file headers.
