# Form Controls & UI Refinement — ComponentUI v0.10.0

This milestone expands the **experimental native Web Components** with three
form controls: `cu-textarea`, `cu-number-field` and `cu-search-box`.
It also refreshes the Playground layout with clearer hierarchy, responsive
surfaces, a sticky toolbar, and consistent hover/focus treatment.

All controls are framework-neutral, use the existing **Fluent Calm design
tokens**, bundle Lucide SVG icons locally, and are registered through
`@componentui/web/components`. They are not production-certified.

## TextArea

```html
<cu-textarea name="description" label="Description" rows="4"
  maxlength="280" hint="Keep it concise" show-count auto-resize required
  value="An example description"></cu-textarea>
```

- Editable `.value`, `minlength`, `maxlength`, `rows`, `required`,
  `disabled`, `readonly`, `placeholder`, `label`, `hint` and `error`.
- `show-count` displays live character count; `maxlength` displays a
  used/max count even when `show-count` is omitted.
- `auto-resize` grows the textarea to fit content. The native
  `textarea` remains keyboard-accessible and vertically resizable.
- `cu-input` and `cu-change` send `{value}`.
- Shadow DOM uses the native textarea for input semantics while
  `ElementInternals` contributes one value to FormData and validity.
- `formResetCallback` restores the initial `value` attribute.

## NumberField

```html
<cu-number-field name="copies" label="Copies" value="2"
  min="1" max="20" step="1" hint="Use the buttons or Arrow keys"
  required></cu-number-field>
```

- Uses a real `<input type="number">` for locale/browser number entry
  semantics, native constraints and Arrow-key behavior.
- Two labeled Lucide `minus` / `plus` steppers provide additional
  pointer/touch control and are disabled at min/max limits.
- Supports `min`, `max`, `step`, `required`, `disabled`, `readonly`,
  `value`, `label`, `hint` and `error`.
- `value` is a **string** for native form interoperability, and
  `valueAsNumber` is a number (NaN when empty/invalid).
- Clicking stepper buttons emits both `cu-input` and `cu-change`.
  The pure `stepNumber()` helper is used if native stepping fails.
- Form submission, validation and reset use `ElementInternals`.

## SearchBox

```html
<cu-search-box label="Search projects" name="q"
  placeholder="Search by name"></cu-search-box>
```

```js
const search = document.querySelector("cu-search-box");
search.addEventListener("cu-input", event => {
  // Apply live filtering:
  console.log(event.detail.value);
});
search.addEventListener("cu-search", event => {
  // User confirmed with Enter, or cleared the field:
  console.log(event.detail.value);
});
```

- Includes a Lucide search icon and an accessible clear button.
- `cu-input` emits on input; `cu-change` emits on native change;
  `cu-search` emits on Enter or when clearing.
- Escape clears a nonempty query; clear returns focus to the search input.
- A real `input type=search` handles keyboard/IME; the component exposes
  a `.value` property and `clear()` method.
- The control is form-associated and supports disabled, readonly, required,
  placeholder, label, hint, initial value and form reset.
- Playground Catalog search now reuses this custom element and listens
  for `cu-input` instead of a native `input` event.

## Consistent states

| State | Design rule |
| --- | --- |
| Default | 1px neutral border plus restrained bottom edge |
| Hover | Full control/row surface tint, **no left accent stripe** |
| Focus visible | 2px focus ring, with accent on control bottom edge |
| Selected | Clear selected background/checkmark; keyboard-active remains distinct |
| Disabled | No hover/interaction, reduced emphasis |
| Invalid | Visible danger-colored bottom edge and native validity |
| Reduced motion | No essential information conveyed only through animation |
| Forced colors | Preserve system focus outlines and control boundaries |

UI previews use the same semantic surface, text, border and accent tokens in
Light and Dark modes; no remote icon font, CDN or Microsoft-owned assets.

## Framework integration

`@componentui/react/components` now exports `TextArea`,
`NumberField` and `SearchBox`, including `onCuInput`,
`onCuChange` and `onCuSearch`. Their controlled `value` is set as
a DOM property. Vue 3's existing `isComponentUIElement` recognizes
all three tags, and `v-cu-model` can synchronize `value`.
Svelte 5's `cuModel` action can be used with `cu-input` or
`cu-change`. All three need actual application/browser validation.

## Local test checklist (no GitHub Actions)

```bash
git pull origin main
npm run check
npm run build:packages
npm run packages:verify
npm run preview
```

1. Open **Real Web Components** and try the TextArea, NumberField and
   SearchBox previews. Submit, reset and inspect FormData.
2. Check focus/hover/readonly/required/disabled across Light and Dark,
   all density modes, and Windows forced-colors mode.
3. Verify textarea counter, maxlength, autosize, reset, and Zoom 200%.
4. Verify number steppers with decimals, min/max, step=any, empty state,
   native Arrow keys, keyboard tab order and focus.
5. Verify SearchBox Enter, Escape, clear button and catalog search filtering.
6. Inspect responsive layout at 320px, 390px, 768px and desktop widths;
   no overflowing dropdowns, cards, button rows or input fields.
7. Verify accessibility with keyboard only and a screen reader.
8. Install generated package tarballs into React, Vue and Svelte projects
   to test runtime semantics, TypeScript declarations and icon packaging.

These are **manual acceptance requirements**, not claims of completed
visual/browser testing. No GitHub Actions is created or run.
