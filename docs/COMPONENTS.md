# Component inventory

The catalog currently has **91 planned**, **38 preview**, and **0 production-ready** entries. Preview includes both reference HTML/CSS examples and real but experimental browser Custom Elements. The [Fluent Calm gallery](../apps/playground-web/) contains both; none are certified production packages.

- **P0 — 41:** core primitives required by most personal projects
- **P1 — 81:** expanded workflows and productivity controls
- **P2 — 7:** advanced or high-maintenance patterns

A component can move from `planned` to `ready` only after its contract, behavior, light/dark variants, accessibility, tests, framework smoke tests and documentation are complete.

For the complete inventory, browse the Playground catalog locally or [inspect catalog.json](../design-system/components/catalog.json).

## Release criteria

1. API, events and state/slot specifications are finalized.
2. Light/Dark, Compact/Comfortable/Touch and high contrast are documented and reviewed.
3. Keyboard, focus order, accessible name, roles and feedback are verified.
4. Unit and browser tests cover interaction; visual regression screenshots verified locally.
5. Integration in native HTML and at least one framework is tested.
6. Versioning and migration guidance are prepared.

Do not use the presence of CSS demos as evidence that these release criteria have been met.

## First native Custom Elements

Twenty-seven experimental, reusable `cu-*` elements now exist: `Button`, `TextField`, `Checkbox`, `Switch`, `Dialog`, `Select`, `RadioGroup`, `Tabs`, `Tooltip`, `Popover`, `DatePicker`, `Slider`, `ProgressBar`, `Badge`, `Avatar`, `Menu`, `Card`, `Divider`, `Skeleton`, `Spinner`, `Alert`, `Breadcrumb`, `DataTable`, `TreeView`, `ListBox`, `Combobox`, and `ContextMenu`. Their catalog status is **preview** pending cross-browser/accessibility/form-integration tests; see [Web Components API](WEB_COMPONENTS.md).

## Fifth wave — Data and navigation

Five more experimental Custom Elements are now implemented: DataTable, TreeView, ListBox, Combobox and ContextMenu. ListBox was added to the original backlog, which now holds 129 catalog entries. The five remain preview pending keyboard, screen-reader, framework and browser testing. See [Data component APIs](DATA_COMPONENTS.md).

## Form controls and UI refinement — v0.10.0

The native Web Components set has expanded with TextArea, NumberField and SearchBox. They support FormData/validation/reset using ElementInternals, keyboard interactions, and the existing Fluent Calm tokens. The catalog contains 129 entries: 35 preview, 94 planned and 0 production-certified. The Playground styling has been refreshed for hierarchy, responsive behavior, focus, and neutral surfaces. See [FORM_CONTROLS.md](FORM_CONTROLS.md).

## Advanced controls & application shell — v0.11.0

PasswordField, FilePicker and AppShell have moved from planned to preview.
The total catalog remains 129: **38 preview, 91 planned and 0 production-certified**.
See [ADVANCED_UI.md](ADVANCED_UI.md) for API contracts, data handling,
keyboard behavior and local validation.
