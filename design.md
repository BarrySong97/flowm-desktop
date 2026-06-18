# Flowm Desktop Design System

Flowm is a work-focused personal finance desktop app. The UI should feel calm, dense enough for repeated review, and clear about which finance layer the user is editing.

## Tokens

- Color: use the existing Tailwind and HeroUI tokens first. Reserve semantic colors for money direction, risk, and destructive actions.
- Typography: use compact headings inside panels and tables. Avoid hero-scale type in product surfaces.
- Spacing: default to the existing 4px/8px rhythm. Keep toolbars, forms, and tables stable when data changes.
- Shape: cards and panels should stay at 8px radius or less unless a local primitive already defines otherwise.

## Layout

- The app is a desktop workbench first. Prefer predictable navigation, scan-friendly tables, and side/detail panels over marketing-style sections.
- Repeated finance items belong in tables, lists, or compact cards. Avoid cards nested inside cards.
- Fixed-format controls such as nav items, icon buttons, tabs, and counters need stable dimensions so hover/loading states do not shift layout.

## Components

- Reuse components from `packages/ui` and local renderer UI before creating new primitives.
- Prefer HeroUI components for common controls such as tabs, selects, inputs,
  buttons, modals, drawers, labels, calendars, and form controls. Do not hand-roll
  these controls unless the local design system lacks the behavior.
- In renderer UI, prefer Tailwind utility classes for layout, spacing,
  typography, borders, radius, shadows, and token colors. Use inline `style` only
  for dynamic runtime values, chart-library prop objects, or CSS values that
  Tailwind cannot express cleanly.
- Use icons for common actions such as add, edit, delete, save, download, search, and navigation.
- Forms should expose loading, empty, error, dirty, and success states where the workflow needs them.
- Destructive actions need confirmation when they can remove user-entered financial data.

## Interaction

- Keep the three Flowm layers visible in language and placement: cashflow, assets, and obligations are related but independent.
- Do not imply reconciliation when the product model does not require it.
- Use concise labels. Avoid in-app explanatory text about implementation details or shortcuts.

## Accessibility

- Preserve keyboard reachability for navigation, dialogs, and row/detail workflows.
- Maintain visible focus styles and semantic labels on icon-only controls.
