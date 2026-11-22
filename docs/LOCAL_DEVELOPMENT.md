# Local development — no GitHub Actions

The maintainer runs all builds and tests on their own machine. This repository intentionally **does not contain a GitHub Actions workflow**.

## Prerequisites
- Node.js 20 or later
- npm (bundled with Node.js), or pnpm if you prefer the workspace

## Quick start

```bash
git clone https://github.com/Vo-Xuan-Duong/ComponentUI.git
cd ComponentUI
npm run check
npm run preview
```

Open http://127.0.0.1:4173/apps/playground-web/ in your browser.

The first playground has no runtime npm dependencies. No `npm install` is required just to run the static preview; workspace packages are declared for future integration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run preview` | Start local preview server (default port 4173, `PORT` is supported) |
| `npm run tokens:build` | Rebuild generated CSS from design-system JSON |
| `npm run tokens:check` | Fail if generated CSS doesn't match JSON source |
| `npm run syntax:check` | Parse-check locally maintained JavaScript files |
| `npm test` | Run Foundation + Playground unit/contract tests |
| `npm run check` | Run the token, syntax and unit checks |

## What is and is not tested

The local checks validate source consistency and app structure. They **do not yet verify** browser screenshots, layout regressions, keyboard accessibility, screen reader experience, SSR hydration or compatibility in real React/Vue applications. Those are milestones for later releases.

Twenty-two experimental native Web Components are now available in the source tree (Button, TextField, Checkbox, Switch, Dialog, Select, RadioGroup, Tabs, Tooltip, Popover, DatePicker, Slider, ProgressBar, Badge, Avatar, Menu, Card, Divider, Skeleton, Spinner, Alert, Breadcrumb). They are **not** published or production-certified. Try them in the Real Web Components section of the gallery. See `docs/WEB_COMPONENTS.md`.

## Manual browser smoke checks for v0.4.0

1. Open Light, Dark and System modes; try compact and touch density at desktop and 375px width.
2. In the Real Web Components area, submit the DatePicker + Slider form and confirm `FormData` shows the expected date and numeric string.
3. Reset the native form and verify DatePicker/Slider return to initial values.
4. Press arrow keys on Slider; check the displayed number and `cu-input`/`cu-change` events.
5. Advance/Reset ProgressBar; confirm its percentage and indeterminate second example.
6. Check Badge contrast and Avatar initials in both themes; no external images are required.
7. Open Menu with ArrowDown, navigate with Arrow keys/Home/End, select with Enter, dismiss with Escape or outside click; check disabled actions cannot be selected.
8. Verify screen reader labels, forced-colors mode, focus return, and reduced motion manually. These are **not** certified by Node tests.

No GitHub Actions or remote CI runs are required.

## Framework adapters (v0.6.0)

The React and Vue adapters are **source-only**, not published packages. The root
`npm run check` includes module import and property/event tests for them, but
does not install React, Vue, Vite or a TSX/SFC compiler. `npm run preview`
displays their sample code in the Framework adapters section, without executing
those frameworks.

To test actual integration, set up a React 18/19 or Vue 3 app locally inside
the monorepo, link workspace packages and install the framework toolchain
yourself. See [FRAMEWORK_ADAPTERS.md](FRAMEWORK_ADAPTERS.md) for the correct
imports, Vite compiler option and manual test matrix.

## Display and feedback components (v0.7.0)

Run `npm run check` locally for module/test coverage, then `npm run preview` and
open the Real Web Components area. Inspect Card, Divider, Skeleton, Spinner, Alert
and Breadcrumb across Light/Dark, compact/touch density, reduced motion,
forced colors and keyboard-only interaction. Exercise Alert dismiss/restore and
dynamic Breadcrumb labels. These source-level tests are **not** browser
accessibility certification.

## Data and navigation components (v0.8.0)

The experimental DataTable, TreeView, ListBox, Combobox and ContextMenu
previews appear under Real Web Components. After `npm run check`, run
`npm run preview` and test sorting, page changes, keyboard navigation,
FormData validation, right-click and Shift+F10. In Dark/Light/High Contrast
and reduced-motion modes verify hover and focus are recognizable without
decorative accent stripes. See [DATA_COMPONENTS.md](DATA_COMPONENTS.md)
for the detailed acceptance matrix.

No GitHub Actions are added or executed. Node source tests are not
a substitute for browser or screen-reader validation.

## Select consistency audit — v0.8.1

The five remaining native dropdowns in Playground are now
`cu-select`: Theme, Density, Project type, Catalog Category and
Catalog Priority. They all use Fluent Calm hover/selected states.
Choose a dynamic catalog category to verify that appended `option`
children render. The new `tests/select-consistency.test.mjs`
guards against native `<select>` returning to Playground.
See [SELECT_UI.md](SELECT_UI.md) for the complete local checklist.
