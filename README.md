# ComponentUI

**ComponentUI — Fluent Calm** is a platform-agnostic personal design system inspired by the interaction clarity, geometry, typography and layered surfaces of Windows 11 / Fluent 2, adapted for web, mobile and desktop products.

**Current state:** Style specification, DTCG tokens, generator, complete component inventory and an interactive HTML/CSS gallery. The gallery showcases visual primitives and native HTML interactions; it is **not** a published library of production-ready components.

## Quick start

Requires Node.js 20+.

```bash
npm run check
npm run preview
# Open http://localhost:4173/apps/playground-web/
```

No third-party dependencies are needed for this first foundation milestone.

## Source of truth

- `design-system/tokens/fluent-calm.tokens.json` — platform-independent tokens in DTCG format.
- `design-system/components/catalog.json` — complete component backlog with priorities and implementation status.
- `design-system/components/button.contract.json` — first canonical behavior/API contract.
- `packages/theme/src/tokens.css` — **generated**, do not edit manually.
- `packages/theme/src/components.css` — reusable Fluent Calm visual classes for the web preview.
- `apps/playground-web/` — dependency-free reference gallery.

## Repository evolution

```text
design-system/  -> tokens, assets, contracts
packages/theme/ -> CSS & theme output
packages/web/   -> future Lit/Web Components
packages/react/ -> future React wrappers
packages/vue/   -> future Vue integration
packages/native/-> future native renderers (only when needed)
apps/           -> gallery, docs and platform playgrounds
```

One visual specification does not mean one code renderer: Web Components can be reused across browser frameworks; React Native, Flutter, SwiftUI and native UI require implementations matching their rendering/runtime systems.

## Design and licensing

Fluent Calm is **inspired by** Windows 11, not an official Microsoft design system or an implementation of Microsoft's proprietary UI assets. Do not copy Windows icons, wallpapers or fonts into the repository. Prefer system font fallbacks and appropriately licensed icon packages.

See [Style Guide](docs/STYLE_GUIDE.md), [Component Catalog](docs/COMPONENTS.md), and [Architecture](docs/ARCHITECTURE.md).
