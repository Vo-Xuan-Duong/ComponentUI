# Release acceptance

Catalog coverage is now 132/132 preview entries. This is implementation
coverage, not production readiness. Production-ready count remains zero
until acceptance evidence is recorded.

## Local verification checklist

1. Run npm run check and npm run check:packages.
2. Run npm run preview and validate the complete gallery with light/dark
   themes, keyboard-only navigation, screen reader and forced colors.
3. Exercise form-associated controls, required/readonly/disabled,
   fieldset, reset, FormData and programmatic property updates.
4. Exercise menu/popover/dialog focus management and nested overlays.
5. Test DataTable/DataGrid Excel-like filters, row/header context menus,
   editable cells, sorting and selection with representative datasets.
6. Verify large lists, tree components, panel resize and Kanban drag/drop.
7. Build installed-package smoke examples in React, Vue and Svelte and
   actual Electron/Tauri hosts; verify export paths and TypeScript.
8. Test sanitization and trust boundaries for editor content and
   native bridges; validate upload and media behavior.
9. Record browser, OS, runtime, results and any regressions.
10. Promote individual entries to ready only after evidence; publish
    package versions separately according to release policy.

Preview coverage includes intentionally compositional variants, not 132
independent interaction engines. Advanced components have explicit scope
limits; review contracts and documentation before use. GitHub Actions
are not run as part of this development milestone.

## Stabilization pass 1

The first hardening pass addresses dynamic tab content, RTL keyboard navigation,
disabled steps, notification capacity changes, OTP commit deduplication,
menu focus restoration, radio child state, command palette touch scrolling,
empty description spacing, and color alpha preservation. The package verifier
now checks each of the 143 React tag mappings against its native class,
standalone built module and TypeScript declarations. These are source-level
changes and regression tests, not evidence of browser acceptance.

Local focused test: `node --test tests/stabilization-pass-one.test.mjs`.
Then run the complete checks above. Verify menu selection that opens a
dialog, OTP paste followed by blur, nested tab content updates, disabled
wizard steps, and Toast max-visible changes in the real browser.

## Stabilization pass 2 — Fluent Calm visual foundation

Semantic state tokens are generated in tokens.css. Hover (9%), selected
(13%), pressed (16%) and active option (20%) use the accent tint; active
option uses the elevated surface. Shadow styles use fallback values at
the point of use rather than overriding public variables on the host.
Application overrides of --cu-state-hover, --cu-state-selected,
--cu-state-pressed and --cu-state-active are inherited. When overriding
accent locally, also override the desired state tokens in that scope:
root-derived CSS variables otherwise retain the computed root palette.

Accent normal/hover/pressed and destructive action colors have explicit
theme tokens. Light warning foreground is darker; dark accent hover is
lighter. --cu-control-border strengthens control boundaries while
--cu-border continues to represent decorative dividers. Existing
compact/comfortable/touch density settings are retained; autocomplete
and multiselect input heights now respect the control height.

Token-level contrast calculations cover normal text, action states,
feedback foreground/surface pairs and control boundaries; these do not
establish visual or WCAG conformance for rendered components. Open the
Quality Lab and compare the semantic state swatches, the scoped state
override, focus rings, disabled states, and keyboard-active vs selected
options. Check blue/purple/green accents, light/dark, all densities,
reduced motion and forced colors. Run `node --test tests/visual-quality.test.mjs`,
`npm run tokens:check`, and the full local checks. No catalog entries
have been promoted to ready.

## Stabilization pass 3 — data components

DataTable now imports the shared numeric filter operator set, invalidates
cached sorting when hiding the sorted column, scopes filter facets to the
external FilterBar and other column filters, rejects inverted ranges, and
renders filter options in batches of 200. Search and Select all matching
operate over all matching options, not just the rendered batch. A scoped
overlay registration coordinates nested condition selectors. The
preserve-selection attribute retains selected explicit unique row IDs
when data changes; the default still clears selection. selectedIds is
writable for controlled integrations. Use unique explicit row IDs to
avoid ambiguous selection and editing.

DataGrid text/number editors commit on Enter or Tab to another editable
cell on the page; unsaved values are discarded on blur or Escape.
Select, checkbox and color controls commit on change. The deliberate
change from blur-to-save prevents destructive rerenders during pointer
focus changes. Invalid entries remain in the editor on failed commit.
TreeTable supports sibling sorting, accent-insensitive local search
that preserves matching ancestor paths, expand/collapse all and row/header
context menus. Searching does not modify stored expansion state.
TreeTable is not a virtualized treegrid and does not implement the full
Excel checkbox filter UI. No action column is introduced.

Run `node --test tests/data-components-stability.test.mjs` and the full
local acceptance checks. Verify nested Escape handling, 1,000 distinct
filter values, external FilterBar scope, controlled selection, cell
editing and focus, and filtered TreeTable row actions.

## Stabilization pass 4 — performance and lifecycle

VirtualList and TreeList reuse DOM nodes in overlapping windows and retain
only the current window cache. Scroll and resize visual work is coalesced
per animation frame and cancelled on disconnect. Virtual range offsets
are clamped to the dataset length and nonfinite values are normalized.
TreeList indexes visible IDs, detects repeated nodes and limits traversal
depth to 100. ScrollArea reports a coalesced latest scroll snapshot, not
every native scroll event. InfiniteScroll guards stale observer callbacks.
Sorting and distinct filter value ordering reuse Intl.Collator per operation.
TreeTable defaults to progressive rendering in batches of 200 visible
rows, configurable using render-batch (25–1000). Show more expands the
DOM cumulatively; this is not viewport virtualization. DataTable and
DataGrid remain paginated (maximum 100 rows per page).

Local verification: run `npm run benchmark:data`, `node --test tests/performance-lifecycle.test.mjs`, and the full check/package commands. Benchmark measurements are local Node.js helper timings, not browser FPS or memory measurements. In Playground load the 2,200-row tree, expand batches, filter and sort, and repeatedly mount/unmount scroll components. Verify retained focus, scroll behavior, observer cleanup and heap snapshots in browser DevTools. No production readiness claims are made.
