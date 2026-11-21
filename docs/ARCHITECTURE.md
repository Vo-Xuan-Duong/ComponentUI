# Platform architecture

```text
                     Design tokens + component contracts
                                |        |
                         generators + validators
                                |
                 +--------------+----------------+
                 |              |                |
               Web           React Native      Flutter/Native
           Lit + HTML        native views       native renderers
                 |
           React / Vue / Angular / Svelte / HTML
                 |
           Electron / Tauri / Browser
```

Design tokens and contracts are the common source. A Web Component does not run directly in Flutter, SwiftUI, WPF, Qt or React Native.

## Ports and adapters

- **Port:** component contract, semantic state model and accessibility behavior.
- **Adapter:** rendering framework-specific UI, lifecycle, event bindings and platform idioms.
- **Shared utilities:** only functions that actually run on compatible runtimes; avoid forcing JavaScript into native stacks.
- **Web foundation:** possible Lit + standards-based Custom Elements, with optional framework adapters where needed. Choose mature accessible dependencies for complex widgets rather than building from scratch.

## Repo plan

- `design-system/` tokens and component specs (framework-independent)
- `packages/theme/` generated tokens and styles
- `packages/web/` future Web Components
- `packages/react/` / `packages/vue/` future wrappers
- `apps/playground-web/` planned visual gallery (not implemented yet)
- `tests/` static integrity tests now; Playwright, visual and accessibility tests later

## Safe upgrade path

Develop one mature Web renderer and a representative app first. Only start native renderers when a real use case justifies the cost. Pin library versions, maintain contracts and semantic versioning, and include migration scripts for breaking changes.
