# Source Analysis Workflow

Use this workflow for arbitrary user-provided financial material: CSV, PDF, Word,
spreadsheets, screenshots, pasted text, statements, contracts, chats, or notes.

## Steps

1. Inspect the material before choosing a parser or target object.
2. Identify source name, file hash when available, row ids or stable source ids,
   dates, amounts, currency, direction, counterparty, account hints, and
   confidence.
3. Decide the Flowm object type using `product-model.md`.
4. Normalize facts into business operations.
5. Run `pnpm --silent flowm-cli apply-patch <patch.json|-> --dry-run` first and
   report created, skipped, conflicts, warnings, and ambiguous facts.
6. Commit only after approval or clear instruction.
7. Persist reusable extraction rules only after the source pattern is understood.

When reclassifying already imported data, use `cashflow.classify` instead of
creating another transaction. Prefer `sourceName + sourceExternalId` as the
target when the source id is known.

## Source Ids

Prefer platform order ids. If no id exists, derive a deterministic
`sourceExternalId` from source name, date/time, amount, currency, counterparty,
payment method, and file hash. Never use an unstable row number alone.

## Ambiguity

- If direction is unclear, do not invent income/expense semantics.
- If a text extraction is low confidence, leave a warning.
- If a balance is only implied by transactions, do not create an asset snapshot.
- If a recurring payment is likely but not certain, create a review suggestion or
  low-confidence link rather than a durable plan.

## Privacy

Do not log full raw financial files, credentials, identity numbers, phone
numbers, or unnecessary personally identifiable data. Summaries should include
counts, hashes, and high-level decisions, not full source contents.
