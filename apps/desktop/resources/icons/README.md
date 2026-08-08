# FlowM App Icon

`flowm.icns` is the packaged macOS app icon used by `src-tauri/tauri.conf.json`.
`flowm.iconset/` keeps the source PNG sizes from the design export.
`../../src-tauri/icons/icon.ico` is the generated Windows resource icon used by
Tauri and comes from `flowm.iconset/icon_512x512@2x.png`.
The visible rounded-square tile is inset to roughly 78% of the 1024px canvas,
matching the transparent padding seen in bundled macOS app icons so it does not
look oversized in the Dock.
The layer marker dots are intentionally omitted so the icon reads as three
clean shortened offset plates.

Keep documentation files outside `flowm.iconset/`; macOS icon tools expect the
iconset directory to contain only icon PNG assets.

## Included Sizes

| File                | Pixels |
| ------------------- | ------ |
| icon_16x16.png      | 16     |
| icon_16x16@2x.png   | 32     |
| icon_32x32.png      | 32     |
| icon_32x32@2x.png   | 64     |
| icon_128x128.png    | 128    |
| icon_128x128@2x.png | 256    |
| icon_256x256.png    | 256    |
| icon_256x256@2x.png | 512    |
| icon_512x512.png    | 512    |
| icon_512x512@2x.png | 1024   |

Background: off-white `#f4f6f2`.

To regenerate the Windows icon, run Tauri's icon generator against the 1024px
PNG in a temporary output directory, then retain its `icon.ico` at
`apps/desktop/src-tauri/icons/icon.ico`.
