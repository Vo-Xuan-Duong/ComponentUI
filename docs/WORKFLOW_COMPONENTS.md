# Workflow and feedback components — SplitButton, Stepper, InfoBar

Three additional **experimental** ComponentUI Web Components built on Fluent Calm
tokens, native buttons and the locally bundled Lucide icon set. These components
are registered in `@componentui/web/components` and exported individually.
They are **preview**, not production-certified or published.

## API summary

| Component | Attributes / JavaScript properties | Events |
| --- | --- | --- |
| `<cu-split-button>` | `variant`, `size`, `disabled`, `loading`, `label`, `.actions`, `.open` (read-only) | `cu-press`, `cu-action` |
| `<cu-stepper>` | `value`, `linear`, `orientation`, `.steps`, `.currentIndex` (read-only) | `cu-change` |
| `<cu-info-bar>` | `title`, `message`, `tone`, `variant`, `dismissible` | `cu-dismiss` |

All three use Shadow DOM. Consumer-supplied text is rendered with safe
`textContent` or via slots, never interpolated into HTML.

## SplitButton

```html
<cu-split-button id="save" variant="accent">Save project</cu-split-button>
```

```js
const button = document.querySelector("#save");
button.actions = [
  { value: "copy", label: "Save a copy" },
  { value: "export", label: "Export project" },
  { value: "archive", label: "Archive", disabled: true }
];
button.addEventListener("cu-press", () => saveProject());
button.addEventListener("cu-action", event => {
  if (event.detail.value === "copy") saveCopy();
  if (event.detail.value === "export") exportProject();
});
```

The primary button emits `cu-press` with `{type:"button"}`; the chevron
opens the **shared** `cu-context-menu`. Selecting an enabled secondary
entry emits `cu-action` with `{value,label}`. Menu items are defined
through the `.actions` JavaScript array; arrays are normalized with
`normalizeSplitActions(actions)`. Duplicate or invalid identifiers are
discarded and callers receive a defensive copy when reading `.actions`.
Use `press()`, `showMenu()`, `hideMenu()`, and `focus()` for
programmatic interactions.

Tab focuses the primary and secondary buttons separately. ArrowDown/ArrowUp
on the chevron opens the menu; the shared menu supports Up/Down, Home/End,
Enter, Escape, focus restoration, and disabled entries. When `disabled` or
`loading` is set, the primary and secondary buttons are unavailable.
The secondary button is also disabled when no enabled actions exist.
`SplitButton` deliberately does **not** submit or reset HTML forms; use
`<cu-button type="submit">` for native form actions.

## Stepper

```html
<cu-stepper id="publish-steps" aria-label="Publishing workflow" linear></cu-stepper>
```

```js
const stepper = document.querySelector("#publish-steps");
stepper.steps = [
  { value: "draft", label: "Draft", description: "Prepare content" },
  { value: "review", label: "Review", description: "Verify details" },
  { value: "confirm", label: "Confirm", optional: true },
  { value: "published", label: "Published" }
];
stepper.value = "draft";
stepper.addEventListener("cu-change", event => {
  console.log(event.detail.value, event.detail.index,
    event.detail.previousValue);
});
stepper.next();     // moves to Review
stepper.previous(); // returns to Draft
// stepper.goTo("published") is blocked until preceding steps in linear mode.
```

Steps are supplied as a JavaScript array containing stable, unique
`value` identifiers. `normalizeSteps()` produces a safe, normalized copy.
`goTo(valueOrIndex)`, `next()`, and `previous()` return `true`
only if they changed the selected step; they emit `cu-change` with
`{value,index,previousValue}`. Assigning `value` directly changes the
controlled state without dispatching `cu-change`.

The active step is marked `aria-current="step"`; unavailable steps use a
disabled native button. Arrow keys and Home/End move focus, while Enter/Space
activates a step. In `linear` mode, users may return to earlier stages but
cannot jump ahead of the next stage. Set `orientation="vertical"` for a
vertical list. Horizontal layouts scroll at narrow widths. The stepper is a
navigation control, not a form or wizard validation engine: applications
own validation, persistence and transitions.

## InfoBar

```html
<cu-info-bar id="workspace-info" tone="info" title="Sync pending"
  message="Your changes are saved locally." variant="tinted" dismissible>
  <cu-button slot="action" variant="outline" size="sm">
    View details
  </cu-button>
</cu-info-bar>
```

```js
const info = document.querySelector("#workspace-info");
info.addEventListener("cu-dismiss", event =>
  console.log("Dismissed", event.detail.tone));
info.dismiss();
info.show();
```

The `action` slot accepts application-owned buttons or links. It collapses
when empty. The default slot can supply additional explanatory content.
`dismissible` reveals a separately labeled native close button.
`dismiss()` hides the InfoBar and emits `cu-dismiss` with `{tone}`;
`show()` restores it. Unlike a toast, InfoBar stays visible until dismissed
or its parent removes it.

Tones are `info`, `success`, `warning` and `danger`, and
`variant="tinted"` enables a subtle full-background semantic tint.
`danger` uses `role="alert"`; other tones use `role="status"`.
Meaning must remain evident in text, not color or icon alone.

## Framework support

The Web package can be imported as:

```js
import "@componentui/web/components/split-button";
import "@componentui/web/components/stepper";
import "@componentui/web/components/info-bar";
// Or import "@componentui/web/components" to register all tags.
```

React adapters expose `SplitButton`, `Stepper` and `InfoBar` via
`@componentui/react/components` or `createReactComponents(React)`.
`actions` and `steps` arrays are assigned as DOM properties and stable
references avoid redundant React updates. Callbacks `onCuPress`,
`onCuAction`, `onCuChange` and `onCuDismiss` receive native
`CustomEvent` objects. Vue 3's custom-element predicate and Svelte's
`cuEvents` action support the new tags without special renderers.
Actual browser/framework runtime verification remains outstanding.

## Local verification

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

Inspect the three new cards in the Real Web Components gallery.
Check keyboard/focus restoration (especially SplitButton's menu),
Stepper's `linear` guard and vertical/mobile layouts, and InfoBar's
action slot and dismiss/restore behavior. Verify Light/Dark, compact,
comfortable and touch densities, forced-colors, reduced-motion settings
and screen readers in Chromium, Firefox and WebKit.

Source-level tests do not imply these browser or accessibility checks
have been completed. GitHub Actions are intentionally not used.
