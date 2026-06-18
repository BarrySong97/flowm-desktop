# 0004. Agent Ledger Patches

- Status: accepted
- Date: 2026-06-16

## Context

Flowm is intended to work with AI agents that can inspect arbitrary user-provided
financial material, such as CSV, PDF, Word, screenshots, pasted text, statements,
contracts, and notes. The source format is not stable enough to justify durable
platform-specific importers in the app.

At the same time, the SQLite file is user data. Letting agents freely mutate
tables would bypass product rules, validation, idempotency, and the asymmetric
finance model.

## Decision

Agents should write Flowm data by submitting business-level ledger patches, not
by issuing raw SQL or mutating arbitrary tables.

Flowm will expose:

- an open-source skill that tells agents how to understand the Flowm ledger model
  and source material;
- a local `flowm-cli` that lets agents inspect ledger context and submit patch
  JSON without knowing how to open SQLite;
- typed patch operations such as `category.ensure` and `cashflow.create`;
- a guarded API method that validates patches, supports dry-run, checks
  conflicts, and commits accepted operations through the Flowm API/database
  boundary.

Imported transaction rows are cashflow records. They should carry source metadata
on `cashflow_events`, including source name and source-specific record id, so
re-imports are idempotent.

## Rationale

This keeps AI flexible where it is useful: interpreting arbitrary source
material, extracting facts, and deciding which Flowm business objects to create.
It keeps Flowm strict where user data is at risk: writes go through domain rules,
migrations, Drizzle schema objects, and typed API contracts.

This avoids growing a permanent collection of brittle platform parsers while
still making repeated imports reliable through source-specific ids and local
agent-authored rules.

## Consequences

- Agent write capability is broad at the business-object level, but not at the
  raw SQLite table level.
- Every new patch operation needs explicit validation, dry-run behavior,
  conflict behavior, and tests.
- Imported cashflow needs source identity fields and a uniqueness constraint.
- Skill documentation and helper contracts must stay synchronized with the
  product model.
- Direct table writes remain acceptable only for migrations, low-level
  repositories, and controlled internal scripts.
