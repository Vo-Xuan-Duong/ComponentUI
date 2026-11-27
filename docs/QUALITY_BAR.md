# ComponentUI quality bar — Fluent Calm, HeroUI-class finish

**Status:** first interaction-quality milestone implemented on the main
branch. **No production-certified components or published packages.**

## Goal

Achieve the user-facing refinement of mature libraries such as HeroUI
while preserving ComponentUI's own Fluent Calm design language and
framework-neutral native Custom Element architecture.

Reference material: [HeroUI design principles](https://heroui.com/en/docs/react/getting-started/design-principles),
[HeroUI animation](https://heroui.com/en/docs/react/getting-started/animation),
and [HeroUI v3](https://heroui.com/en/docs/react/releases/v3-0-0).
These are **quality benchmarks**, not copied implementation, designs,
source code, branding or a dependency on React Aria/Tailwind.

## Non-negotiable criteria for a ready component

| Dimension | Required result | Validation |
| --- | --- | --- |
| Visual fidelity | Unified geometry, semantic color tokens, typography, spacing and dark surfaces | Screenshot comparison and design review |
| Interaction states | Default, hover, active/pressed, keyboard focus, selected, disabled, loading, invalid and empty where applicable | Real pointer/keyboard interaction tests |
| Accessibility | Accessible name, correct role/state, keyboard behavior, focus restoration, error messaging, high contrast | WCAG 2.2 AA review and screen reader/browser tests |
| Motion | Intentional CSS-only motion, no content jumps, reduced-motion support | Browser motion test at 1x and reduced |
| Responsive | 320px to desktop, 200% zoom, density compact/comfortable/touch | Browser viewport matrix |
| Framework and API | Stable DOM behavior, typed props and events, standalone imports, React/Vue/Svelte, desktop webviews | Installed-package integration smoke tests |
| Documentation | Live example, full API, states, variants, slots/parts and migration guidance | Maintainer review |
| Reliability | Unit, DOM, visual regression, and performance tests for large collections | Local tests and release checklist |

Every component must pass applicable rows **before** moving from
`preview` to `ready`. The mere presence of styles or a Web Component
implementation does not qualify it for production.

## Implemented in the first milestone

- Native Button, TextField, Checkbox and Switch share coherent state
  recipes through `packages/web/src/components/_shared.js`.
- CSS preview controls use matching state tokens through
  `packages/theme/src/components.css`.
- Select distinguishes hover/keyboard-active rows from its persistent
  selection, has visible invalid/disabled/focus states and uses a small
  CSS entry animation that is removed for reduced motion.
- The Playground uses a **left navigation rail** on desktop, with a collapsible
  section menu on narrow screens and a separate preview preferences toolbar.
- A real **Visual Quality Lab** demonstrates Button variants, loading,
  disabled, TextField validation, Select, Checkbox and Switch under
  existing theme, density and accent preferences.
- `npm run quality:check` checks **71 static source markers over 9
  files**; `npm run check` includes this source gate.
- `tests/visual-quality.test.mjs` adds contrast and source contract
  regressions. It verifies WCAG AA 4.5:1 contrast for body text, muted
  text and accent-button text in the default Light/Dark palette.

**Not yet verified:** visual screenshots, browser rendering across
engines, keyboard/screen-reader behavior in a real browser, color
contrast for every custom accent and component state, and independent
React/Vue/Svelte/Electron/Tauri package consumption. These remain
acceptance work, not claimed test passes.

## Interactive-state standard

| State | Standard |
| --- | --- |
| Default | Calm neutral surface, readable label and consistent radius |
| Hover | Clear but understated background/border change; no text shift |
| Pressed | Subtle tactile feedback without layout shift |
| Focus-visible | Unambiguous 2px focus outline, never solely a color shift |
| Selected | Persistent accent tint, distinct from transient hover |
| Disabled | No pointer/keyboard action, semantically disabled, no fake affordance |
| Loading | Action blocked as appropriate, visible progress and `aria-busy` |
| Invalid | Error border, appropriate message and `aria-invalid` |
| Forced colors | Highlight/CanvasText outlines remain available |
| Reduced motion | Decorative transitions and transform motion disabled |

Existing consumers retain `accent`, `standard`, `subtle`,
`outline` and `danger` variants. Renaming to HeroUI's variant
scheme would unnecessarily break compatibility.

CSS semantic interaction variables:

```css
--cu-state-hover
--cu-state-pressed
--cu-state-selected
--cu-motion-ease
```

These derive from existing `--cu-accent`, `--cu-surface` and
motion tokens. No additional runtime dependency is introduced.
Native Shadow DOM controls declare the same fallbacks when users
import only the design tokens rather than the gallery CSS.

## Local review matrix

1. In `npm run preview`, navigate to **Quality Lab**. Test every
   interactive control using keyboard and pointer. Select must visibly
   differentiate hovered, currently active and selected items.
2. Switch Light/Dark/System and Blue/Purple/Green accent. Repeat at
   Compact/Comfortable/Touch densities and check all validation labels.
3. Set reduced motion in the operating system, then verify Select popup
   and button pressed behavior are not animated.
4. Test forced colors and 200% browser zoom, including keyboard focus
   outlines and disabled controls.
5. Test viewport widths at **320, 375, 768, 1024 and 1440px**. The top
   navigation scrolls horizontally when necessary; page content should
   not acquire accidental horizontal overflow.
6. Test native HTML form semantics and component events from the
   source examples. Check React 18/19, Vue 3, Svelte 5, Electron and
   Tauri in external consumer projects.
7. Capture visual baselines and evaluate with a real browser and
   assistive technology. Do not promote components to `ready` until
   these checks have passed.

```bash
git pull origin main
npm run quality:check
npm run check
npm run check:packages
npm run preview
```

No GitHub Actions workflows are needed for these local checks.

## Next implementation waves

1. **Overlay quality:** Select, Combobox, Menu, Popover, Tooltip,
   Dialog and Drawer. Focus traps, outside click, collision handling,
   keyboard interactions, click/touch parity and reduced-motion paths.
2. **Data/form quality:** fields, table, lists, virtualization, error
   patterns, form reset, labels, controlled/uncontrolled behavior and
   dark/high-contrast parity.
3. **Documentation & release engineering:** per-component property
   tables, interactive code examples, visual screenshots, tree shaking,
   consumer templates and versioned migration guidance.
4. **Release readiness:** automated real-browser visual and
   accessibility suites run locally, plus third-party smoke tests.
   A complete parity claim requires demonstrably passing these gates.

The goal is mature **design quality and developer experience**, not
duplicating HeroUI's exact visuals or depending on HeroUI packages.


## Second milestone: overlay interaction quality

Anchored Select, Combobox, Menu, Popover and ContextMenu now share
viewport positioning, stack ownership and focus helpers. Native Dialog
and Drawer retain modal semantics while restoring initiator focus.
Additional improvements include ComboBox Home/End, topmost-only Escape,
Menu/Popover trigger-to-panel `aria-controls`, and reduced-motion
entry animations. Pure regression cases cover geometry, nested
ownership, keyboard and source-state contracts.

See [Overlay Quality](OVERLAY_QUALITY.md). Clipping ancestors and
full top-layer positioning, browser/screen-reader verification and
installed-package smoke tests remain prerequisites before any
`preview` component can be marked production-ready.

## Shared foundation refinement

- Every custom element using `mount()` now respects the host `hidden` attribute even when its component stylesheet sets display explicitly.
- Native and CSS Danger buttons use separate destructive-action background, text, hover and pressed colors rather than the semantic danger foreground (which is light pink in dark mode). Consumers may override `--cu-danger-action-bg`, `--cu-danger-action-text`, `--cu-danger-action-hover` and `--cu-danger-action-pressed` as a coordinated palette.
- Subtle/outline Button and filled/outline IconButton explicitly preserve pointer feedback.
- Checkbox and Switch suppress form values and required validity while disabled, including disabled fieldsets.
- Shared overlay viewport watchers observe host resizing when ResizeObserver is available and disconnect on cleanup.

These changes apply to the shared Web Component foundation used by framework adapters. They do not imply browser, visual, screen-reader or package integration acceptance. Verify using `npm run check` and `npm run check:packages` locally.
