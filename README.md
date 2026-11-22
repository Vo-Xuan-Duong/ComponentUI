# ComponentUI

**Fluent Calm** is an independent, Windows 11 / Fluent 2–inspired visual language for a reusable, cross-framework personal UI system.

**Current milestone — Independent package distribution (v0.9.0):** The repository contains platform-independent Design Tokens, a prioritized **129-item** component catalog, the first Button contract, reusable CSS reference styles, a theme preference controller, responsive interactive gallery and reusable DOM interaction controllers, and twenty-seven experimental browser Custom Elements. **There are 27 experimental Web Components and 0 production-ready releases.** The gallery combines reference HTML/CSS demos with real but not yet cross-browser-certified Custom Elements; nothing has been published as a package.

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
  icons/src/                           # 24 local Lucide SVG definitions (ISC/MIT)
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

The pnpm workspace now also contains `packages/web` with reusable progressive-enhancement controllers. Future production Web Components, React/Vue adapters and native renderers remain planned. They are **not implemented yet**. Web Components work across DOM-based frameworks; Flutter, React Native and SwiftUI require separate platform renderers.

## Documentation

- [Foundation milestones](docs/FOUNDATION_PLAN.md)
- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Component preview interactions](docs/COMPONENT_PREVIEWS.md)
- [Experimental Web Components API](docs/WEB_COMPONENTS.md)
- [Lucide Icon System](docs/ICON_SYSTEM.md)
- [React, Vue and Svelte adapters](docs/FRAMEWORK_ADAPTERS.md)
- [Independent package distribution and local tarballs](docs/PACKAGING.md)
- [Display and feedback component APIs](docs/DISPLAY_FEEDBACK.md)
- [Data, tree, list and menu component APIs](docs/DATA_COMPONENTS.md)
- [Fluent Calm style guide](docs/STYLE_GUIDE.md)
- [Component inventory](docs/COMPONENTS.md)
- [Architecture](docs/ARCHITECTURE.md)

## Design references and ownership

Fluent Calm draws inspiration from Windows 11 but is not an official Microsoft Design System, nor a reproduction of proprietary UI assets. Do not bundle Microsoft-owned fonts, icons or wallpapers. See [Microsoft Fluent 2](https://fluent2.microsoft.design/).

No package has been published. Licensing and third-party attribution policy must be finalized before any external release.

**v0.4.3 UI consistency:** Select and vertical Tabs no longer display left-edge accent bars in hover/active rows. Native-first UI feedback uses full-row backgrounds and clear text instead.
