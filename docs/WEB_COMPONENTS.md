
# ComponentUI Web Components — Experimental v0.8.0

Twenty-seven **reusable browser Custom Elements** are implemented in `packages/web/src/components/`. These use the Custom Elements API, Shadow DOM, native HTML controls and Fluent Calm CSS tokens. No build step or runtime dependency is required for the browser gallery.

## Registration

Register all available elements:

```js
import "./packages/web/src/components/index.js";
```

Or load only one (each module registers itself):

```js
import "./packages/web/src/components/button.js";
```

Use normal HTML:

```html
<cu-button variant="accent" id="save">Save changes</cu-button>
<cu-text-field label="Email" type="email" name="email" required></cu-text-field>
<cu-checkbox name="updates" value="yes" checked>Receive updates</cu-checkbox>
<cu-switch name="notifications" value="enabled">Enable notifications</cu-switch>
<cu-dialog title="Confirmation" id="confirm">
  <p>Review your changes before proceeding.</p>
  <cu-button slot="actions" id="close-confirm">Close</cu-button>
</cu-dialog>
```

```js
document.querySelector("#save").addEventListener("cu-press", () => {
  document.querySelector("#confirm").showModal();
});
document.querySelector("#close-confirm").addEventListener("cu-press", () => {
  document.querySelector("#confirm").close("confirmed");
});
```

**Important:** Load `packages/theme/src/tokens.css` before these components for the full Fluent Calm appearance. The component modules include fallback colors and spacing when the CSS file is absent.

## API and events

| Tag | Attributes | JS properties / methods | Events |
| --- | --- | --- | --- |
| `cu-button` | `variant`, `size`, `disabled`, `loading`, `type` | `disabled`, `loading`, `type`, `focus()`, `click()` | `cu-press` with `detail.type` |
| `cu-text-field` | `label`, `hint`, `error`, `name`, `type`, `value`, `placeholder`, `required`, `disabled`, `readonly`, `autocomplete`, `minlength`, `maxlength` | `value`, `required`, `disabled`, `focus()`, `checkValidity()`, `reportValidity()` | `cu-input`, `cu-change` with `detail.value` |
| `cu-checkbox` | `checked`, `name`, `value`, `required`, `disabled` | `checked`, `value`, `disabled`, `focus()` | `cu-change` with `detail.checked`, `detail.value` |
| `cu-switch` | Same as Checkbox | Same as Checkbox | `cu-change` |
| `cu-dialog` | `title`, `open` | `showModal()`, `close(returnValue)`, `open`, `returnValue` | `cu-open`, `cu-close`, `cu-cancel` |

Button supports `standard`, `accent`, `subtle`, `outline` and `danger` variants. Sizes are `sm`, `md`, `lg` and `xl`.

### Native form semantics

`cu-text-field`, `cu-checkbox`, `cu-switch` and `cu-button` implement **form-associated custom elements** through `ElementInternals` when supported by the runtime. Controls have native keyboard/focus behavior inside Shadow DOM. Example:

```html
<form id="settings">
  <cu-text-field name="email" label="Email" type="email" required></cu-text-field>
  <cu-checkbox name="updates" value="yes">Send updates</cu-checkbox>
  <cu-button type="submit" variant="accent">Save</cu-button>
</form>
```

```js
document.querySelector("#settings").addEventListener("submit", event => {
  event.preventDefault();
  console.log([...new FormData(event.currentTarget).entries()]);
});
```

The browser version must support `ElementInternals` for form participation. In older engines the components still display and respond, but native form submission and validation may not work; verify support before production use.

### Framework integration

- Vanilla JS, Electron/Tauri WebView: import the modules directly.
- React 19: Custom Elements are supported, but test property/CustomEvent bindings and SSR behavior in your project.
- Vue 3: configure `compilerOptions.isCustomElement` to match `cu-` prefixed tags.
- Angular/Svelte: use the framework's custom element integration; dedicated adapters are not yet written.
- React Native, Flutter, SwiftUI and Qt **cannot execute browser Custom Elements directly**; those require renderer packages with the same design tokens and contracts.

