# 0009. Derive Loan Progress From Due Dates

- Status: accepted
- Date: 2026-07-27

## Context

Loan payment occurrences are future-plan records and intentionally remain
forecasts. Counting only occurrences whose stored status is `paid` leaves the
visible repayment progress frozen unless a separate cashflow workflow mutates
the plan.

Passing a scheduled due date is enough to advance projected progress. It is not
evidence that an actual expense occurred, so it must not manufacture past
cashflow or modify present assets.

## Decision

Loan progress is derived at read time from schedule dates.

- Every non-skipped occurrence due on or before the local current date counts
  toward displayed progress.
- Displayed remaining principal uses the latest elapsed occurrence's estimate,
  while preserving a lower manually stored estimate when one exists.
- Occurrence status remains forecast data and is not changed when time passes.
- No cashflow event or object link is required or generated.
- Net worth continues to depend on independently maintained asset snapshots.
- The desktop extends forecast occurrences when a ledger opens and emits a
  refresh hint at the next local date boundary.

## Consequences

- Repayment progress advances automatically with time, including for existing
  loans.
- The same persisted schedule can render different progress on different dates.
- Linked repayment cashflow remains optional evidence and does not control
  progress.
- Failed or delayed real-world payments do not alter projected progress; a
  future exception workflow may represent that distinction explicitly.
