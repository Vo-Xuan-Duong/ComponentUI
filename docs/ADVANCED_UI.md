# Advanced UI & Application Shell — v0.11.0

ComponentUI introduces **three experimental browser Custom Elements**:
`PasswordField`, `FilePicker` and `AppShell`. They share Fluent Calm
design tokens, keyboard/focus semantics and locally bundled Lucide icons.
These controls are **preview implementations**, not browser-certified releases.

## PasswordField — secure input

```html
<cu-password-field name="password" label="Password" required
  minlength="8" autocomplete="new-password"
  hint="Use at least eight characters"></cu-password-field>
```

- Native `<input type="password">` is used by default.
- A labeled toggle uses **Lucide eye / eye-off** icons; its `aria-pressed`
  state reflects whether the value is visible.
- Properties: `.value: string`, `.visible: boolean` (readonly),
  `.disabled`, `.required`.
- Methods: `toggleVisibility()`, `focus()`, `checkValidity()`,
  `reportValidity()`.
- Attributes: `name`, `label`, `hint`, `error`, `required`,
  `disabled`, `readonly`, `minlength`, `maxlength`,
  `pattern`, `autocomplete` and `placeholder`.
- Events: `cu-input` and `cu-change` contain `{value}`;
  `cu-visibility-change` contains `{visible}`.
- The password **must be set as a JS property**, never an HTML
  `value` attribute. Reset clears it; no plaintext value is reflected
  to the host attributes. The preview does not log passwords.

**Security:** This is an input component, not password storage or
authentication. Browser password managers and autofill depend on the
consumer app and browser. Do not put passwords into logs, URLs,
analytics or client-side persistence. Use a secure backend for
authentication and validate on the server.

## FilePicker — local file selection

```html
<form id="attachment-form">
  <cu-file-picker name="attachments" label="Attachments"
    multiple accept="image/*,.pdf" max-size="5242880"
    hint="PDF or images, up to 5 MB per file">
  </cu-file-picker>
  <button type="submit">Read files</button>
</form>
```

```js
const picker = document.querySelector("cu-file-picker");
picker.addEventListener("cu-change", ({detail}) => {
  console.log(detail.count, detail.valid, detail.files.map(f => f.name));
});
document.querySelector("#attachment-form").addEventListener("submit", event => {
  event.preventDefault();
  const files = new FormData(event.currentTarget).getAll("attachments");
  // Upload only via an explicit, authenticated application workflow.
});
```

- A native browser file input opens from a labeled Browse button; the
  dropzone also supports drag and drop.
- `multiple` enables multiple selections; in this mode each selected file
  is appended under the same form key using `ElementInternals` +
  `FormData`. Single-file mode exposes one File.
- `max-size` is a **per-file byte limit**. `accept` accepts comma-separated
  extensions (`.pdf`), MIME types (`application/pdf`) and wildcards
  (`image/*`).
- `required`, `disabled`, reset, `checkValidity()` and
  `reportValidity()` are supported.
- Read selected File objects through `.files` (copy) or listen to
  `cu-change`: `{files, count, valid}`. Use `clear()` to remove selection.
- File selection has **no network side effect**. The component does not
  read file bytes, automatically upload, or create object URLs.

**Security:** Browser `accept` is only a UI filter. Client MIME, names
and sizes can be forged; validate file content, size and permissions on the
server before accepting an upload. Do not treat a successful local form
submission as a completed upload.

## AppShell — reusable web application layout

```html
<cu-app-shell style="--cu-appshell-nav-width:232px">
  <strong slot="header">Workspace</strong>
  <nav slot="navigation" aria-label="Workspace sections">
    <a href="#projects">Projects</a>
    <a href="#settings">Settings</a>
  </nav>
  <section id="projects">
    <h2>My projects</h2>
    <p>Your app content goes in the default slot.</p>
  </section>
  <aside slot="aside">Details</aside>
  <small slot="footer">Local workspace</small>
</cu-app-shell>
```

- Five layout slots: **header**, **navigation**, **default content**,
  **aside** (optional) and **footer** (optional).
- The host is a CSS container. A narrow instance (720px or less) uses
  a single content column and a collapsible navigation overlay. This
  adapts to embedded desktop panes as well as smaller viewports.
- `openNavigation()`, `closeNavigation(restoreFocus?)`,
  `toggleNavigation()` and the `navigationOpen` property control the
  overlay; the `navigation-open` attribute can also be declaratively set.
- `without-navigation` hides the navigation region entirely.
- The navigation toggle has an accessible name and `aria-expanded`,
  Escape closes the overlay, and focus is returned to its trigger.
- `cu-navigation-toggle` emits `{open: boolean}` on user actions.
- Configure CSS variables:
  `--cu-appshell-nav-width` (default 232px),
  `--cu-appshell-aside-width` (250px),
  `--cu-appshell-min-height` (360px),
  `--cu-appshell-header-height` (52px),
  `--cu-appshell-content-padding` (20px).

Navigation content is consumer-owned: links, menus, breadcrumbs and
routing behavior stay in the app. AppShell does not choose a router,
run platform APIs or control native window decorations.

## Framework packages

```tsx
import { PasswordField, FilePicker, AppShell } from "@componentui/react/components";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";
```

The React factory now exposes **41 tags**, including these three.
Property bindings include `value` on PasswordField, `multiple` /
`maxSize` on FilePicker, and `navigationOpen` on AppShell. Events
include `onCuVisibilityChange`, `onCuNavigationToggle` and the
existing `onCuChange`.

Vue 3 uses the existing `isComponentUIElement` and
`v-cu-model` conventions; Svelte 5 can use `cuModel` and
`cuEvents` actions. Electron/Tauri share the same browser renderer:
no second UI implementation is needed.

## Local acceptance checklist

```bash
git pull origin main
npm run check
npm run build:packages
npm run packages:verify
npm run preview
```

1. Test password reveal with pointer and keyboard; ensure required,
   minlength, maxlength and pattern validation, reset and autofill.
2. Test file chooser, Escape/cancel, drag/drop, multiple selection,
   oversized and disallowed files, clear/reset, and native FormData.
3. Open AppShell navigation with keyboard; check Escape, focus return,
   outside click, selected nav state and optional slots.
4. Verify Light/Dark, Compact/Comfortable/Touch, 320px wide and 200%
   zoom, forced colors and reduced motion.
5. Test installed local tarballs in real React, Vue, Svelte and
   Electron/Tauri webview consumer apps.
6. Confirm that no password or file bytes are logged, transmitted or
   persisted by demo code.

**Tests and visual QA are provided for local execution by the maintainer.**
No GitHub Actions workflow is created or run; this code has not been
browser-certified, and no package is publicly published.
