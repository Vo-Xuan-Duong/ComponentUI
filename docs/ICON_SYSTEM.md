# ComponentUI Icon System — Lucide

ComponentUI now uses **Lucide** as its single icon source for browser UI. The icon set is stroke-based, follows the Fluent Calm visual language, and keeps icon rendering framework-independent.

## Source and licensing

- Official source: https://lucide.dev/ and https://github.com/lucide-icons/lucide
- Current bundle: **24 selected SVG icons**, stored in `packages/icons/src/data/`.
- Source data and icon definitions are distributed under Lucide's ISC license. Some icons are derived from Feather and carry additional MIT terms.
- The complete upstream notices are retained verbatim in [packages/icons/LICENSE](../packages/icons/LICENSE).
- No external icons CDN, remote font files or browser network calls are required at runtime.

These are Lucide vector paths, **not** Microsoft/Windows proprietary assets.

## Use icons in plain HTML

Load the theme token CSS and register the Web Component:

```html
<link rel="stylesheet" href="/packages/theme/src/tokens.css" />
<script type="module" src="/packages/web/src/components/icon.js"></script>

<cu-icon name="settings" size="20"></cu-icon>
<cu-icon name="search" size="18" stroke-width="1.75"></cu-icon>

<button type="button" aria-label="Edit item">
  <cu-icon name="pencil" size="18"></cu-icon>
</button>
```

The `cu-icon` custom element also registers when `packages/web/src/components/index.js` is imported.

### API

| Attribute | Default | Description |
| --- | --- | --- |
| `name` | none | Curated Lucide icon name, such as `plus`, `pencil`, `ellipsis`, `check` |
| `size` | `20` | Size in pixels, limited to 12–64 |
| `stroke-width` | `2` | SVG stroke width, limited to 1–3 |
| `label` | none | Optional accessible name for a meaningful standalone icon |

Icons inherit `currentColor`. Override their color via CSS `color`. Component styling can set `--cu-icon-size` and `--cu-icon-stroke`.

**Accessibility:** icons are decorative by default (`aria-hidden="true"`). For icon-only actions, give the **button** an `aria-label`. Only set `label` on a standalone icon that itself conveys useful information.

### Component usage

The Quick actions card now uses Lucide `plus`, `pencil`, `ellipsis` and `check`. Settings rows, breadcrumbs, dropdown arrows and dialog/toast close controls also use the same source. The sidebar deliberately stays **text-only**.

### Browser-free icon data

The curated data is also exposed through `@componentui/icons` (workspace source: `packages/icons/src/icons.js`) for future React, Vue or native rendering adapters:

```js
import { ICON_NAMES, getIconNodes } from "./packages/icons/src/icons.js";
console.log(ICON_NAMES);
console.log(getIconNodes("pencil"));
```

The registry returns SVG primitive nodes and attributes, **not** HTML markup or icon fonts. It can be rendered with `createElementNS` or another platform renderer. It does not download external SVGs.

### Adding an icon to the curated set

1. Locate the icon in Lucide's official `icons/` SVG directory and verify the name.
2. Add its SVG primitives to one of the `packages/icons/src/data/` modules, retaining 24×24 SVG coordinates.
3. Add the name to the `IconName` union in `packages/icons/src/icons.d.ts`.
4. Keep [packages/icons/LICENSE](../packages/icons/LICENSE) with the distributed icon data, including ISC and Feather MIT notices.
5. Add a Playground tile and an import/registry test if it's used in application UI.

A full Lucide package integration can be considered when the library is ready for npm publishing. For now, the curated local set keeps the Playground fast and dependency-free.

## Test locally

```bash
git pull origin main
npm run check
npm run preview
```

Open **Actions → Iconography** to inspect icon sizes, colors and styling. Cross-browser screenshots and visual alignment must still be checked locally; no GitHub Actions are used.
