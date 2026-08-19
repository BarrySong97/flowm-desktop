# Top Navigation And Dashboard Workbench

## Context

The desktop app currently repeats a floating bottom dock inside every route and
the overview stacks all finance summaries above the recent-cashflow table. On a
desktop viewport, that makes route switching feel detached from the window
chrome and forces scrolling before users can review recent transactions.

The supplied visual reference establishes two target patterns:

- primary routes appear as compact tabs in one stable top navigation bar;
- the dashboard uses a dense left summary region beside a persistent right-hand
  table so the most useful information is visible in one viewport.

## Scope

1. Add a dedicated Website App preview route for the interactive mock.
2. Replace the mock's floating bottom dock with a top tab bar.
3. Recompose the mock overview into a responsive summary/table workbench.
4. Move the desktop navigation into the root renderer shell and remove per-page
   dock instances.
5. Apply the verified overview layout to the data-backed desktop dashboard.
6. Keep the marketing hero mock aligned with the shipped desktop UI.

## Product And Architecture Constraints

- Keep past cashflow, present asset snapshots, and future obligations visibly
  distinct; placing them together must not imply reconciliation.
- Preserve existing tRPC queries, URL routes, amount-hiding preference, cashflow
  range selection, and daily-bar detail drawer behavior.
- Do not add renderer database access or broaden the Tauri bridge.
- Use the current Flowm tokens and compact desktop typography rather than
  importing the reference product's branding.

## Verification

1. Check the Website App preview at a 1440 × 900 desktop viewport and a narrower
   desktop viewport.
2. Verify top-tab switching, amount hiding, range selection, and links to the
   full cashflow page.
3. Run targeted web and desktop type checks and builds.
4. Run workspace format, lint, and documentation checks.
5. Record the visual comparison in `design-qa.md` and resolve P0–P2 issues.
