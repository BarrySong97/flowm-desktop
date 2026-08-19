# Flowm App Preview To Desktop QA

- Source visual truth: Website App `/app-preview` with the dedicated title-bar band requested on 2026-08-19
- Source screenshot: `/private/tmp/flowm-app-preview-header-separated.png`
- Production implementation: Tauri renderer overview in `FlowM Dev`
- Production screenshot: `/private/tmp/flowm-desktop-header-separated.jpg`
- Full-view comparison: `/private/tmp/flowm-header-full-comparison.jpg`
- Focused header comparison: `/private/tmp/flowm-header-focused-comparison.jpg`
- Viewport: 1440 × 900 CSS px for both source and production windows
- Pixels and normalization: the browser capture is 1440 × 900; the app-scoped Computer Use capture is 1229 × 768. The focused source app-frame header was cropped and resized to 1229 × 100 beside the production header at the same pixel size. Full views were contained into equal 1440 × 900 comparison cells.
- State: 看板 selected, amounts visible, settled charts, ten recent cashflow rows

## Findings

No actionable P0, P1, or P2 mismatch remains.

- Navigation: production matches the preview's separate 24px traffic-light/drag band above a 52px tab row. Both tab rows use the overview's 28px horizontal inset; the former macOS-only 70px shift is gone.
- Composition: both use the approved roughly 60/40 left-summary/right-cashflow split and keep the main dashboard readable without page-level scrolling at 1440 × 900.
- Cashflow density: the dashboard table now uses the preview's four columns—日期、项目、类别、金额. Full transaction and detail views keep 标签 and 来源 through the table's full variant.
- Typography and color: production retains Flowm's existing type, money formatting, semantic green/red, category colors, and hairline tokens while matching the preview hierarchy and spacing.
- Product semantics: the right pane remains explicitly historical cashflow and is not used to derive present asset balances.
- Runtime fidelity: the production capture came from a freshly rebuilt and restarted `FlowM Dev.app` bundle.

## Comparison History

1. The revised preview widened the left pane to `1.2fr`, removed the mock brand placeholder, and reduced the cashflow table to four columns.
2. The first two refinements were already reflected in the production renderer.
3. Production received an overview-only compact `TransactionTable` variant; full transaction pages were left unchanged.
4. The final side-by-side review confirmed matching navigation alignment, split proportions, information hierarchy, and table density. Content values differ because the preview uses mock June data while production reads the local demo ledger.
5. P1 interaction regression: placing tabs in the same vertical band as the native title bar left users dragging from `no-drag` tab hit targets after switching routes.
6. First fix: moved `TitleBar` into normal shell flow as a dedicated 24px drag band, placed navigation in a separate 52px row, and aligned it to the overview's 28px inset. The visual layout passed, but manual use showed that the in-flow band did not reliably stay above WebView route hit targets.
7. Post-fix evidence: the focused comparison shows matching band height, traffic-light clearance, tab baseline, active underline, and left/right padding. No actionable P0/P1/P2 mismatch remains.
8. Interaction fix: retained the 24px in-flow spacer but restored the legacy absolute drag overlay at `z-index: 9999`, so the drag hit target remains topmost without covering the lower tab row.
9. Root-cause correction: edge resizing still worked while title dragging did not, proving this was not a visual stacking issue. Comparison with the working `journal_todo` Tauri shell showed two required pieces: avoid a page-wide `no-drag-region` ancestor, and grant `core:window:allow-start-dragging` because Tauri's declarative `data-tauri-drag-region` dispatches the protected native drag command internally. `TitleBar` still owns the outermost renderer DOM, only the 24px top band and navigation containers are draggable, and concrete links and buttons opt out with `no-drag-region`; no imperative renderer event handler is used.

## Runtime Checks

- Rebuilt and restarted the development bundle with identifier `com.flowm.desktop.dev`.
- Clicked 资产、流水、订阅、贷款、预算、看板 in sequence and successfully dragged the native window from the dedicated top band after every route switch.
- After restoring the topmost overlay, switched to 资产, dragged from the upper 24px band, returned to 看板, and confirmed the app remained responsive.
- Rebuilt after removing the page-wide no-drag ancestor, restarted `FlowM Dev`, switched routes, exercised the CSS drag surfaces, and returned to 看板.
- Confirmed the active navigation underline, 60/40 split, four-column table, ten visible rows, and absence of the former floating bottom dock.
- Kept the production data path and Tauri/sidecar boundaries unchanged.

final result: passed
