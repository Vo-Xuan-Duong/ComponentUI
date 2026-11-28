# Platform architecture

```text
            Design tokens + component contracts
                         |
                 Source validators
                         |
          +--------------+----------------+
          |              |                |
      Web renderer   React Native    Flutter/Native
     Native Custom Elements       native views    native renderers
          |
    React / Vue / Angular / Svelte / HTML
          |
    Electron / Tauri / Browser
```

Design Tokens and Contracts are the cross-platform source of truth. **Web Components cannot run directly in Flutter, SwiftUI, React Native, Qt or native .NET UI.**

## Current implementation

- `design-system/`: initial DTCG token source and component backlog/contracts
- `packages/theme/`: generated CSS variables, reusable **preview-only** CSS classes and theme preference controller
- `packages/web/src/components/`: experimental, native JavaScript Web Components (Button, TextField, Checkbox, Switch, Dialog, Select, RadioGroup, Tabs, Tooltip, Popover, DatePicker, Slider, ProgressBar, Badge, Avatar, Menu, Card, Divider, Skeleton, Spinner, Alert, Breadcrumb). Form controls use ElementInternals when supported.
- `apps/playground-web/`: responsive HTML/JS reference with theme/density/accent switching, eight progressive-enhancement patterns, and a live Custom Elements example form
- `scripts/serve.mjs`: dependency-free local preview server
- `tests/`: Node-based consistency, theme preference and static preview integration tests
- `pnpm-workspace.yaml`: boundary declaration for packages and apps

## Implemented browser framework adapters (v0.6.0)

- `packages/react/`: factory-created React wrappers for 35 Custom Element tags; standard native `cu-*` events, controlled properties and forwarded refs
- `packages/vue/`: Vite/SFC compiler helper (`isCustomElement`) and the `v-cu-model` directive with event subscription cleanup
- `examples/`: framework-specific TSX/Vue source examples; not configured as standalone build apps

These are **experimental integrations**, not independently published or browser/SSR-certified packages. See [Framework adapter guide](FRAMEWORK_ADAPTERS.md).

## Future ports and adapters

- **Port:** framework-neutral component contract including states, events, semantics and accessibility.
- **Adapter:** framework-specific rendering, lifecycle, state binding and event transport.
- **Shared logic:** reuse only logic compatible with platform runtimes, rather than wrapping native toolkits with a web dependency.

The initial browser Web Renderer now uses standards-based Custom Elements with Shadow DOM, without a bundler or runtime dependency. The `cu-*` elements are genuine implementations but **experimental**, not production-certified. A dedicated React/Vue adapter, browser compatibility validation and accessibility review will follow. Lit remains an optional future implementation choice for more complex components.

## Build and verification

This project intentionally uses **no GitHub Actions**. Local instructions are in [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md). Browser rendering and accessibility/visual regression tests will be added in a future milestone.

## Upgrade path

Build one stable Web Renderer and a reference application before starting native renderers. Share contracts and semantic tokens, maintain Semantic Versioning, and document migrations for breaking API changes.

## v0.8.0 — complex web controls

The core browser renderer now contains client-side DataTable, TreeView, ListBox, Combobox and ContextMenu components. Declarative child tags serve as data definitions while the parent controls their Shadow DOM rendering. DataTable accepts typed JS property arrays; form-associated controls participate in FormData using ElementInternals. Framework adapters reuse these DOM implementations; native/non-DOM targets still need separate renderers.

## v0.9.0 — standalone installable package artifacts

`scripts/build-packages.mjs` creates independent ESM distribution trees
for `theme`, `icons`, `web`, `react`, `vue` and `svelte`. Public
package exports now target `dist/`, not source-only monorepo paths.
The Web renderer vendors its curated, licensed Lucide node definitions
under `dist/internal/`, removing its source-level cross-package
dependency in installable artifacts. React's type-only icon dependency
is similarly internalized in the distributed declarations.

The HTML Playground continues using the original source files.
All packages remain private and experimental; the documented local
packaging process produces tarballs without publishing to npm.
Electron and Tauri use the Web renderer in their frontend/webview;
they are not separate component renderers.

See [Package distribution](PACKAGING.md) and [framework adapters](FRAMEWORK_ADAPTERS.md).

## v0.12.0 — application composition

NavigationView selects accessible native links/buttons without owning
routing; SettingsPage organizes groups and settings rows without owning
persistence. Both extend the shared browser Custom Elements package,
work in AppShell's slots and are reusable through the existing
React/Vue/Svelte adapters. The two catalog entries remain preview;
SettingsGroup and SettingsItem are auxiliary compositional elements.


## Component composition rule

The native renderer is the single implementation used by HTML, React, Vue,
Svelte and desktop webviews. Composite components should import and compose
existing `cu-*` primitives rather than implement independent controls.

| Primitive | Current composition |
| --- | --- |
| Spinner | Button, IconButton, SplitButton, LoadingOverlay, DataTable |
| Button | FilterBar, FileUpload, UploadManager, CommandBar visible actions |
| SearchBox | FilterBar, LogViewer |
| TextField | DataFilter |
| Select, VirtualList, EmptyState | LogViewer |
| IconButton | SearchBox, DataFilter |
| ProgressBar | UploadManager |
| ContextMenu | SplitButton, CommandBar, TreeTable |
| Menu | MenuButton (extension) |
| FilePicker | FileUpload (extension) |

- Use direct relative imports for standalone registration. Do not import the
  aggregate component index from inside a component.
