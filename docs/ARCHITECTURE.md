# Platform architecture

```text
            Design tokens + component contracts
                         |
                 Source validators
                         |
          +--------------+----------------+
          |              |                |
      Web renderer   React Native    Flutter/Native
     Lit + DOM       native views    native renderers
          |
    React / Vue / Angular / Svelte / HTML
          |
    Electron / Tauri / Browser
```

Design Tokens and Contracts are the cross-platform source of truth. **Web Components cannot run directly in Flutter, SwiftUI, React Native, Qt or native .NET UI.**

## Current implementation

- `design-system/`: initial DTCG token source and component backlog/contracts
- `packages/theme/`: generated CSS variables, reusable **preview-only** CSS classes and theme preference controller
- `apps/playground-web/`: responsive HTML/JS design reference with theme/density/accent switching, native modal, toast, tab navigation, forms and dynamic catalog
- `scripts/serve.mjs`: dependency-free local preview server
- `tests/`: Node-based consistency, theme preference and static preview integration tests
- `pnpm-workspace.yaml`: boundary declaration for packages and apps

## Future ports and adapters

- **Port:** framework-neutral component contract including states, events, semantics and accessibility.
- **Adapter:** framework-specific rendering, lifecycle, state binding and event transport.
- **Shared logic:** reuse only logic compatible with platform runtimes, rather than wrapping native toolkits with a web dependency.

The Web Renderer will use standards-based Custom Elements (potentially Lit) when Foundation gates are satisfied. React/Vue adapters can follow. A gallery control is not automatically a production `<cu-button>` implementation.

## Build and verification

This project intentionally uses **no GitHub Actions**. Local instructions are in [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md). Browser rendering and accessibility/visual regression tests will be added in a future milestone.

## Upgrade path

Build one stable Web Renderer and a reference application before starting native renderers. Share contracts and semantic tokens, maintain Semantic Versioning, and document migrations for breaking API changes.