### Release status

All twenty-seven are currently **preview implementations**, not certified or published production components. Cross-browser testing (Chromium/Firefox/WebKit), axe accessibility automation, responsive visual regression, validation behaviors, and React/Vue integration tests remain work to do. Do not change their catalog status to `ready` until these gates pass.

## Run locally (no Actions)

```bash
npm run check
npm run preview
```

Open http://127.0.0.1:4173/apps/playground-web/ and find the **Real Web Components** section.

## Second component batch — v0.4.0

Five additional **real experimental Web Components** are available. The `cu-radio` and `cu-tab` tags are *declarative child definitions*, not counted as standalone inventory controls.

| Tag | Main attributes | Form integration | Events |
| --- | --- | --- | --- |
| `cu-select` | `name`, `label`, `hint`, `required`, `value`, `disabled` | Fluent Calm custom select-only combobox/listbox rendered from declarative `option` / `optgroup`; ElementInternals | `cu-change` |
| `cu-radio-group` | `name`, `label`, `value`, `required`, `orientation`, `disabled` | Native radio inputs generated from `cu-radio` children; ElementInternals | `cu-change` |
| `cu-tabs` | `active` (zero-based), `orientation`, `aria-label` | Not a form field; `cu-tab` children provide labels and panel content | `cu-change` with index, label |
| `cu-tooltip` | `text`, `placement` | Not a form field; anchor must be focusable | none |
| `cu-popover` | `title`, `open`, `placement` | Not a form field; interactive content allowed but not modal | `cu-open`, `cu-close` |

### Select

```html
<form id="example">
  <cu-select label="Framework" name="framework" required>
    <option value="">Choose one…</option>
    <optgroup label="Web">
      <option value="react">React</option>
      <option value="vue">Vue</option>
    </optgroup>
  </cu-select>
</form>
```

`cu-select` accepts light-DOM `option` and `optgroup` declarations and renders a **custom, fully themeable Fluent Calm listbox** in Shadow DOM (no OS-native dropdown menu). Its mutable `value` property and `cu-input`/`cu-change` events report selections. In supported browsers the selected value participates in `FormData` through `ElementInternals`.

### RadioGroup

```html
<cu-radio-group label="Density" name="density" value="comfortable" required>
  <cu-radio value="compact">Compact</cu-radio>
  <cu-radio value="comfortable">Comfortable</cu-radio>
  <cu-radio value="touch">Touch</cu-radio>
</cu-radio-group>
```

Child `cu-radio` tags declare each option. The group uses a native fieldset and shadow radio inputs, so arrow-key and Space behavior follow native controls. `orientation="horizontal"` changes the visual layout.

### Tabs

```html
<cu-tabs active="0" aria-label="Account settings">
  <cu-tab label="Profile"><p>Your profile content</p></cu-tab>
  <cu-tab label="Security"><p>Your security content</p></cu-tab>
  <cu-tab label="Admin" disabled><p>Unavailable content</p></cu-tab>
</cu-tabs>
```

Tab buttons and panels live in the same shadow root with `aria-controls` and `aria-labelledby`; panel content is projected using slots. Arrow Left/Right, Home/End select tabs automatically; use `orientation="vertical"` for Up/Down.

### Tooltip and Popover

```html
<cu-tooltip text="Export your report" placement="top">
  <button slot="anchor" type="button">Export</button>
</cu-tooltip>

<cu-popover title="Export options">
  <button type="button" slot="trigger">Options</button>
  <div slot="content">
    <p>Choose a format.</p>
  </div>
</cu-popover>
```

Tooltip is supplemental, non-interactive content shown on hover/focus. It adds `aria-description` to the anchor only when an author-provided description is absent. Popover is a **non-modal** overlay: pressing Escape restores trigger focus, and clicking outside closes it; call `show()`, `hide()`, or `toggle()` programmatically.

### Current caveats

