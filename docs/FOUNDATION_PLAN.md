# ComponentUI — Foundation before components

**Scope:** Build a reusable, cross-framework design system with **Fluent Calm** (Windows 11 / Fluent 2 inspired) as the default style. The components listed in `design-system/components/catalog.json` are a **backlog**, not shipped software.

## Order of operations

### F0 — Product & visual direction (design sign-off)
- [x] Choose an independent visual language: Fluent Calm; reference Windows 11, avoid copying Microsoft's proprietary assets
- [x] Identify broad audiences: web apps, dashboards, developer tooling and desktop shells
- [ ] Approve a reference page in light and dark mode: Buttons, forms, navigation, cards, tables, dialogs, notifications
- [x] Prototype three density profiles in gallery: compact, comfortable and touch (component review pending)
- [ ] Document typography, icon policy, shape, elevation, motion, responsiveness and material fallbacks
- [ ] Validate contrast/focus colors and obtain visual approval of keyboard and accessibility states

**Done when:** a single preview page shows the same design language across the primary components in light/dark, 320px/mobile and desktop widths. Changes to tokens can be judged visually.

### F1 — Tokens and design architecture
- [x] Create a DTCG 2025.10 JSON token source and CSS generator
- [x] Establish light/dark semantic colors and baseline typography/spacing/radius/motion
- [ ] Audit token structure and reference resolution against DTCG format; introduce schema validation
- [ ] Add component/state tokens (e.g. Button padding, Input height, focus ring, overlay/elevation, density)
- [ ] Add high-contrast/reduced-transparency/reduced-motion policies; ensure accessibility variants
- [x] Implement system/light/dark preference and blue/purple/green accents for the visual gallery; future production token validation remains
- [ ] Generate at least CSS + TS exports, and test that generated output is up-to-date
- [ ] Document how later Flutter, SwiftUI, Compose renderers consume the same source data

**Done when:** tokens can regenerate repeatably, are framework independent, and produce a complete and testable reference theme.

### F2 — Repository / toolchain
- [x] Establish pnpm workspace for theme and playground; web-core/adapters remain planned
- [ ] Establish TypeScript strict config, ESLint, Prettier, path aliases and browser targets; theme package export map exists
- [ ] Choose Lit Custom Elements for web-core; keep React/Vue wrappers independent
- [x] Add an HTML/JS reference gallery and no-framework visual consumer (Storybook remains optional)
- [ ] Add Playwright + axe accessibility checks and locally executable cross-browser tests (Chromium, Firefox, WebKit)
- [x] Add initial static integrity tests runnable locally (no GitHub Actions)
- [ ] Run and verify local checks on maintainer's machine; generated-token drift is included in `npm run check`
- [ ] Add Changesets, release/versioning policy and package license/third-party attribution policy

**Done when:** `pnpm install`, typecheck, lint, unit tests, gallery build and preview all pass locally.

### F3 — Component standards
- [x] Create a prioritized 129-entry catalog (P0/P1/P2)
- [x] Draft a Button contract as a first example
- [ ] Standardize contract schema: name, variant, size, disabled, busy, readOnly, events, slots, keyboard, roles
- [ ] Define state matrix: default, hover, active, focus-visible, selected, disabled, error, loading
- [ ] Specify accessibility rules per component (keyboard, focus order, ARIA, screen-reader feedback)
- [ ] Define responsive, RTL/i18n and reduced-motion requirements
- [ ] Create a definition-of-done template and Storybook story template
- [ ] Validate the contracts of Button, TextField, Select, Dialog, Tabs and DataTable as reference examples

**Done when:** every future component can be implemented by following one documented contract + acceptance template.

## Local-only validation policy

- **Do not add or run GitHub Actions**. The maintainer will run build/test commands on their own machine.
- Local commands should include token generation/check, unit tests, lint, typecheck, and (when available) browser/visual/accessibility tests.
- Never claim checks are passing unless the maintainer or a local execution has actually verified them.

## Implemented foundation preview (not production components)

- [x] Reusable Fluent Calm visual CSS classes for common controls and surfaces
- [x] Responsive HTML reference gallery with local-only static server
- [x] Theme/density/accent toolbar and native dialog, toast, tabs and catalog interactions
- [x] Add Node-based theme and preview integration tests (must be verified by maintainer locally)

## Progressive-enhancement batch (local preview only)

- [x] Remove placeholder glyphs and the left-edge selection bar from sidebar links
- [x] Add Accordion, Tooltip, Popover, Menu, Drawer, Empty State, Pagination and Command Palette gallery examples
- [x] Extract Menu, Popover, Dialog trigger, Pagination and Command Palette behavior into reusable `packages/web/src/interactions.js`
- [x] Add Node tests for pagination, command filtering, keyboard navigation helpers and static integration
- [ ] Run tests locally and verify behavior in Chromium, Firefox and WebKit
- [ ] Audit keyboard and assistive technology behavior before marking components production-ready

