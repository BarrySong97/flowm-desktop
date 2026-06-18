# Category Kind Boundaries

## Context

Flowm already stores category direction in `categories.category_kind`, but some
cashflow write and review paths can still treat categories as a flat name list.
That lets income and expense analysis appear mixed when category names overlap or
when an agent reclassifies a cashflow event without matching the event's
`flow_kind`.

## Plan

1. Keep the existing schema. Do not add a migration for this pass.
2. Make cashflow create/update and agent classification reject category ids whose
   `category_kind` does not match the cashflow event's expected category kind.
3. Make agent `cashflow.classify` infer the expected category kind from the
   target event unless the patch explicitly supplies the same kind.
4. Make the transaction review page filter categories by the active analysis
   kind and filter transactions by category id instead of category name.
5. Add API tests for income/expense category isolation and agent patch rejection.

## Validation

- Focused API tests for category kind guardrails.
- Desktop typecheck to catch renderer/API contract drift.
- Documentation check.