- These components are **experimental previews**, not a published npm package.
- `ElementInternals` and `MutationObserver` availability must be verified in target browsers.
- Native control form behavior, slotted content, keyboard navigation and screen reader semantics need browser-level tests. Node tests validate structure and imports, not actual browser rendering.
- Framework adapters for React/Vue and SSR/hydration integration remain future milestones.

## Third component batch — v0.4.0

Six more **experimental, reusable browser Custom Elements** have been added, bringing the total to 16. The `cu-menu-item` tag is a declarative child definition and is not counted separately.

| Tag | Main attributes | Behavior |
| --- | --- | --- |
| `cu-date-picker` | `name`, `label`, `value`, `min`, `max`, `required`, `disabled` | Native `input[type=date]`, form-associated, validation and `cu-input`/`cu-change` events |
| `cu-slider` | `name`, `label`, `value`, `min`, `max`, `step`, `disabled` | Native range input, output display, form-associated, `cu-input`/`cu-change` |
| `cu-progress-bar` | `value`, `max`, `label`, `tone` | Native `progress` with determinate or indeterminate behavior |
| `cu-badge` | `tone`, `size`, `dot` | Styled status label, inline content slot; no unsolicited live-region announcements |
| `cu-avatar` | `name`, `src`, `alt`, `size`, `shape` | Optional image, fallback initials, accessible host label |
| `cu-menu` | `open`, `aria-label` | Trigger slot, declarative menu items, arrow-key navigation, outside/Escape dismissal, `cu-select` event |

### DatePicker and Slider

```html
<form id="filter">
  <cu-date-picker name="start" label="Start date" required
    min="2020-01-01" max="2035-12-31"></cu-date-picker>
  <cu-slider name="volume" label="Volume" min="0" max="100" step="5" value="35"></cu-slider>
  <cu-button type="submit" variant="accent">Save</cu-button>
</form>
```

Both are form-associated via `ElementInternals`, with `value` accessors and form reset callbacks. DatePicker delegates locale, calendar appearance and keyboard interactions to the **browser's native date input**. It is not a custom calendar grid.

### Progress, Badge and Avatar

```html
<cu-progress-bar label="Uploading" max="100" value="68"></cu-progress-bar>
<cu-progress-bar label="Fetching updates"></cu-progress-bar>
<cu-badge tone="success" dot>Active</cu-badge>
<cu-avatar name="Alex Nguyen" size="lg"></cu-avatar>
```

ProgressBar is indeterminate when `value` is omitted; numeric values are capped at `max`. Avatar renders initials when no image is supplied or when loading fails. Provide a descriptive `name` or `alt` attribute.

### Menu

```html
<cu-menu id="actions" aria-label="Workspace actions">
  <button slot="trigger" type="button">Actions</button>
  <cu-menu-item value="create">Create</cu-menu-item>
  <cu-menu-item value="rename">Rename</cu-menu-item>
  <cu-menu-item value="delete" disabled>Delete</cu-menu-item>
</cu-menu>
```

```js
document.querySelector("#actions").addEventListener("cu-select", event => {
  console.log(event.detail.value, event.detail.label);
});
```

Keyboard navigation supports ArrowUp/Down, Home/End, Escape and Tab. The trigger uses `aria-haspopup`/`aria-expanded`. Items are rendered as native menu buttons and a disabled item cannot be selected. Non-modal menu closes on pointerdown outside. No application-side action is taken automatically.

### Validation and limitations

- Import `packages/web/src/components/index.js` to register all tags; individual ESM entry points are available via `packages/web/package.json`.
- These implementations are still **preview**, not a published package nor fully accessible components. Perform keyboard and screen reader verification before production use.
- Node tests cover module imports and contracts, not real browser behavior; manually test `ElementInternals`, form reset, focus, theme contrast, and pointer interaction in your targeted browsers.
- React/Vue adapters, full a11y automation and visual regression remain planned.


### Select visual refresh — v0.4.1

