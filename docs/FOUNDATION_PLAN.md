# ComponentUI — Foundation before components

**Scope:** Build a reusable, cross-framework design system with **Fluent Calm** (Windows 11 / Fluent 2 inspired) as the default style. The components listed in `design-system/components/catalog.json` are a **backlog**, not shipped software.

## Order of operations

### F0 — Product & visual direction (design sign-off)
- [x] Choose an independent visual language: Fluent Calm; reference Windows 11, avoid copying Microsoft's proprietary assets
- [x] Identify broad audiences: web apps, dashboards, developer tooling and desktop shells
- [ ] Approve a reference page in light and dark mode: Buttons, forms, navigation, cards, tables, dialogs, notifications
- [ ] Specify three density profiles: compact, comfortable and touch
- [ ] Document typography, icon policy, shape, elevation, motion, responsiveness and material fallbacks
- [ ] Validate contrast/focus colors and obtain visual approval of keyboard and accessibility states

**Done when:** a single preview page shows the same design language across the primary components in light/dark, 320px/mobile and desktop widths. Changes to tokens can be judged visually.

### F1 — Tokens and design architecture
- [x] Create a DTCG 2025.10 JSON token source and CSS generator
- [x] Establish light/dark semantic colors and baseline typography/spacing/radius/motion
- [ ] Audit token structure and reference resolution against DTCG format; introduce schema validation
- [ ] Add component/state tokens (e.g. Button padding, Input height, focus ring, overlay/elevation, density)
- [ ] Add high-contrast/reduced-transparency/reduced-motion policies; ensure accessibility variants
- [ ] Decide theme inheritance and overrides (OS automatic mode, user-selected light/dark, custom accent)
- [ ] Generate at least CSS + TS exports, and test that generated output is up-to-date
- [ ] Document how later Flutter, SwiftUI, Compose renderers consume the same source data

**Done when:** tokens can regenerate repeatably, are framework independent, and produce a complete and testable reference theme.

### F2 — Repository / toolchain
- [ ] Establish pnpm workspace with clear package boundaries: tokens, theme, web-core, adapters, docs/playground
- [ ] Establish TypeScript strict config, ESLint, Prettier, path aliases, package exports and browser targets
- [ ] Choose Lit Custom Elements for web-core; keep React/Vue wrappers independent
- [ ] Add Storybook or equivalent reference gallery and a no-framework smoke-test consumer
- [ ] Configure Vitest, Playwright, axe accessibility checks, and multi-browser CI (Chromium, Firefox, WebKit)
- [x] Add basic CI entrypoint and initial static integrity tests
- [ ] Run and verify CI is green; include generated-token drift check in pull requests
- [ ] Add Changesets, release/versioning policy and package license/third-party attribution policy

**Done when:** `pnpm install`, typecheck, lint, unit tests, gallery build and preview all pass in CI.

### F3 — Component standards
- [x] Create a prioritized 128-entry catalog (P0/P1/P2)
- [x] Draft a Button contract as a first example
- [ ] Standardize contract schema: name, variant, size, disabled, busy, readOnly, events, slots, keyboard, roles
- [ ] Define state matrix: default, hover, active, focus-visible, selected, disabled, error, loading
- [ ] Specify accessibility rules per component (keyboard, focus order, ARIA, screen-reader feedback)
- [ ] Define responsive, RTL/i18n and reduced-motion requirements
- [ ] Create a definition-of-done template and Storybook story template
- [ ] Validate the contracts of Button, TextField, Select, Dialog, Tabs and DataTable as reference examples

**Done when:** every future component can be implemented by following one documented contract + acceptance template.

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
