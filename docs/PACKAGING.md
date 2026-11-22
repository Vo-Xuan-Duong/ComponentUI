# Local package distribution — ComponentUI v0.10.0

ComponentUI's packages now have **self-contained ESM `dist/` outputs** that
can be installed from tarballs in other repositories. This is an offline,
local distribution milestone: the packages remain `private: true` and **are
not published to npm or GitHub Packages**. Their UI behavior is still preview
quality until browser, visual, screen-reader and framework tests are executed.

## Package boundaries

| Package | Public imports | What is included |
| --- | --- | --- |
| `@componentui/theme` | `/tokens.css`, `/components.css`, `/theme.js` | Fluent Calm CSS tokens, optional reference CSS and theme controller |
| `@componentui/icons` | package root | Curated Lucide SVG paths and TypeScript types (ISC/MIT) |
| `@componentui/web` | `/components`, `/components/select`, other explicitly exported component subpaths, `/interactions` | Browser-native Custom Elements and helper controllers |
| `@componentui/react` | package root or `/components` | React 18/19 wrapper factory or 38 named wrappers (experimental) |
| `@componentui/vue` | package root | Vue 3 compiler helper and `v-cu-model` directive |
| `@componentui/svelte` | package root | Svelte 5 `cuModel` and `cuEvents` DOM actions |

The **Web package vendors a copy of Lucide's curated SVG node definitions
into its own `dist/internal/`**. It no longer imports files outside its
package after build, so installing `@componentui/web` by itself does not
require a separately installed `@componentui/icons`. The license notices
ship with it as `dist/THIRD_PARTY_LUCIDE_LICENSE.txt`.

Web Components work in DOM/webview renderers, not in React Native, Flutter,
Qt, SwiftUI or other native widget trees.

## Build, verify and create distributable tarballs

From ComponentUI repository root (Node.js 20+, npm):

```bash
npm run check
npm run build:packages
npm run packages:verify
npm run pack:local
```

- `build:packages` copies ESM files to each package's `dist/`,
  generates a self-contained internal icon graph in `@componentui/web`,
  and preserves types. Does not require a bundler or network.
- `packages:verify` checks every public `exports` target exists and
  relative JS imports stay inside that package, then runs Node import
  smoke checks for SSR-safe module evaluation.
- `pack:local` builds and verifies again before running `npm pack`.
  It writes `.tgz` packages to `artifacts/`, which is Git-ignored.
  This command is **not** `npm publish`.
- `npm run preview` still uses the original `src/` files and does not
  depend on generated distribution artifacts.

You can also build a single package with
`npm run build --workspace @componentui/web`; it vendors the icons
it needs even when built alone.

### Install into another repository without npm publishing

Make a sibling Vite/React/Vue/Svelte project and install the tarballs.
Replace the local path with the actual absolute path to ComponentUI.

```bash
# In your consumer project, after creating a normal Vite project:
npm install /path/to/ComponentUI/artifacts/componentui-theme-0.10.0.tgz
npm install /path/to/ComponentUI/artifacts/componentui-web-0.10.0.tgz
# Optional: use ONE framework adapter below, after installing its framework:
npm install /path/to/ComponentUI/artifacts/componentui-react-0.10.0.tgz
# OR: npm install /path/to/ComponentUI/artifacts/componentui-vue-0.10.0.tgz
# OR: npm install /path/to/ComponentUI/artifacts/componentui-svelte-0.10.0.tgz
```

On Windows, use e.g.
`npm install "D:\\WorkSpace\\ComponentUI\\artifacts\\componentui-web-0.10.0.tgz"`.
When repacking a version, reinstall the resulting tarball in the consumer
project so the new contents replace the old cached copy.

The resulting tarball is ESM; the consumer's Vite build processes imports,
CSS and any browser JS features. The package doesn't include React, Vue,
Svelte, Electron or the Tauri Rust runtime.

## Basic HTML / JavaScript / Vite

```js
import "@componentui/theme/tokens.css";
import "@componentui/web/components";
// Import one registration subpath if preferred:
// import "@componentui/web/components/select";
```

```html
<cu-select name="platform" label="Target">
  <option value="web">Web</option>
  <option value="desktop">Desktop</option>
</cu-select>
```

Theme variables must be loaded in your application; the Custom Elements
contain fallback values but require tokens for visual consistency.

## React 18/19

Install React in the consumer project first. Preferred direct wrappers:

