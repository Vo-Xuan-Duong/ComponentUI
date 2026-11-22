
# ComponentUI Web Components — Experimental v0.2.0

The first **actual reusable browser Custom Elements** are implemented in `packages/web/src/components/`. These use the Custom Elements API, Shadow DOM, native HTML controls and Fluent Calm CSS tokens. No build step or runtime dependency is required for the browser gallery.

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

All five are currently **preview implementations**, not certified or published production components. Cross-browser testing (Chromium/Firefox/WebKit), axe accessibility automation, responsive visual regression, validation behaviors, and React/Vue integration tests remain work to do. Do not change their catalog status to `ready` until these gates pass.

## Run locally (no Actions)

```bash
npm run check
npm run preview
```

Open http://127.0.0.1:4173/apps/playground-web/ and find the **Real Web Components** section.