Reference documentation: [Component previews](COMPONENT_PREVIEWS.md).

## First experimental Web Components (v0.2.0)

- [x] Implement form-associated `cu-button`, `cu-text-field`, `cu-checkbox`, and `cu-switch` using native controls + ElementInternals
- [x] Implement `cu-dialog` on the native modal dialog element
- [x] Export individual component modules and ESM registry with TypeScript declarations
- [x] Add real Custom Elements examples to the existing Fluent Calm Playground
- [x] Add experimental API documentation and component contract drafts
- [ ] Maintainer runs local tests and validates real forms, focus, keyboard and contrast
- [ ] Add browser integration tests, React/Vue smoke tests and accessibility review
- [ ] Promote each component to `ready` only after every quality gate

**Status:** implementation complete in source code; production certification and local validation remain outstanding.

## Second Web Components wave — v0.3.0

- [x] Implement `cu-select` backed by native select and declarative option/optgroup
- [x] Implement `cu-radio-group` and `cu-radio` child definitions using native radio inputs
- [x] Implement slotted `cu-tabs` and `cu-tab` with roving focus and ARIA tab panels
- [x] Implement non-interactive `cu-tooltip` and non-modal `cu-popover`
- [x] Expand package exports, TypeScript declarations, design contracts, Playground and Node source tests
- [ ] Run local tests and smoke-test in supported browsers
- [ ] Audit keyboard, focus return, screen reader descriptions, native form reset and validity, and responsive visuals
- [ ] Add React/Vue consumer tests before promoting component status to ready

No GitHub Actions are used. Experimental UI stays at catalog status `preview`.


## Third Web Components wave — v0.4.0

- [x] Implement native form-associated `cu-date-picker` and `cu-slider`
- [x] Implement `cu-progress-bar`, `cu-badge`, and `cu-avatar` with Fluent Calm tokens
- [x] Implement custom `cu-menu` using data-only `cu-menu-item` declarations
- [x] Add custom elements registry entries, package subpath exports, TypeScript declarations, docs and contracts
- [x] Extend Playground with interactive FormData, progress and menu examples
- [x] Add static/Node tests and update catalog previews
- [ ] Maintainer executes `npm run check` and tests keyboard, focus, browser rendering and accessible semantics locally
- [ ] Create automated browser tests and framework integration tests before moving from preview to ready

**Status:** source implementation staged; browser accessibility and compatibility not yet verified.

## Unified Iconography — v0.5.0

- [x] Select Lucide SVG as the single modern icon source
- [x] Bundle 24 curated icons locally with the official ISC/MIT attribution notices
- [x] Implement reusable `cu-icon` with size/stroke/color and decorative/accessibility modes
- [x] Update Quick actions, Settings, breadcrumbs, buttons and overlay close icons
- [x] Add a dedicated Iconography preview gallery, TypeScript declarations and local source tests
- [ ] Maintainer validates browser rendering, dimensions, accessibility and Light/Dark contrast locally

## Cross-framework adapters — v0.6.0

- [x] Create React 18/19 wrappers for every browser Custom Element and declarative child tag
- [x] Bridge native `cu-*` DOM events to `onCu*` callback properties and forward refs
- [x] Synchronize controlled properties without relying on custom-attribute string serialization
- [x] Create Vue 3 Custom Element compile-time recognition helper and `v-cu-model` directive
- [x] Add React TSX/Vue SFC examples, documentation, and dependency-free Node adapter tests
- [ ] Maintainer verifies React 18/19, Vue 3, Vite and browser interactions locally
- [ ] Validate SSR/hydration, strict-mode lifecycle and accessibility in real apps
- [ ] Make each package independently publishable and resolve icon imports without monorepo-only paths

No GitHub Actions; framework integrations remain experimental.

## Fourth browser component wave — v0.7.0

- [x] Add `cu-card` and `cu-divider` for composable layout and separators
- [x] Add motion-aware `cu-skeleton` and `cu-spinner` for loading states
- [x] Add `cu-alert` with semantic roles, Lucide icons, optional dismissal and `cu-dismiss`
- [x] Add `cu-breadcrumb` and declarative `cu-breadcrumb-item` with safe links and current-page semantics
- [x] Extend TypeScript registry, ESM package exports, React wrapper tags, local gallery and catalog
- [x] Add source-level tests and component contracts
- [ ] Maintainer executes `npm run check`, keyboard tests and screen-reader/browser checks locally
- [ ] Validate responsive layouts, forced colors and reduced-motion visuals in actual target browsers
- [ ] Publish only after independent packaging and accessibility release gates are satisfied

