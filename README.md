# ComponentUI

**Fluent Calm** is an independent, Windows 11 / Fluent 2–inspired visual language for a reusable, cross-framework personal UI system.

**Foundation milestone — NavigationView & SettingsPage (v0.12.0):** The repository contains platform-independent Design Tokens, a prioritized **129-item** component catalog, the first Button contract, reusable CSS reference styles, a theme preference controller, responsive interactive gallery and reusable DOM interaction controllers, and 55 experimental catalogued browser Custom Elements. **There are 55 experimental catalogued Web Components and 0 production-ready releases.** The gallery combines reference HTML/CSS demos with real but not yet cross-browser-certified Custom Elements; nothing has been published as a package.

**Icon system:** a locally bundled, licensed Lucide SVG subset is available in `packages/icons/` via the reusable `<cu-icon>` Custom Element. The Quick actions, Settings and other preview icons now share one stroke style; sidebar links remain text-only. See [Icon System](docs/ICON_SYSTEM.md).

**Framework integration (experimental):** React 18/19, Vue 3 and Svelte 5 adapter packages are now available in `packages/react/`, `packages/vue/` and `packages/svelte/`. React wrappers synchronize custom element properties and `cu-*` events; Vue provides an SFC compiler predicate and a `v-cu-model` directive. Packages can be built and packed locally for use in other repositories; they remain **private and unpublished**. See [Framework adapters](docs/FRAMEWORK_ADAPTERS.md) and [source examples](examples/README.md).

**New in v0.7.0:** six native browser components—`Card`, `Divider`, `Skeleton`, `Spinner`, `Alert`, and `Breadcrumb`—cover layout, loading, status and navigation. Their interactive previews are in the Real Web Components gallery. All remain experimental and use Fluent Calm tokens and locally bundled Lucide icons.

**New in v0.8.0:** implemented `DataTable`, `TreeView`, `ListBox`, `Combobox` and `ContextMenu` with keyboard/pointer interactions, Fluent Calm tokens, Lucide icons, API contracts and Playground demonstrations. The catalog now contains 129 entries; 32 are preview and none are production-certified. See [Data component API](docs/DATA_COMPONENTS.md).

**Select UI consistency (v0.8.1):** All five browser-native `<select>` controls previously in Playground (Theme, Density, Project type, Catalog Category and Priority) now use the same Fluent Calm `<cu-select>` Web Component. The category filter's dynamically appended options are supported, and selection events use `cu-change`. A regression test prevents native select markup from returning. See [Select UI](docs/SELECT_UI.md).

**New in v0.9.0:** build self-contained ES-module `dist/` artifacts for six packages, expose typed package exports, add factory-free React wrappers and Svelte 5 actions, and support local `npm pack` tarballs for installing ComponentUI in other repositories. No public release or online dependencies are required by the build scripts. See [Package distribution](docs/PACKAGING.md).

```bash
npm run check
npm run build:packages
npm run packages:verify
npm run pack:local
```

**New in v0.10.0 — UI refinement:** TextArea, NumberField and SearchBox are reusable form-associated Web Components with keyboard/validation/FormData support. The Playground now uses a consistent neutral Fluent Calm layout, accessible control focus states, better small-screen behavior, and a live Web Component SearchBox for the catalog. **129 catalog entries: 35 previews, 94 planned, 0 production-certified.** See [Form Controls & UI Refinement](docs/FORM_CONTROLS.md).

**New in v0.11.0 — Advanced UI:** `PasswordField` has a native secure input and labeled reveal control; `FilePicker` supports selecting or dropping files without uploading; and `AppShell` provides responsive header/navigation/content/aside/footer slots. The registry contains **33 experimental Web Components**; the 129-entry catalog now has **38 previews and 91 planned**. The React adapter exposes **41 wrappers**, and the Lucide subset includes **29 icons**. See [Advanced UI & AppShell](docs/ADVANCED_UI.md).

**New in v0.12.0:** reusable native `NavigationView` and `SettingsPage`, with auxiliary SettingsGroup/SettingsItem composition, keyboard-aware navigation, metadata-only settings search and live AppShell integration. The 129 catalog records now contain **40 previews and 89 planned**. The React adapter exports **45 wrappers**. See [Navigation & Settings APIs](docs/SETTINGS_NAVIGATION.md).

