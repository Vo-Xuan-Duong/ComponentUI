# ComponentUI

**Fluent Calm** is an independent, Windows 11 / Fluent 2–inspired visual language for a reusable, cross-framework personal UI system.

**Current milestone — Foundation preview (v0.1.0):** The repository contains platform-independent Design Tokens, a prioritized **128-item** component backlog, the first Button contract, reusable CSS reference styles, a theme preference controller and a responsive interactive gallery. **There are still 0 production-ready Web Components.** The gallery uses native HTML + CSS to validate visual direction; it is not a published component package.

## Preview locally

Requires Node.js 20+ (no third-party runtime dependencies in this milestone).

```bash
git clone https://github.com/Vo-Xuan-Duong/ComponentUI.git
cd ComponentUI
npm run check    # static, unit and token consistency checks
npm run preview  # http://127.0.0.1:4173/apps/playground-web/
```

Open [local preview](http://127.0.0.1:4173/apps/playground-web/). Use the top toolbar to switch **System / Light / Dark**, **Compact / Comfortable / Touch** and the **Blue / Purple / Green** accent palette. Test native dialog, toasts, keyboard-accessible tabs and the searchable planned-component catalog. Open the gallery through the server, **not** by double-clicking its HTML file (JSON fetch requires HTTP).

> **Local-only policy:** GitHub Actions are deliberately not used. The maintainer performs all builds and tests locally. None of the implementation should be described as verified until local checks are actually run.

## Current structure

```text
design-system/
  tokens/fluent-calm.tokens.json       # Source of truth: DTCG tokens
  components/catalog.json             # 128 planned component/pattern entries
  components/button.contract.json     # Initial behavior and API contract
packages/
  theme/
    src/tokens.css                    # Generated tokens; do not edit
    src/components.css                # Reusable preview visual primitives (not Web Components)
    src/theme.js                      # Framework-neutral theme preference controller
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

The pnpm workspace is prepared for future `web-core`, React/Vue adapters and native renderers. They are **not implemented yet**. Web Components work across DOM-based frameworks; Flutter, React Native and SwiftUI require separate platform renderers.

## Documentation

- [Foundation milestones](docs/FOUNDATION_PLAN.md)
- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Fluent Calm style guide](docs/STYLE_GUIDE.md)
- [Component inventory](docs/COMPONENTS.md)
- [Architecture](docs/ARCHITECTURE.md)

## Design references and ownership

Fluent Calm draws inspiration from Windows 11 but is not an official Microsoft Design System, nor a reproduction of proprietary UI assets. Do not bundle Microsoft-owned fonts, icons or wallpapers. See [Microsoft Fluent 2](https://fluent2.microsoft.design/).

No package has been published. Licensing and third-party attribution policy must be finalized before any external release.
