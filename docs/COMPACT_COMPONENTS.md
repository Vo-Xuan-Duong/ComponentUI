# Chip, Tag and ProgressRing — experimental component reference

These three browser-native Custom Elements use Fluent Calm semantic tokens,
Shadow DOM, and (where relevant) locally bundled Lucide icons. All remain
**preview** components pending local browser, accessibility and framework
integration acceptance checks. They are not publicly published.

## Overview

| Tag | Purpose | Properties / attributes | Events |
| --- | --- | --- | --- |
| `cu-chip` | Select, toggle or remove a compact token | `value`, `selectable`, `selected`, `removable`, `disabled`, `tone`, `size` | `cu-change`, cancelable `cu-remove` |
| `cu-tag` | Passive category or status label | `tone`, `variant`, `size`, `dot` | none |
| `cu-progress-ring` | Circular determinate / indeterminate progress | `value`, `max`, `label`, `size`, `tone`, `show-value` | none |

Import just one component, or register all browser components:

```js
import "@componentui/web/components/chip";
import "@componentui/web/components/tag";
import "@componentui/web/components/progress-ring";
// Or: import "@componentui/web/components";
```

## Chip

```html
<cu-chip selectable selected value="react">React</cu-chip>
<cu-chip selectable tone="success" value="verified">Verified</cu-chip>
<cu-chip id="removable-skill" removable value="design">Design</cu-chip>
<cu-chip selectable disabled>Unavailable</cu-chip>
```

`selectable` enables a keyboard-focusable body with button/pressed semantics
and full-row hover/focus feedback. Space, Enter and pointer clicks toggle
`selected` and emit `cu-change` with `{selected,value}`.
Programmatically assigning `selected` changes state without sending the
event. Chips without `selectable` are passive except for an optional remove
button.

`removable` exposes a separate, labeled native button. Activating it emits
**cancelable** `cu-remove` with `{value}`; the default behavior hides the
chip without deleting DOM nodes. To manage removal in application state:

```js
const chip = document.querySelector("#removable-skill");
chip.addEventListener("cu-remove", event => {
  event.preventDefault(); // keep DOM and visibility controlled by the app
  removeSkillFromState(event.detail.value);
});
```

`disabled` prevents selection/removal. `tone` values are `neutral`,
`success`, `warning` and `danger`. Sizes: `sm`, default, `lg`.
Use chip selection for filters and removable tokens, not as a replacement for
navigation links or form checkbox groups: this component is not form-associated.

## Tag

```html
<cu-tag tone="success" dot>Ready</cu-tag>
<cu-tag tone="warning" variant="outline">Needs review</cu-tag>
<cu-tag tone="danger" variant="solid" size="sm">Blocked</cu-tag>
```

Tag is non-interactive and therefore does not take keyboard focus.
Default content is slotted. Supported tones: `neutral`, `accent`,
`success`, `warning`, `danger`. Variants: `subtle` (default),
`solid`, `outline`. Sizes: `sm`, default, `lg`. `dot` is
decorative. Convey meaning in the text, not color alone. Unlike Badge, Tag is
intended for metadata classification rather than a compact status count.

## ProgressRing

```html
<cu-progress-ring label="Uploading" value="40" max="100"
  tone="accent" size="lg" show-value></cu-progress-ring>
<cu-progress-ring label="Checking for updates" size="lg"></cu-progress-ring>
```

A valid `value` renders determinate progress. Empty, omitted or invalid
values render indeterminate progress. `max` defaults to 100 if nonpositive
or invalid; values are clamped to the inclusive range from 0 to max.
`show-value` places a rounded percentage at the ring's center for sizes
`md` / `lg` / `xl`; the small ring hides that label to avoid cramped text.

The internal `role=progressbar` is given an accessible name and
`aria-valuemin`, `aria-valuemax`; determinate progress also includes
`aria-valuenow`. The decorative SVG is hidden from assistive technology.
The indeterminate spinner stops animating under reduced-motion preferences,
and forced-color mode uses system highlight colors.

Use the pure helper `normalizeRingProgress(value,max)` to normalize server
progress values outside the DOM.

## React, Vue and Svelte

React's adapter exposes `Chip`, `Tag`, and `ProgressRing` through
`createReactComponents(React)` and from
`@componentui/react/components`. Chip properties (`selected`,
`selectable`, `removable`, `value`, `disabled`) are assigned imperatively
to Custom Elements. Events are `onCuChange` and `onCuRemove`.
Use `event.preventDefault()` inside `onCuRemove` for controlled removal.
Vue 3 and Svelte 5 recognize the `cu-*` elements; their native listener
syntax can be used directly and the supplied binding helpers remain optional.

These adapters require real browser testing for SSR/hydration, event timing
and controlled state before production.

## Local acceptance

```bash
npm run check
npm run check:packages
npm run preview
```

- Light and dark themes, all three density settings and all supported tones.
- Keyboard: Space/Enter toggles a selectable Chip, Tab focuses its remove
  button, disabled Chip does not respond, and `cu-remove` is cancelable.
- Screen reader: Chip's pressed state, separate remove button label and
  ProgressRing's determined/indeterminate semantics.
- At 320px width and 200% zoom, neither Chip nor Tag should overflow.
- Forced-colors, reduced-motion, and theme changes do not erase state cues.
- React 18/19, Vue 3 and Svelte 5 adapters work in local client bundles.
- Verify both standalone package imports and tarballs in a separate repo.

These are acceptance instructions, **not** claims of completed real-browser tests.
No GitHub Actions workflows are used.