**DataTable refinement (in progress, still preview):** right-click row actions,
header context actions, Excel-style value and condition filters (text and number
operators), column visibility and page-scoped Select All. The React adapter now
avoids redundant updates for referentially stable `columnFilters` inputs.
Source-level regression tests and API declarations have been extended, but
manual browser, keyboard/screen-reader and cross-framework acceptance checks
are still required. See [Data component API](docs/DATA_COMPONENTS.md).

**Additional component previews:** `Chip`, `Tag` and `ProgressRing`
are now implemented and connected to the React adapter, Playground,
type declarations and contract catalog. Chip supports selection, disabled
states and cancelable removal; Tag renders passive semantic labels;
ProgressRing provides determinate and indeterminate progress with
reduced-motion fallback. At that milestone, the catalog contained **43 previews, 86 planned
components and 0 production-certified releases**; the React adapter
exposed **48 wrappers**. See [Compact components](docs/COMPACT_COMPONENTS.md).

**Workflow and feedback previews:** `SplitButton`, `Stepper` and `InfoBar`
are now implemented, registered in Web/React, and demonstrated in Playground.
SplitButton composes an accessible menu with a primary action, Stepper
supports linear and free navigation, and InfoBar provides contextual feedback
with action slots. At that milestone, the catalog contained **46 previews, 83 planned and 0
production-certified components**; there were **41 browser Custom Elements**
and **51 React wrappers**. See [Workflow components](docs/WORKFLOW_COMPONENTS.md).

**Command and toolbar previews:** `IconButton`, `ToggleButtonGroup`,
`Toolbar` and `CommandBar` are now available as native Web Components.
They support keyboard-friendly icon actions, controlled single/multiple
selection, composed toolbar focus and responsive command overflow. At that milestone the
catalog contained **50 preview, 79 planned and 0 production-certified**
components; there were **45 native browser Custom Elements** and **55 React
wrappers**. See [Command controls](docs/COMMAND_CONTROLS.md).

**Navigation and overlay implementations:** `Accordion`, `Pagination` and
`Drawer` now have real Custom Element implementations in addition to their
existing reference previews. `Disclosure` and `AccordionItem` provide
composable controls. The 129-entry catalog remains **50 preview, 79 planned
and 0 production-certified**; **48 catalogued Web Components** now have
implementations, with **60 React wrappers** including auxiliary elements.
See [Navigation surfaces](docs/NAVIGATION_SURFACES.md). The new controls
have source-level regressions, but require local browser and accessibility
validation before release.

**Layout and filtering previews:** `Splitter`, `ResizablePanel`,
`FilterBar` and `DataFilter` are now implemented and demonstrated in
Playground. Splitter supports pointer and keyboard resizing; FilterBar
composes search with structured field conditions using the custom Select.
The catalog now contains **54 previews, 75 planned and 0 production-ready**
entries; **52 catalogued Web Components** have implementations and the
React adapter exposes **64 wrappers**. See
[Layout and Data Filters](docs/LAYOUT_FILTERS.md). Browser and
accessibility acceptance is still required.

**Virtualized workspace milestone:** `SplitView` and `VirtualList`
are now experimental Web Components; SplitView provides a collapsible
sidebar, and VirtualList renders a small viewport window across large
fixed-height datasets. DataTable can now bind to FilterBar using
`bindFilterBar()`, while pure filter utilities have been extracted to
an independent import without the DataTable rendering graph. The
129-component catalog now has **56 previews, 73 planned, 0 certified**
and the React factory exposes **66 wrappers**. See
[Virtualized Workspace](docs/VIRTUALIZED_WORKSPACE.md).

**Large-data milestone:** `TreeList` adds virtualized hierarchical
navigation, and auxiliary `InfiniteScroll` provides controlled
incremental loading with a manual fallback. DataTable now caches
filtered/sorted views between page changes and indexes row identities
for larger local datasets. The 129-item catalog has **57 previews,
72 planned and 0 production-certified** entries; **55 catalogued
native Web Components** are implemented, alongside the auxiliary
InfiniteScroll control. The React factory exposes **68 wrappers**.
See [Large Data Components](docs/LARGE_DATA_COMPONENTS.md).

