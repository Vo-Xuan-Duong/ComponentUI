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
