# NavigationView and SettingsPage — ComponentUI v0.12.0

ComponentUI adds **two experimental application-building components**:
`cu-navigation-view` and `cu-settings-page`. They use Fluent Calm tokens,
native browser semantics, Shadow DOM and locally bundled Lucide icons.

`cu-settings-group` and `cu-settings-item` are auxiliary compositional
elements, not independent catalog components. No external framework or
navigation library is required.

All components remain **preview** until keyboard, screen-reader, visual
and installed-package testing is completed locally.

## NavigationView

```html
<cu-navigation-view label="Workspace" value="overview" id="nav">
  <button type="button" data-value="overview">Overview</button>
  <button type="button" data-value="components">Components</button>
  <button type="button" data-value="settings">Settings</button>
  <a href="/help" data-value="help">Help</a>
  <button disabled data-value="archive">Archive</button>
  <small slot="footer">Workspace v1</small>
</cu-navigation-view>
```

NavigationView uses **slotted native links and buttons** rather than
rendering unsemantic click targets. Selected items get a whole-row
accent-tinted background and `aria-current="page"`. Disabled items
cannot be selected or navigated through with the arrow keys. Native
link navigation is left to the browser, and router integration is the
responsibility of the consuming application.

**API:** `label` and `value` attributes, `.value` property,
`select(value, emit=false)` method. `cu-change` fires for a
user-initiated selection with `{value,label,href}`; assigning
`.value` does not emit.

**Keyboard:** native Tab and Enter/Space for the slotted controls;
ArrowUp/ArrowDown/ArrowLeft/ArrowRight move focus between enabled
items; Home/End focus the first/last enabled item. Escape dismissal
belongs to the containing AppShell overlay.

**Composition with AppShell:**

```html
<cu-app-shell id="shell">
  <strong slot="header">My app</strong>
  <cu-navigation-view slot="navigation" value="dashboard" label="Pages">
    <button type="button" data-value="dashboard">Dashboard</button>
    <button type="button" data-value="settings">Settings</button>
  </cu-navigation-view>
  <section>
    <h2>Dashboard</h2>
    <p>Page content</p>
  </section>
</cu-app-shell>
```

The AppShell handles responsive navigation placement; NavigationView
handles active-item visuals and emits selection events. The application
decides which page to display and when to close the overlay.

## SettingsPage

```html
<cu-settings-page label="Application settings"
  description="Personalize this workspace." searchable
  placeholder="Search settings…">
  <cu-settings-group label="Appearance"
    description="Color, density and layout">
    <cu-settings-item label="Theme"
      description="Select a preferred theme" keywords="light dark">
      <cu-select slot="control" label="Theme" name="theme" value="system">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </cu-select>
    </cu-settings-item>
    <cu-settings-item label="Notifications"
      description="Receive workspace updates" keywords="alerts">
      <cu-switch slot="control" aria-label="Enable notifications"></cu-switch>
    </cu-settings-item>
  </cu-settings-group>
  <cu-settings-group label="Privacy" description="Local preferences">
    <cu-settings-item label="History"
      description="Remember workspace history">
      <cu-checkbox slot="control" aria-label="Remember history"></cu-checkbox>
    </cu-settings-item>
  </cu-settings-group>
</cu-settings-page>
```

Page API: `label`, `description`, `placeholder`, `searchable`
attributes, `.query` and `.searchable` properties, `clearSearch()`
method. `cu-filter` emits `{query,visible,total,groups}`
on an input change or programmatic query assignment.

A group supports `label`, `description` and `keywords`; it contains
**direct** `cu-settings-item` children. Each item supports
`label`, `description`, `keywords` and a `control` slot.
Setting labels and descriptions display as normal text; provide
an accessible name for any slotted control with its own `label`
or `aria-label`.

Search checks only this **declarative metadata**; it never reads
passwords, file contents or values of inputs. Filtering toggles a
`data-cu-filter-hidden` presentation attribute on matching groups
and items, preserving user control state. A no-results message appears
when no group matches. The search feature is disabled by default;
enable it with `searchable`.

SettingsPage is **not** a persistence framework: consumers must
explicitly handle `cu-change` from controls and save settings to
their own storage/service. It does not require any network access.

## Framework integrations and packaging

```tsx
import {
  NavigationView, SettingsPage, SettingsGroup, SettingsItem
} from "@componentui/react/components";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";
```

The React named wrappers now contain **45 tags**. Events
`onCuChange` and `onCuFilter` are subscribed through the existing
native CustomEvent adapter. `value`, `query` and `searchable`
are assigned as properties.

For standalone imports, use:

```js
import "@componentui/web/components/navigation-view";
import "@componentui/web/components/settings-page";
```

`settings-page` registers its auxiliary group and item elements.
Vue 3's `isCustomElement` helper and Svelte 5's Custom Element actions
apply unchanged. Electron and Tauri use the same WebView frontend.

## Local manual acceptance checklist

```bash
git pull origin main
npm run check
npm run build:packages
npm run packages:verify
npm run preview
```

1. Navigate with Tab, arrow keys, Home/End and Enter/Space, checking
   focus and selected state in both Light and Dark modes.
2. Verify disabled navigation items are neither selected nor keyboard
   destinations; ensure native links still navigate normally.
3. Embed NavigationView inside AppShell; open and close the mobile
   navigation with Escape and select a destination.
4. Type a settings keyword and verify correct groups/rows are shown;
   clear search and ensure previous control values remain intact.
5. Confirm controls retain their native FormData behavior when inside
   settings rows and their accessible names are exposed.
6. Test at 320px width and 200% zoom, all three density profiles,
   forced-colors mode, reduced motion and touch.
7. Install local tarballs in separate React, Vue and Svelte repos and
   verify that package imports resolve without monorepo-relative paths.
8. Test the full layout in Electron/Tauri webview consumer projects.

No GitHub Actions or remote CI is added or run. Local browser testing
and production release certification remain with the maintainer.