**Visual quality milestone:** ComponentUI is now targeting the
interaction and documentation standards of mature libraries like HeroUI,
while retaining its own Fluent Calm styling and framework-neutral
architecture. Shared controls have consistent hover/press/focus states,
Select distinguishes hover from selection, and the Playground now uses
a responsive left navigation with a collapsible mobile menu and a live **Visual Quality Lab**.
`npm run quality:check` and `tests/visual-quality.test.mjs` add
source-state and baseline contrast regressions. This is an initial
polish pass, **not a claim of visual, browser or production parity**.
See the [Quality Bar and acceptance matrix](docs/QUALITY_BAR.md).

## Preview locally

Requires Node.js 20+ (no third-party runtime dependencies in this milestone).

```bash
git clone https://github.com/Vo-Xuan-Duong/ComponentUI.git
cd ComponentUI
npm run check    # static, unit and token consistency checks
npm run preview  # http://127.0.0.1:4173/apps/playground-web/
```

Open [local preview](http://127.0.0.1:4173/apps/playground-web/). Use the top toolbar to switch **System / Light / Dark**, **Compact / Comfortable / Touch** and the **Blue / Purple / Green** accent palette. Test native dialog, toasts, Accordion, Drawer, Pagination and Command Palette (Ctrl/⌘ K); the Real Web Components section now includes Select, RadioGroup, Tabs, Tooltip, Popover, DatePicker, Slider, ProgressBar, Badge, Avatar and Menu. Browse the searchable component catalog. Open the gallery through the server, **not** by double-clicking its HTML file (JSON fetch requires HTTP).

> **Local-only policy:** GitHub Actions are deliberately not used. The maintainer performs all builds and tests locally. None of the implementation should be described as verified until local checks are actually run.

## Current structure

```text
design-system/
  tokens/fluent-calm.tokens.json       # Source of truth: DTCG tokens
  components/catalog.json             # 129 catalog entries
  components/*.contract.json          # Per-component API/behavior contracts
packages/
  theme/
    src/tokens.css                    # Generated tokens; do not edit
    src/components.css                # Reusable preview visual primitives (not Web Components)
    src/theme.js                      # Framework-neutral theme preference controller
  web/src/interactions.js             # Native-first HTML interaction controllers
  web/src/components/                 # Browser Custom Elements including data/tree/list/menu controls
  icons/src/                           # 29 local Lucide SVG definitions (ISC/MIT)
  react/src/                           # React 18/19 Custom Element adapters
  vue/src/                             # Vue 3 compiler helper + v-cu-model directive
  svelte/src/                          # Svelte 5 DOM binding actions
apps/
  playground-web/
    index.html                        # Responsive gallery; no framework dependencies
    main.js                           # Native demo interactions and catalog browser
    styles.css                        # Gallery-specific layout
scripts/build-tokens.mjs              # Generate / check CSS output
scripts/serve.mjs                     # Local static preview server
tests/                                # Node built-in test runner
pnpm-workspace.yaml                   # Future monorepo package boundaries
```

## Scripts

| Script | Function |
| --- | --- |
| `npm run preview` | Local gallery server |
| `npm run tokens:build` | Rebuild generated CSS from token JSON |
| `npm run tokens:check` | Verify generated CSS is current |
| `npm run syntax:check` | Check JavaScript syntax |
| `npm test` | Node-based foundation + preview checks |
| `npm run check` | Token + syntax + unit checks |
| `npm run build:packages` | Generate self-contained package distributions (no bundler) |
| `npm run packages:verify` | Verify public exports, imports and Node ESM evaluation |
| `npm run pack:local` | Build, verify and create local tarballs in `artifacts/` |

The npm workspace contains experimental native Web Components and React/Vue/Svelte adapters. They have not completed cross-browser, accessibility or installed-package certification. Web Components work across DOM-based frameworks; Flutter, React Native and SwiftUI require separate platform renderers.

## Documentation

- [Foundation milestones](docs/FOUNDATION_PLAN.md)
- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Component preview interactions](docs/COMPONENT_PREVIEWS.md)
- [Experimental Web Components API](docs/WEB_COMPONENTS.md)
- [Lucide Icon System](docs/ICON_SYSTEM.md)
- [React, Vue and Svelte adapters](docs/FRAMEWORK_ADAPTERS.md)
- [Independent package distribution and local tarballs](docs/PACKAGING.md)
- [Display and feedback component APIs](docs/DISPLAY_FEEDBACK.md)
- [Chip, Tag and ProgressRing component APIs](docs/COMPACT_COMPONENTS.md)
- [SplitButton, Stepper and InfoBar component APIs](docs/WORKFLOW_COMPONENTS.md)
- [IconButton, ToggleButtonGroup, Toolbar and CommandBar](docs/COMMAND_CONTROLS.md)
- [Accordion, Disclosure, Pagination and Drawer](docs/NAVIGATION_SURFACES.md)
- [Splitter, ResizablePanel, FilterBar and DataFilter](docs/LAYOUT_FILTERS.md)
- [SplitView, VirtualList and connected DataTable filters](docs/VIRTUALIZED_WORKSPACE.md)
- [TreeList, InfiniteScroll and DataTable performance](docs/LARGE_DATA_COMPONENTS.md)
- [Interaction Quality Bar and visual acceptance](docs/QUALITY_BAR.md)
- [Overlay focus, keyboard and viewport quality](docs/OVERLAY_QUALITY.md)
- [Data, tree, list and menu component APIs](docs/DATA_COMPONENTS.md)
- [Form controls and Fluent Calm UI refinement](docs/FORM_CONTROLS.md)
- [Advanced controls and responsive AppShell](docs/ADVANCED_UI.md)
- [NavigationView, SettingsPage, SettingsGroup and SettingsItem](docs/SETTINGS_NAVIGATION.md)
- [Fluent Calm style guide](docs/STYLE_GUIDE.md)
- [Component inventory](docs/COMPONENTS.md)
- [Architecture](docs/ARCHITECTURE.md)