The popup in the previous version was a browser-native select menu, whose colors, option rows and group styling differed across Chrome and Windows. Version 0.4.1 replaces the menu with a **select-only combobox + listbox** implementation.

The trigger uses the same Fluent Calm field border, spacing, 6px corner radius and accent focus ring as the rest of the library. The flyout has its own elevated surface, subtle shadow, 8px corners, muted optgroup labels, low-contrast hover highlight and a check mark for the selected option. It inherits semantic tokens from Light/Dark and accent themes.

Keyboard behavior: Enter/Space open the popup or confirm, ArrowUp/Down navigate the enabled options, Home/End jump to bounds, Escape cancels, Tab dismisses, and printable characters perform prefix search. The popup may flip upwards near the viewport bottom. Disabled options are skipped and cannot be committed. Programmatic `value` changes, form reset, required validation, and dynamic option/optgroup children are supported. The public HTML declaration remains unchanged.

This is an **experimental custom combobox**. The browser no longer provides native select's accessibility behavior automatically. Test screen-reader announcements, keyboard behavior, zoom, mobile touch and form validation locally before production use.

Accessibility reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Select hover-state fix — v0.4.2

Dropdown rows now have a noticeable hover/keyboard-active state: a 20% semantic-accent background plus a 3px accent leading stripe. Pointer hover synchronizes the active option without forcing scroll; selected options retain their checkmarks and `aria-selected` even while another row is hovered. Disabled options are excluded. See [SELECT_UI.md](SELECT_UI.md).

## Visual consistency — v0.4.3

The accent-colored leading bar has been removed from Select option hover and vertical Tabs active states. Interactive rows now communicate hover and active states through a full-row accent-tinted background, text weight and (where relevant) a selected checkmark. This is a style rule, not a change to public component APIs.

## Icon system — v0.5.0

The `<cu-icon>` Custom Element now provides Lucide SVG icons through a local `@componentui/icons` data package. It is not a counted entry in the 129-item catalog (IconButton is a separate planned interactive control). Import `packages/web/src/components/icon.js` or the main index to register it. Use `<cu-icon name="plus" size="18"></cu-icon>` inside labeled buttons, or set `label` when the icon itself must be announced. See [ICON_SYSTEM.md](ICON_SYSTEM.md) for examples and third-party license terms.

## Fourth component batch — v0.7.0

Six new Custom Elements are available: `cu-card`, `cu-divider`,
`cu-skeleton`, `cu-spinner`, `cu-alert`, and `cu-breadcrumb`. The
`cu-breadcrumb-item` tag is a declarative child definition rather than a
separate standalone catalog item. They all reuse Fluent Calm semantic tokens,
without decorative left-edge accent bars.

See [Display & Feedback API](DISPLAY_FEEDBACK.md) for usage examples, slots,
ARIA semantics, responsive states and manual acceptance requirements.

## Fifth component batch — v0.8.0

The new `cu-data-table`, `cu-tree-view`, `cu-listbox`, `cu-combobox` and
`cu-context-menu` implementations provide client-side data browsing,
hierarchical navigation, single-selection forms, editable suggestions and
contextual actions. Their internal data-only tags are `cu-tree-item`,
`cu-list-option` and `cu-combo-option`; ContextMenu reuses `cu-menu-item`.
All remain **preview**, pending browser and accessibility verification.

Read [DATA_COMPONENTS.md](DATA_COMPONENTS.md) for APIs, events, markup and
limitations. No GitHub Actions are required.

## Playground single-choice dropdown migration — v0.8.1

All interactive single-choice dropdowns in the Playground now use
`cu-select`. The five previously native OS dropdowns were migrated
without changing the public HTML value semantics: Theme, Density,
Project type, Catalog Category, Catalog Priority. Use `cu-change`
rather than a native `change` listener. The component observes
dynamic `option` insertions at host level, which the catalog JSON
population depends on. The selected checkmark uses Lucide SVG.

See [SELECT_UI.md](SELECT_UI.md) for the audit and manual validation.
