# Component inventory

The catalog currently has **68 planned**, **61 preview**, and **0 production-ready** entries. Preview includes both reference HTML/CSS examples and real but experimental browser Custom Elements. The [Fluent Calm gallery](../apps/playground-web/) contains both; none are certified production packages.

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

## Navigation and settings composition — v0.12.0

Two catalog entries have moved to preview: NavigationView and
SettingsPage. SettingsGroup/SettingsItem are auxiliary custom elements.
The 129-entry catalog contains **40 preview, 89 planned and 0 ready**
records. Keyboard/browser accessibility and installed-package testing
remain required. See [SETTINGS_NAVIGATION.md](SETTINGS_NAVIGATION.md).


## Newly implemented display and selection previews

- **Chip** — selectable and removable compact token (`cu-chip`).
- **Tag** — non-interactive semantic classification (`cu-tag`).
- **ProgressRing** — accessible circular progress (`cu-progress-ring`).

These are registered in the web package and React adapter and are still marked
`preview`, not production-certified. See [Compact components](COMPACT_COMPONENTS.md).


## Workflow and feedback preview additions

- **SplitButton** (`cu-split-button`) — primary action and accessible secondary menu.
- **Stepper** (`cu-stepper`) — step navigation with linear and nonlinear behavior.
- **InfoBar** (`cu-info-bar`) — persistent status with action slot and dismissal.

All three are experimental previews, not production-certified; see
[Workflow components](WORKFLOW_COMPONENTS.md).


## Command and toolbar components

- **IconButton** (`cu-icon-button`) — labeled icon-only actions and toggles.
- **ToggleButtonGroup** (`cu-toggle-button-group`) — single/multiple pressed state.
- **Toolbar** (`cu-toolbar`) — keyboard-navigable slotted controls.
- **CommandBar** (`cu-command-bar`) — responsive commands with overflow.

All are experimental previews, not production certified. See
[Command controls](COMMAND_CONTROLS.md).


## Navigation surfaces and overlay implementations

- **Accordion** (`cu-accordion` with `cu-accordion-item`) — single or multi-open sections.
- **Disclosure** (`cu-disclosure`) — auxiliary standalone collapsible panel.
- **Pagination** (`cu-pagination`) — accessible numbered page navigation.
- **Drawer** (`cu-drawer`) — native modal side panel with action slot.

Accordion, Pagination and Drawer were already catalogued as previews; this
milestone adds their browser implementations without changing the 129-entry
catalog count. All remain experimental. See
[Navigation surfaces](NAVIGATION_SURFACES.md).


## Resizable layout and filtering previews

- **Splitter** (`cu-splitter`) — pointer/keyboard-adjustable two-pane layout.
- **ResizablePanel** (`cu-resizable-panel`) — scrollable pane or standalone CSS-resizable region.
- **FilterBar** (`cu-filter-bar`) — keyword search with aggregate structured filters.
- **DataFilter** (`cu-data-filter`) — field/operator/value conditions using custom Select.

All four move from `planned` to `preview`. The catalog remains at
129 entries, with 54 experimental previews and 75 planned components.
See [Layout and Data Filters](LAYOUT_FILTERS.md).


## Virtualized workspace and connected data filtering

- **SplitView** (`cu-split-view`) — sidebar/content layout with collapsible navigation.
- **VirtualList** (`cu-virtual-list`) — fixed-row-height rendering with a bounded DOM window for large datasets.
- **DataTable + FilterBar** — direct `bindFilterBar()` integration preserves existing column filters.
- **Filter utilities** — pure filtering in a separate lightweight module with backward-compatible reexports.

The catalog remains 129 components: **56 preview, 73 planned, 0 certified**.
See [Virtualized Workspace](VIRTUALIZED_WORKSPACE.md).


## Hierarchical and incremental data controls

- **TreeList** (`cu-tree-list`) — accessible virtualized tree navigation with fixed-height rows.
- **InfiniteScroll** (`cu-infinite-scroll`) — auxiliary observer-driven incremental loading and manual fallback.
- **DataTable performance** — cached filter/sort results, row identity indexing, and invalidation when data changes.

TreeList moves to preview; InfiniteScroll is auxiliary and does not
increase the 129-entry catalog. Current catalog totals: **57 preview,
72 planned, 0 certified**. See [Large Data Components](LARGE_DATA_COMPONENTS.md).

## Temporal form controls

TimePicker and DateRangePicker move to preview. Current inventory: 129 catalog entries, 59 preview, 70 planned, 0 ready. See [Date and time controls](TEMPORAL_CONTROLS.md).

## Calendar and rating controls

Calendar and Rating move to preview. Current inventory: 129 catalog entries, 61 preview, 68 planned, 0 ready. See [Calendar and rating](CALENDAR_RATING.md).