## Design references and ownership

Fluent Calm draws inspiration from Windows 11 but is not an official Microsoft Design System, nor a reproduction of proprietary UI assets. Do not bundle Microsoft-owned fonts, icons or wallpapers. See [Microsoft Fluent 2](https://fluent2.microsoft.design/).

No package has been published. Licensing and third-party attribution policy must be finalized before any external release.

**v0.4.3 UI consistency:** Select and vertical Tabs no longer display left-edge accent bars in hover/active rows. Native-first UI feedback uses full-row backgrounds and clear text instead.

**Temporal controls milestone:** TimePicker and DateRangePicker add two native form-associated components with standalone exports and React wrappers. The catalog now has 59 previews, 70 planned, zero production-ready; the React factory exposes 70 wrappers. See [Temporal controls](docs/TEMPORAL_CONTROLS.md).

**Calendar and rating milestone:** A custom inline Calendar and native-radio Rating are available as preview Web Components, with standalone imports and React wrappers. The 129-entry catalog now has 61 previews, 68 planned, zero production-ready; the React factory exposes 72 wrappers. See [Calendar and rating](docs/CALENDAR_RATING.md).

**MultiSelect and Toast milestone:** the catalog now contains 130 entries, 63 preview, 67 planned, zero production-ready. The React factory exposes 74 wrappers. MultiSelect adds a searchable multi-value form control; Toast replaces the old Playground-only notification implementation with a reusable queue. See [MultiSelect and Toast](docs/MULTISELECT_TOAST.md).

**AutoComplete and NotificationCenter milestone:** 130 catalog entries, 65 preview, 65 planned, zero production-ready; 76 React wrappers. AutoComplete supports free text and property-driven suggestions, while NotificationCenter manages an in-memory notification list. See [AutoComplete and NotificationCenter](docs/AUTOCOMPLETE_NOTIFICATIONS.md).

**RangeSlider and OTPInput milestone:** 130 catalog entries, 67 preview, 63 planned, zero production-ready; 78 React wrappers. See [RangeSlider and OTPInput](docs/RANGE_OTP.md).

**ColorPicker and TagInput milestone:** 130 catalog entries, 69 preview, 61 planned, zero production-ready; 80 React wrappers. See [ColorPicker and TagInput](docs/COLOR_TAGS.md).

**CommandPalette and EmptyState milestone:** both previously preview-only HTML patterns are now standalone Web Components. 69 catalogued implementations, 69 preview entries, 61 planned, 0 production-ready, 82 React wrappers. See [CommandPalette and EmptyState](docs/COMMAND_EMPTY.md).

**Statistic and LoadingOverlay milestone:** 130 catalog entries, 71 preview, 59 planned, zero production-ready; 84 React wrappers. See [Statistic and LoadingOverlay](docs/STATISTIC_LOADING.md).

**ScrollArea and AvatarGroup milestone:** 130 catalog entries, 73 preview, 57 planned, zero production-ready; 86 React wrappers. See [ScrollArea and AvatarGroup](docs/SCROLL_AVATAR.md).

**SegmentedControl and Timeline milestone:** 131 catalog entries, 75 preview, 56 planned, zero production-ready; 88 React wrappers. See [SegmentedControl and Timeline](docs/SEGMENT_TIMELINE.md).

**Carousel and PropertyGrid milestone:** 131 catalog entries, 77 preview, 54 planned, zero production-ready; 90 React wrappers. See [Carousel and PropertyGrid](docs/CAROUSEL_PROPERTY.md).

**FileExplorer and DataGrid milestone:** 131 catalog entries, 79 preview, 52 planned, zero production-ready; 92 React wrappers. See [FileExplorer and DataGrid](docs/FILE_GRID.md).

**Desktop window chrome milestone:** 131 catalog entries, 82 preview, 49 planned, zero production-ready; 95 React wrappers. See [Desktop window chrome](docs/DESKTOP_CHROME.md).

**DockLayout and KanbanBoard milestone:** 132 catalog entries, 84 preview, 48 planned, zero production-ready; 97 React wrappers. See [DockLayout and KanbanBoard](docs/DOCK_KANBAN.md).

**Layout foundation, editor and charts milestone:** 132 catalog entries, 92 preview, 40 planned, zero production-ready; 105 React wrappers. See [Layout and editor foundation](docs/LAYOUT_EDITOR_CHART.md).

**Forms and display utilities milestone:** 132 catalog entries, 105 preview, 27 planned, zero production-ready; 116 React wrappers. See [Forms and display utilities](docs/FORM_DISPLAY_UTILITIES.md).

**Actions, navigation and feedback milestone:** 132 catalog entries, 120 preview, 12 planned, zero production-ready; 131 React wrappers. See [Actions, navigation and feedback](docs/ACTION_NAV_FEEDBACK.md).

**Current milestone — Full catalog preview coverage:** 132 catalog entries, 132 preview, zero planned, zero production-ready; 143 React wrappers. See [Advanced patterns](docs/ADVANCED_PATTERNS.md) and [Release acceptance](docs/RELEASE_ACCEPTANCE.md).

**Stabilization pass 1:** interaction and state fixes plus expanded package verification. The catalog stays at 132 preview entries. See [release acceptance](docs/RELEASE_ACCEPTANCE.md#stabilization-pass-1).

**Stabilization pass 2:** unified Fluent Calm semantic interaction states, improved token contrast and visual QA examples. See [release acceptance](docs/RELEASE_ACCEPTANCE.md#stabilization-pass-2--fluent-calm-visual-foundation).

**Stabilization pass 3:** DataTable filter and selection hardening, DataGrid edit lifecycle, TreeTable hierarchy search/sorting/context menus. See [release acceptance](docs/RELEASE_ACCEPTANCE.md#stabilization-pass-3--data-components).

**Stabilization pass 4:** overlapping virtual row reuse, frame-coalesced scroll work, observer lifecycle guards, indexed tree lookup, progressive TreeTable rendering and local data benchmarks. See [release acceptance](docs/RELEASE_ACCEPTANCE.md#stabilization-pass-4--performance-and-lifecycle).
