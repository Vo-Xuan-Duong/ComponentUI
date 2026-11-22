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
