# UI Package

## Responsibility

`packages/ui` owns reusable UI primitives, shared component helpers, and global styles that can be used by the desktop renderer.

## Key Files

- `packages/ui/src/components/ui/` - reusable primitives such as command, keyboard hint, scroll area, and toast.
- `packages/ui/src/lib/utils.ts` - UI utility helpers.
- `packages/ui/src/styles/globals.css` - shared global styles.
- `packages/ui/components.json` - shadcn-style component configuration.

## Primitive Map

- `command.tsx` - command palette primitives based on `cmdk`.
- `kbd.tsx` - keyboard hint display.
- `scroll-area.tsx` - shared scroll area primitive.
- `simple-toast.tsx` - lightweight toast surface (Sonner, bottom-right). `notify` exposes `success`/`error`/`message`/`loading`/`dismiss` plus `action(title, { id, actionLabel, onAction })` for persistent toasts with a button, e.g. the update prompt.
- `lib/utils.ts` - class-name merging helper.
- `styles/globals.css` - shared tokens and base CSS imported by the renderer.

## Data Flow

The renderer imports primitives from `@flowm/ui` and composes them into product-specific pages and panels under `apps/desktop/src/renderer/src`.

## Interfaces

Consumers import from `@flowm/ui`.

## Watchouts

- Keep product-specific finance logic out of this package.
- Match [design.md](../../../design.md) and the surrounding renderer style before adding new primitives.
- Do not create duplicate primitives when an existing component can be extended safely.
- Shared UI source files carry AI headers; keep header `@gotcha` notes about package-level reuse, not one-off page behavior.
