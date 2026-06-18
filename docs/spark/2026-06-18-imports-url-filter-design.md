# Imports URL Filter Design

## Context

FlowM's imports page currently keeps transaction filters in local React Hook
Form state. The filters drive the visible transaction table, the daily
income/expense bars, range totals, and the category breakdown. Because the
state is local, refreshing the page or sharing the current view loses the
filter state.

The imports page also has a daily bars summary header. The dashboard already
links to the cashflow analysis page with `查看结余信息 →`; the imports page
should expose the same navigation affordance next to its daily summary copy.

## Goals

- Add `查看结余信息 →` to the right side of the imports page daily bars header.
- Synchronize imports page filter state with URL query parameters.
- Use `nuqs` for query-state parsing and URL updates.
- Keep React Hook Form and HeroUI as the form/control layer.
- Keep default filters out of the URL.
- Use history `replace` for filter updates so browser back does not step
  through every filter change.

## Non-Goals

- Do not change the meaning of imports page filters.
- Do not change cashflow query semantics or database access.
- Do not redesign the imports page layout beyond the new text link.
- Do not add new analysis charts or new data APIs.

## Proposed Approach

Use `nuqs` `useQueryStates` as the canonical source for imports filter query
state, with React Hook Form acting as the local form binding layer for HeroUI
controls.

The selected approach keeps the existing form architecture intact while making
the URL shareable and refresh-stable. It also keeps related filter fields
batched through one query-state object instead of scattering multiple
independent `useQueryState` calls across the page.

## URL Parameters

| Parameter  | Field          | Values                                                          | Default      |
| ---------- | -------------- | --------------------------------------------------------------- | ------------ |
| `period`   | Time range     | `this_month`, `last_month`, `last_30`, `last_90`, `year`, `all` | `this_month` |
| `source`   | Source         | source display name                                             | `all`        |
| `category` | Category       | category id string                                              | `all`        |
| `type`     | Flow kind      | `all`, `expense`, `income`                                      | `all`        |
| `q`        | Search keyword | trimmed string                                                  | empty string |

Default values must not be written to the URL. A default page remains:

```text
/imports
```

A filtered page can look like:

```text
/imports?period=last_90&type=income&q=美团
```

## Query-State Rules

- Use `withDefault` for all fields so page code always receives complete filter
  values.
- Rely on nuqs default-clearing behavior so default values disappear from the
  URL.
- Configure filter updates to use history `replace`.
- Trim `q`; an empty trimmed keyword is treated as the default empty value.
- Invalid enum values fall back to defaults.
- Dynamic values are validated against loaded data:
  - Unknown `source` returns to `all`.
  - Unknown `category` returns to `all`.
  - A category that is not valid for the selected `type` returns to `all`.

## React Hook Form Integration

The imports page should continue using React Hook Form because FlowM's renderer
form rule requires RHF plus HeroUI controls.

Data flow:

1. Page load reads filter values from `nuqs`.
2. `useForm` initializes with those values.
3. HeroUI `Select` and `Input` controls remain bound through RHF.
4. When a select changes, update both the RHF field and the nuqs query state.
5. When the keyword changes, update RHF immediately and update nuqs after a
   small debounce, around 200-300ms.
6. Existing `useWatch` values continue driving `filteredTxs`, daily bars,
   totals, and breakdowns.
7. If dynamic validation resets a source or category to `all`, write that reset
   to both RHF and nuqs.
8. `resetFilters` sets all fields to defaults in RHF and nuqs, returning the
   URL to `/imports`.

## Imports Page Cashflow Link

In the daily bars header, append a text link on the far right:

```text
查看结余信息 →
```

Behavior:

- Route to `/analysis`.
- Match the dashboard link style:
  `cursor-pointer text-[var(--accent)] hover:opacity-75 transition-opacity`.
- Do not pass current imports filters to `/analysis`.
- Keep it visually grouped with the existing right-side summary copy.

## Error Handling

- Invalid URL values must not crash the page.
- Invalid query values should normalize to safe defaults.
- If dynamic options load after the URL parse and reveal an invalid source or
  category, normalize the field after options are available.
- Empty datasets should still render filters, totals, and reset behavior.
- Search terms should be displayed decoded in the input and encoded only in the
  URL.

## Testing And Verification

Focused verification:

- Type-check desktop after implementation:

```bash
pnpm -F desktop check-types
```

- Run docs checks if documentation is touched:

```bash
pnpm check-docs
```

Manual behavior checks:

- Visit `/imports`; confirm URL has no default query params.
- Change time to last 90 days; confirm URL becomes `?period=last_90`.
- Change type to income; confirm URL includes `type=income`, table/totals/chart
  all reflect income filters.
- Type a keyword; confirm the input updates immediately and URL updates after a
  short debounce.
- Click reset; confirm form returns to defaults and URL returns to `/imports`.
- Refresh a filtered URL; confirm form controls, table, totals, daily bars, and
  breakdown match the URL state.
- Apply multiple filters, then press browser back; confirm it leaves the page
  rather than stepping through each filter state.
- Load invalid URLs such as `/imports?period=bad&type=bad&category=missing`;
  confirm the page falls back to defaults and clears invalid values.
- Confirm the new `查看结余信息 →` link appears next to daily summary text and
  opens `/analysis`.

## Implementation Notes

- Add `nuqs` to the desktop package dependency set.
- Add the TanStack Router adapter if required by the app root:
  `nuqs/adapters/tanstack-router`.
- Keep renderer UI edits aligned with `design.md` and
  `docs/conventions.md`: HeroUI controls first, Tailwind utilities for layout
  and styling, inline style only for allowed dynamic exceptions.
- Keep file headers updated for touched handwritten source files.

## Open Decisions Resolved

- Default filter values are not written to the URL.
- Filter URL updates use history `replace`.
- The selected architecture is `useQueryStates` plus React Hook Form, not
  scattered per-field query hooks and not a RHF replacement.
