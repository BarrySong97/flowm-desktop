# 0003 Desktop App Icon Assets

- Status: Accepted
- Date: 2026-06-16

## Context

FlowM needs a branded desktop app icon in both packaged builds and local
Electron development runs. Electron Builder uses macOS `.icns` assets only when
packaging, while `pnpm dev` launches Electron directly and does not read
`electron-builder.yml`.

macOS bundled app icons leave transparent padding around the visible rounded
tile. In local checks, a full-canvas tile appears oversized in the Dock even
when the internal mark is visually smaller. FlowM keeps a more restrained tile
with a geometric size of about 78% of the icon canvas.

## Decision

Keep app icon assets under `apps/desktop/resources/icons`:

- `flowm.icns` is the packaged macOS icon referenced by Electron Builder.
- `flowm.iconset/` keeps the source PNG sizes used to rebuild the `.icns`.
- The visible rounded tile is inset to about 78% of the 1024px canvas.
- The mark uses three clean shortened offset plates without marker dots.

In development, the Electron main process sets the Dock icon from
`flowm.iconset/icon_512x512@2x.png` so `pnpm dev` shows the same visual icon
without requiring a packaged app build.

## Consequences

Packaged builds and local development use the same icon source, but through
different Electron paths. Updating the app icon requires regenerating the
iconset PNGs and `flowm.icns`, then verifying:

- `sips -g pixelWidth -g pixelHeight apps/desktop/resources/icons/flowm.icns`
- `iconutil -c iconset apps/desktop/resources/icons/flowm.icns -o /tmp/flowm-icon-verify.iconset`
- the 1024px PNG keeps the rounded tile close to the 78% geometric canvas ratio
