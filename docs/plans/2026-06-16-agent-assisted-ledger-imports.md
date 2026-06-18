# Agent-Assisted Ledger Imports - Implementation Plan

- Date: 2026-06-16
- Related spec: none

## Approach

Move platform-specific and format-specific parsing out of the product surface and
into an agent-assisted local workflow. User-provided material may be CSV, PDF,
Word, spreadsheet, screenshot, pasted text, or any other document shape. Flowm
should expose its ledger schema, business rules, and safe write helpers; the
agent should inspect the material and decide what Flowm objects to create.
Imported transaction rows should become product cashflow directly, with source
metadata and a source-unique record id on `cashflow_events`.

The product boundary should be an agent ledger kit: documentation, schema
guidance, and local helper APIs backed by Drizzle and the `@flowm/api` facade.
The agent first reads the docs, inspects the supplied source file or pasted data,
then writes or reuses a small import script for that specific shape. Agent-run
scripts may be local and iterative, but they must preserve the asymmetric model:

- imported source rows become actual past cashflow when imported;
- asset snapshots are present-state records and are not inferred from every
  transaction line;
- subscriptions and loans are forecasts unless an explicit user workflow turns a
  payment into actual cashflow.

## Files And Modules

- `docs/topics/agent-assisted-imports.md` - agent-facing workflow, guardrails,
  helper boundary, and persistence conventions.
- `docs/modules/api/README.md` - clarify that imports are cashflow materialized
  by an external agent workflow, not platform-specific parsing in the app.
- `docs/modules/db/README.md` - document that import metadata belongs on
  cashflow records for direct imported transactions.
- `skills/flowm-ledger-kit/` - open-source Codex skill that tells agents how to
  analyze arbitrary financial material and write Flowm ledger patches safely.
- `apps/desktop/src/renderer/src/imports/ImportsPage.tsx` - future copy update
  from "import bills" toward "cashflow review" if the app UI no longer owns
  file ingestion.
- `packages/cli/src/index.ts` - reusable ledger open, migration, dry-run,
  dedupe, and write CLI for agent-authored patches.

## Tasks

1. [x] Document the target workflow, interface choice, and safety boundaries for
       agent-assisted ledger writes from arbitrary user-provided material.
2. [x] Add import-source fields to `cashflow_events`, such as source name,
       source record id, file hash, and imported timestamp, with idempotent
       constraints.
3. [ ] Add a helper module that opens a ledger with Electron-compatible
       `better-sqlite3`, applies migrations, and exposes the `@flowm/api` facade to
       agent-authored extraction/import scripts.
4. [x] Add a reusable normalized import format for agent-produced cashflow
       entries, including source name, source record id, file hash, and imported
       timestamp.
5. [ ] Add normalized write helpers for non-cashflow objects that agents may
       extract from documents: categories, assets, budgets, subscriptions, loans, and
       object links.
6. [x] Add an optional runner command that executes an agent-authored script or
       applies normalized JSON; it should not pretend to parse unknown materials by
       itself.
7. [x] Add an open-source skill for agent-owned extraction and match workflows,
       with references for source analysis, product boundaries, repo navigation, and
       the patch contract.
8. [ ] Update the renderer cashflow page copy so it no longer implies built-in
       platform importers are the primary workflow.
9. [ ] Decide whether to migrate or retire `statement_imports` and
       `statement_lines` from the public API/UI once direct cashflow import is
       implemented.
10. [ ] Add tests around duplicate imports, category creation, direct imported
        cashflow creation, and "no asset balance inference" guarantees.
11. [ ] Run `pnpm check-docs`, then broaden to `pnpm check-types`, `pnpm test`,
        and `pnpm build` when implementation touches code.

Initial implementation note: the first code slice adds cashflow source identity
fields and `applyAgentLedgerPatch` with `category.ensure` and `cashflow.create`.
The broader ledger opener, runner command, open-source skill, and non-cashflow
patch operations remain follow-up work.

## Risks

- Direct table writes can bypass validation, idempotency, occurrence generation,
  category rules, and link semantics.
- Agent-created rules can overfit one user's merchant names and silently
  misclassify later data.
- Import scripts can leak raw financial files or personally identifiable data if
  they log too much.
- Automatically creating assets or loans from imported cashflow can violate the
  asymmetric model if the script treats transactions as a reconciled ledger.
- Source formats change and unstructured extraction can be uncertain, so parsers
  and document-specific rules must be local and easy to revise instead of baked
  into durable product code.

## Verification

Run `pnpm check-docs` for documentation-only changes. When the helper and skill
exist, verify them at three levels: schema/API, helper behavior, and agent
usability.

### Schema And API

- Migrate an existing ledger and verify old `cashflow_events` remain readable.
- Verify imported cashflow supports `sourceName`, `sourceExternalId`, optional
  file/source metadata, and imported timestamps.
- Verify manual cashflow can omit import source metadata.
- Verify duplicate `sourceName + sourceExternalId` imported cashflow cannot
  create two active records.
- Verify API summaries and renderer cashflow lists still work after adding import
  metadata fields.

### Helper Behavior

- Dry-run returns planned creates, skips, conflicts, warnings, and resolved
  references without writing any rows.
- Commit writes the same plan returned by dry-run when inputs and ledger state
  have not changed.
- A batch either fully commits or fully rolls back when one operation fails.
- Re-running the same imported cashflow patch skips duplicates.
- Re-running with the same source id but different amount, date, direction, or
  counterparty returns a conflict and does not overwrite user-edited fields.
- `category.ensure` is idempotent and does not create duplicate names for the
  same category kind.
- Asset snapshots are accepted only from explicit balance or valuation evidence,
  not from summed transaction rows.
- Loan and subscription operations create or update forecast objects only; they
  do not create actual cashflow unless an explicit cashflow operation is present.
- Loan plans do not create net-worth liabilities. Liability net worth changes
  require explicit liability asset snapshots.
- Destructive operations require an explicit soft-delete/archive operation and a
  reason; raw deletes are rejected.
- The public helper contract does not expose raw SQL, arbitrary table names, or a
  mutable `db` handle.

### Agent Skill Usability

- Validate the skill package metadata with the skill validation script once the
  open-source skill exists.
- Forward-test the skill in a fresh agent context with only the skill and a small
  raw sample, such as:
  - a CSV-like WeChat or Alipay excerpt;
  - pasted credit-card statement text;
  - a loan-contract paragraph;
  - an ambiguous asset statement with a balance and unrelated transactions.
- The fresh agent should read the skill, inspect the material, produce a
  normalized patch, call dry-run first, and avoid direct SQLite writes.
- The fresh agent should leave ambiguous facts as warnings or review items rather
  than making high-impact updates.
- The final run on a temporary ledger should produce expected row counts and a
  summary that matches the dry-run plan.

### Workspace Checks

- `pnpm check-docs`
- `pnpm check-architecture`
- `pnpm check-types`
- `pnpm test`
- `pnpm build` before shipping broad helper/schema changes.