**Status:** source implemented; six new entries marked `preview`, not production-ready.
No GitHub Actions.

## Fifth browser component wave — v0.8.0

- [x] Implement DataTable with safe text rendering, stable sorting, client pagination, row selection and actions
- [x] Implement TreeView with declarative hierarchy, expansion and keyboard navigation
- [x] Implement form-associated ListBox and strict-selection editable Combobox
- [x] Implement ContextMenu for right-click and Shift+F10 with viewport-aware placement
- [x] Add component contracts, TypeScript exports, React integration and Playground examples
- [x] Expand the component backlog by one new ListBox entry; total 129
- [x] Add source-level unit tests and update catalog counts
- [ ] Maintainer runs local tests and validates real browser interactions and keyboard/screen reader behavior
- [ ] Add browser-level regression suite and robust large-dataset/virtualization tests
- [ ] Promote previews only after independent packaging, framework and accessibility gates pass

**Status:** 27 experimental Web Components, 32 catalog previews, 97 planned and 0 production-certified. No GitHub Actions.

## Local independent package distribution — v0.9.0

- [x] Create `dist/` ESM outputs for theme, icons, Web Components, React and Vue
- [x] Add Svelte 5 Custom Element actions, ESM export and type declarations
- [x] Give React a named component export in addition to the existing factory API
- [x] Remove monorepo-only icon imports from built Web/React distributions; preserve third-party license notices
- [x] Add local offline build, export graph verification, SSR import smoke checks and tarball packaging scripts
- [x] Document importing local tarballs in React, Vue, Svelte, Electron and Tauri
- [x] Keep all package manifests private and avoid GitHub Actions
- [ ] Maintainer performs local build/tests, checks installed tarballs and signs off on real browser/framework behavior
- [ ] Decide first-party license and registry ownership before publishing
- [ ] Add strict TS compilation and cross-browser integration verification before marking packages ready

**Status:** package distribution scripts and examples implemented; not executed/certified.

## Forms and UI completion milestone — v0.10.0

- [x] Implement form-associated `cu-textarea` with maxlength counter and autosize
- [x] Implement native-validating `cu-number-field` with Lucide plus/minus steppers
- [x] Implement `cu-search-box` with search, clear and FormData integration
- [x] Wire browser registry, React named wrappers, TypeScript declarations and package exports
- [x] Modernize Playground hero/surfaces/navigation/toolbar/responsive layout
- [x] Integrate real SearchBox into the Playground catalog and update live metrics
- [x] Add contracts, source-level tests and responsive/accessibility acceptance checklist
- [ ] Maintainer runs local `npm run check`, package verification and actual browser UI tests
- [ ] Complete manual keyboard, screen-reader and responsive validation
- [ ] Continue addressing remaining 94 planned catalog entries according to priority

**Current state:** 30 experimental browser Custom Elements, 35 preview catalog entries,
94 planned and 0 production-certified. No GitHub Actions.

## First implementation wave (only after foundation gates)

1. **Core primitives:** Button, IconButton, TextField, Checkbox, Radio, Switch, Select, Tabs, Dialog, Tooltip
2. **App building blocks:** Card, Badge, Avatar, Sidebar, Menu, Popover, Drawer, Accordion
3. **Productivity:** DataTable, TreeView, CommandPalette, FileUpload, DatePicker

Complex widgets (rich text editor, virtual grid, media player, file explorer) need separate feasibility/accessibility/license reviews before implementation.

## Quality gate for a production-ready component
- [ ] Public contract documented; no framework-specific assumptions in source contract
- [ ] Semantic tokens only; light/dark + compact/comfortable/touch shown
- [ ] Keyboard, focus-visible, ARIA names/roles/states and error announcements validated
- [ ] Unit + integration + visual + basic axe checks, including keyboard paths
- [ ] Tested in vanilla web and at least one framework adapter
- [ ] Versioned, documented with examples, and added to changelog
- [ ] Catalog status only changes from `planned` to `ready` after all checks are complete

## Scope boundaries

Web Components can serve web apps, React, Vue, Angular, Svelte, Electron and Tauri, with framework adapters as needed. Flutter, React Native, SwiftUI, Qt and other native environments require platform renderers; they share tokens, contracts and design intent, not DOM components.

## External design references
- Fluent Design Tokens: https://fluent2.microsoft.design/design-tokens/
- Fluent Shapes: https://fluent2.microsoft.design/shapes/
- Windows Materials: https://learn.microsoft.com/en-us/windows/apps/develop/ui/materials
- DTCG Format: https://www.designtokens.org/tr/2025.10/
