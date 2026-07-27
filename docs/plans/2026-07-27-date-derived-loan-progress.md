# Date-Derived Loan Progress

## Problem

Loan payment occurrences remain forecasts after their due dates. If the UI
counts only rows explicitly marked `paid`, repayment progress stays frozen even
though scheduled installments have passed.

## Product Boundary

Repayment progress is a projection derived from the loan schedule and today's
local date. It must preserve Flowm's asymmetric model:

- count every non-skipped occurrence due on or before today as elapsed progress;
- derive remaining principal from the latest elapsed occurrence estimate;
- leave occurrence status and stored loan principal unchanged;
- never create cashflow, bind a cashflow event, or change an asset snapshot.

Manually linked cashflow remains optional explanatory evidence. It is not an
input to projected progress.

## Implementation

1. Derive displayed paid installments and remaining principal from due dates in
   the renderer schedule model.
2. Keep API occurrence generation forecast-only and extend schedules in the
   background so future rows are available.
3. Refresh open-ledger queries at the next local day boundary so the projection
   advances without an app restart.
4. Test the real schedule shape whose first two installments are due on
   2026-06-26 and 2026-07-26 while both database rows remain `forecast`.
5. Document the forecast-only boundary across presentation, API, database, and
   desktop modules.

## Verification

- [x] `pnpm test`
- [x] `pnpm check-types`
- [x] `pnpm check-architecture`
- [x] `pnpm check-docs`
- [x] `pnpm format:check`
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] Manual desktop verification against a production-ledger copy: the
      「手表+耳机」loan displayed 2/11 elapsed installments and CN¥2,448.45
      remaining principal while both due occurrences stayed `forecast`, no
      linked or generated loan cashflow appeared, and the production database
      remained unchanged.
