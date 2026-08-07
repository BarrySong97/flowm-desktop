# 0010. Project Subscription Schedules At Read Time

- Status: accepted
- Date: 2026-08-07

## Context

Subscription charge dates are deterministic from the subscription plan. Persisting every projected
date in `subscription_occurrences` duplicates that plan state, requires background maintenance, and
leaves stale rows when a plan changes. Elapsed forecast dates are also not evidence that a real
deduction happened.

Flowm does not reconcile subscription plans period by period. Actual deductions already live in
`cashflow_events` and can be explicitly linked to a subscription through `object_links`.

## Decision

- `subscriptions` is the sole persisted source for subscription forecasts.
- Subscription dates are projected at read time from the stored plan for the requested date window.
- Projection is a browser-safe pure rule shared by renderer and API compatibility consumers.
- Subscription projections are not stored, confirmed, or advanced by background maintenance.
- The next charge includes an occurrence due on the local current date.
- Actual deduction history and totals use only explicitly linked cashflow events.
- Loan payment occurrences remain persisted; their amortization schedule has separate semantics.

## Consequences

- Editing a plan immediately changes every projected subscription view without schedule cleanup.
- Opening a ledger no longer writes subscription forecast rows.
- Existing `subscription_occurrences` rows become legacy, ignored data and can be removed in a later
  compatibility migration.
- A future need for per-period skips or overrides requires a sparse exception model rather than a
  return to materializing the complete schedule.
