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