- Keep public events and properties stable. Consume internal `cu-*` events
  when the parent exposes a different semantic event.
- Forward CSS parts with `exportparts` where an existing public part moves
  into a nested shadow root.
- Reuse semantic tokens and shared helpers for low-level native controls
  when composition would compromise ARIA relationships, form behavior,
  focus management or virtualization. Do not nest interactive buttons.
- Test composition, disabled/loading behavior, keyboard focus, density and
  Light/Dark themes before certifying browser parity.

Remaining audit candidates: CommandBar overflow and MenuButton triggers (keep native until popup ARIA is verified), FilePicker controls, menu/option row styles, and gallery reference HTML. These are not claimed to have been migrated yet.

ComponentUI is a general-purpose UI library for web applications, desktop tools, dashboards, developer tools and productivity workflows, not an ERP-specific toolkit. LogViewer is a preview component built by composing shared controls; it does not fetch logs or own application logging infrastructure.

JsonViewer composes TreeView, SearchBox, CodeBlock, SplitView and EmptyState. DiffViewer composes SplitView, CodeBlock and Badge. MarkdownEditor composes TextArea, SplitView, ScrollArea and CodeBlock. See [Developer tools](DEVELOPER_TOOLS.md) for the preview API and limits.

ImageViewer composes Image, Slider, Button, ScrollArea and Icon. TransferList composes ListBox, SearchBox and Button. CurrencyInput extends NumberField, and MaskedInput extends TextField to preserve the native form contract and shared validation. See [Image and input components](IMAGE_INPUT_COMPONENTS.md).

MentionInput extends AutoComplete and shares its suggestion overlay, keyboard handling and form lifecycle. PhoneInput and FormulaInput extend TextField and share the semantic validation hook in _field.js. QueryBuilder composes DataFilter, Select, Button, IconButton and EmptyState, and uses the same comparison engine as DataTable. See [Advanced inputs](ADVANCED_INPUTS.md).

PivotTable composes DataTable, Select and EmptyState, sharing QueryBuilder filtering and the canonical DataTable group identity utilities. Spreadsheet extends DataGrid, retaining its cell editing and context actions, and extends the existing FormulaInput arithmetic parser with a reference resolver. See [Data tools](DATA_TOOLS.md) for APIs and limits.

Scheduler composes Calendar, DatePicker, TimePicker, TextField, Button, Timeline and EmptyState. GanttChart extends DataTable to keep tasks and time bars aligned, using ProgressBar for completion. Both use _schedule.js and the existing Calendar date arithmetic. See [Scheduling tools](SCHEDULING_TOOLS.md).

MenuBar composes MenuButton and MenuItem using shared command normalization. Ribbon composes Tabs and CommandBar. Terminal composes VirtualList, TextField and Button and exposes command requests without executing a shell. WindowManager composes WindowPane, DockLayout, Button and EmptyState while preserving slotted content. See [Desktop tools](DESKTOP_TOOLS.md).

PDFViewer composes ImageViewer, Button, Spinner and EmptyState; the consumer supplies rendered page images or a page-rendering adapter, not an embedded PDF parser. ResourceCalendar composes Scheduler and Select. TimelineEditor composes Timeline, DatePicker, TextField, Select and Button. PropertyInspector composes TreeView, PropertyGrid, SplitView and EmptyState. See [Document and inspection tools](DOCUMENT_INSPECTION_TOOLS.md).

CommandConsole extends Terminal and composes CommandPalette and Kbd. KeyboardShortcutEditor uses Kbd, TextField and Button, without registering global shortcuts. ColorPalette shares ColorPicker parsing and formatting. FontPicker composes SearchBox and Select; fonts are supplied by the consumer, not downloaded or detected. See [Console and picker tools](CONSOLE_PICKER_TOOLS.md).

ChartEditor composes ChartContainer, PropertyGrid and SplitView. NotificationSettings composes SettingsPage, SettingsGroup, SettingsItem, Switch, Select and Button. ImageGallery composes Carousel, ImageViewer and Select. FileManager extends FileExplorer and adds CommandBar, retaining its existing ContextMenu and file tree validation. See [Workspace tools](WORKSPACE_TOOLS.md).

ThemeEditor composes ColorPalette, FontPicker, PropertyGrid and shared preview controls; custom tokens are scoped to its preview. ComponentDesigner uses DockLayout and PropertyInspector with an explicit component allowlist. WorkflowEditor composes KanbanBoard and shared form controls. NodeEditor uses PropertyGrid, SplitView, ContextMenu and shared controls to edit a bounded graph model. See [Design tools](DESIGN_TOOLS.md).

ShortcutSettings composes SettingsPage and KeyboardShortcutEditor; reset checks conflicts before committing. DocumentWorkspace composes WindowManager, PDFViewer and MarkdownEditor. DataInspector shares QueryBuilder filtering, DataTable context actions and JsonViewer. APIExplorer composes form controls, Tabs, CodeBlock and JsonViewer; the host owns HTTP transport and authorization. See [Application workspace tools](APPLICATION_WORKSPACE_TOOLS.md).

MediaLibrary composes FileManager, ImageGallery and MediaPlayer; the host owns media sources and file actions. DashboardDesigner composes DashboardShell, ChartEditor and ChartContainer. FormDesigner composes Form, PropertyInspector and form-associated controls with a local test submission. SchemaEditor composes PropertyInspector and JsonViewer for a bounded flat JSON Schema subset. See [Designer workspace tools](DESIGNER_WORKSPACE_TOOLS.md).