```tsx
"use client";
import { Select, Button, Icon } from "@componentui/react/components";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";

// In an interactive React component:
<Select name="platform" label="Target" value={platform}
  onCuChange={event => setPlatform(String(event.detail.value ?? ""))}>
  <option value="web">Web</option>
  <option value="desktop">Desktop</option>
</Select>
<Button variant="accent"><Icon name="check" size={18} /> Save</Button>
```

The existing dependency-injection API
`createReactComponents(React)` is still available from the package root.
Both APIs need the Web Custom Elements registration import. In Next.js,
put interactive components and registration behind a client entry.
Full SSR/hydration and Strict Mode integration remain to be tested.

## Vue 3 / Vite

Use `@vitejs/plugin-vue`'s **compile-time** custom-element recognition:

```ts
import vue from "@vitejs/plugin-vue";
import { isComponentUIElement } from "@componentui/vue";

export default {
  plugins: [vue({ template: { compilerOptions: {
    isCustomElement: isComponentUIElement
  } } })]
};
```

In `main.ts`:

```ts
import { createApp } from "vue";
import { ComponentUIVuePlugin } from "@componentui/vue";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";
import App from "./App.vue";
createApp(App).use(ComponentUIVuePlugin).mount("#app");
```

Use `v-cu-model` in SFCs; see `examples/vue/App.vue`.
Browser-specific event handling and hydration need real consumer tests.

## Svelte 5

`@componentui/svelte` has no runtime Svelte import: it exposes a DOM
action for binding Custom Element properties and `cu-*` events.

```svelte
<script lang="ts">
  import { cuModel } from "@componentui/svelte";
  import "@componentui/web/components";
  import "@componentui/theme/tokens.css";
  let platform = $state("web");
</script>

<cu-select name="platform" label="Target"
  use:cuModel={{value: platform, event:"cu-change",
    onUpdate: (next) => platform = String(next ?? "")}}>
  <option value="web">Web</option>
  <option value="desktop">Desktop</option>
</cu-select>
```

`cuEvents` can subscribe to multiple CustomEvents via a Svelte action.
SvelteKit requires client-only DOM usage and separate hydration checks.
The complete example is `examples/svelte/App.svelte`.

## Electron and Tauri

Both run a web frontend inside a desktop WebView. Use the *same* Web
Component import and CSS import in the renderer entry; examples are in
`examples/electron/renderer.js` and `examples/tauri/renderer.js`.

- **Electron:** use a Vite-built local renderer, `contextIsolation:true`,
  `nodeIntegration:false`, sandboxing, CSP, restrictive IPC and a
  secure application protocol where possible. Do not import components
  into the main process or expose Node.js to the renderer.
  Official security checklist: https://www.electronjs.org/docs/latest/tutorial/security
- **Tauri 2:** build a static Vite frontend and configure
  `build.frontendDist`, `build.devUrl`, and appropriate capabilities.
  The example `tauri.conf.example.json` contains sample values and is
  **not** a complete Rust/Tauri app.
  Official frontend checklist: https://v2.tauri.app/start/frontend/

## Release and compatibility rules

- Keep all packages `private:true` during the preview period. No public
  npm scope ownership, publishing credentials or license grants have been
  assumed. First-party code is explicitly `UNLICENSED` until the owner
  chooses an appropriate license. Third-party Lucide licenses are retained.
- One unified 0.10.0 package version is used for this milestone. Only change
  public exports and events with documented semver-compatible migrations.
- Build output under `dist/` and `artifacts/` is intentionally ignored by
  Git. **No GitHub Actions or remote CI jobs are created or run.**
- Before a release, run local browser tests, keyboard/screen reader checks,
  React/Vue/Svelte consumer builds, Electron/Tauri renderer builds and
  verify the actual installed `.tgz` contents.
- The scripts verify manifest/import integrity and Node-side import safety;
  they do **not** prove visual, SSR hydration or accessibility correctness.

## UI refinement in v0.10.0

`@componentui/web/components` now includes `cu-textarea`,
`cu-number-field` and `cu-search-box`. Their individual ESM paths are
`@componentui/web/components/text-area`,
`@componentui/web/components/number-field` and
`@componentui/web/components/search-box`. The build copies these files into
each self-contained distribution, and `@componentui/react/components`
exports matching wrappers. The bundled Lucide set now includes 25 icon
definitions, including the new `minus` glyph. All packages remain
private and intended for local tarball trials.
