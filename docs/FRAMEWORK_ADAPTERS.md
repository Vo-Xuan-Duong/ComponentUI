# ComponentUI framework adapters — experimental v0.12.0

The ComponentUI browser layer remains native **Custom Elements**. This milestone
adds two optional, framework-specific adapters to reduce integration boilerplate:

| Framework | Package (local tarball / workspace) | Capability |
| --- | --- | --- |
| React 18/19 | `packages/react/` | Factory for 64 tags (52 catalog components, Icon and 11 declarative/auxiliary tags); controlled properties; native `cu-*` event handlers; forwarded ref |
| Vue 3 | `packages/vue/` | Vite SFC `isCustomElement` predicate; reusable `v-cu-model` directive; native event-value extraction and cleanup |
| HTML/JavaScript | `packages/web/` | No framework adapter required; import Custom Elements directly |

**Status:** These are source-level integration helpers and unit-tested contracts,
not publicly published npm releases or cross-browser/SSR-tested production adapters.
The dependencies on React/Vue are optional for the root's local Playground.
React/Vue/Svelte runtime browser integration is intentionally left to the maintainer.

## React 18/19

The dependency-free factory receives the existing React instance. It does not
import React at module load, so source-level Node tests can run without installing
React. In a React application inside the ComponentUI workspace:

```tsx
import * as React from "react";
import { createReactComponents } from "@componentui/react";
import "@componentui/web/components"; // registers browser custom elements

const { Button, Icon, TextField, Checkbox, Select } =
  createReactComponents(React);

export function Settings() {
  const [name, setName] = React.useState("");
  return (
    <form>
      <TextField label="Name" name="name" value={name}
        onCuInput={e => setName(String(e.detail.value ?? ""))} />
      <Button type="submit" variant="accent">
        <Icon name="check" size="18" /> Save
      </Button>
    </form>
  );
}
```

`createReactComponents(React)` returns wrappers for **Button, TextField,
Checkbox, Switch, Dialog, Select, Radio, RadioGroup, Tab, Tabs, Tooltip,
Popover, DatePicker, Slider, ProgressBar, Badge, Avatar, Menu, MenuItem, Icon, Card, Divider, Skeleton, Spinner, Alert,
Breadcrumb, BreadcrumbItem**.

The wrappers expose `onCuPress`, `onCuInput`, `onCuChange`,
`onCuOpen`, `onCuClose`, `onCuCancel`, and `onCuSelect`. These listen
to native DOM CustomEvents using `addEventListener` and pass the unmodified
event, including `event.detail`. Event listeners are removed on component
unmount. Do not use plain `onChange` as a substitute for `onCuChange`.

Certain properties—especially `value`, `checked`, `active`, `open`,
`required` and `disabled`—are assigned to the DOM element as properties
instead of relying on attribute serialization. `cu-dialog`'s `open` is
special: the wrapper calls `showModal()`/`close()` instead of assigning to
its read-only property. A `ref` points to the underlying Custom Element.

`createReactComponent(React,"cu-button")` builds a single wrapper when
you do not want the full set. Wrapper creation has no DOM side effects;
actual custom element registration is still necessary in a browser.

### Next.js and SSR cautions

- Use a **client component** (`"use client"`) for interactive React state
  and direct access to Custom Elements.
- Avoid calling browser-only component methods on the server. Registration
  modules are safe to import but SSR output remains unverified.
- `useLayoutEffect` synchronizes controlled properties after DOM mount.
  **Hydration, client navigation and React 18/19 browser integration remain
  manual acceptance tests**, not guaranteed by the Node source tests.

React 19's improved Custom Elements support is documented at
https://react.dev/blog/2024/12/05/react-19.

## Vue 3 + Vite

**Step 1 — SFC compilation:** configure `isCustomElement` in Vite's
`@vitejs/plugin-vue`. The runtime-only build cannot configure this
after templates have been compiled.

```ts
import vue from "@vitejs/plugin-vue";
import { isComponentUIElement } from "@componentui/vue";

export default {
  plugins: [vue({template: {
    compilerOptions: {isCustomElement: isComponentUIElement}
  }})]
};
```

**Step 2 — directive:** register the optional plugin when creating the app.

```ts
import { createApp } from "vue";
import { ComponentUIVuePlugin } from "@componentui/vue";
import "@componentui/web/components";
import App from "./App.vue";

createApp(App).use(ComponentUIVuePlugin).mount("#app");
```

**Step 3 — controlled data:** pass a `CuModelSpec` to `v-cu-model`.

```vue
<script setup lang="ts">
import { ref } from "vue";
const email = ref("");
const updateEmail = (value: unknown) => {email.value = String(value ?? "");};
</script>

<template>
  <cu-text-field
    name="email"
    label="Email"
    v-cu-model="{value: email, onUpdate: updateEmail, event:'cu-input'}"
  ></cu-text-field>
</template>
```

`v-cu-model` accepts:

- `value` — the controlled value, also usable for object-valued data
- `property` — `value` (default), `checked`, `active` or `open`
- `event` — `cu-input` (default for values), `cu-change` (default for
  `checked`), `cu-open` or `cu-close`
- `onUpdate(value, event)` — callback that updates your Vue ref/state

On update, the directive writes the new value only when changed; on unmount,
it removes the event listener. It does not try to replace Vue's regular
`v-model` globally. This directive is explicitly named `v-cu-model` to
avoid collisions with Vue's built-in behavior.

Vue's official Custom Elements guide:
https://vuejs.org/guide/extras/web-components.html.

## How to use the source before publishing

This repository is currently **private package configuration** (`"private":
true`) and is **not published to npm**. The example source files import
the workspace packages via relative paths. If using `@componentui/react`
or `@componentui/vue` aliases, use a properly linked monorepo workspace with
React/Vue installed and configured. The dependency-free `npm run preview`
does not compile React TSX or Vue SFC files.

**Do not copy just `packages/web` into another project as an independently
installable npm package yet.** Some internal imports (including icons)
currently depend on the monorepo directory layout. Packaging external
consumption, peer-dependency integration and build artifacts are separate
milestones.

## Manual local verification

1. Run `npm run check` to inspect the Node contracts, syntax and token output.
2. In a React 18/19 project using this workspace, confirm controlled
   TextField, Checkbox, Select, Menu and Dialog events and form values.
3. Verify refs and listeners after rerenders, unmounting and React Strict Mode.
4. In Vue 3 + Vite, confirm no unknown-element warnings, the `v-cu-model`
   directive updates both ways, and changing `checked` works.
5. Test Light/Dark, Lucide icons, responsive layout, keyboard and a screen
   reader in the actual framework applications.
6. Check SSR/hydration separately if using Next.js or Nuxt.

The Node tests are **not** a substitute for those runtime checks.
There are no GitHub Actions or remote CI workflows in this project.

## v0.7.0 — display and feedback tags

React factory now exports `Card`, `Divider`, `Skeleton`, `Spinner`, `Alert`,
`Breadcrumb` and `BreadcrumbItem`. This brings the source-level wrapper
registry to 35 tags (22 cataloged controls, Icon, plus four declarative child
tags). Vue's `isComponentUIElement` predicate already recognizes all `cu-*`
tags and requires no code change. Browser integration and SSR smoke checks
remain pending.

## v0.8.0 — table, tree, list, combobox and context menu

The React wrapper now includes DataTable, TreeView, ListBox, Combobox,
ContextMenu and their three declarative child tags. There are 35 wrappers
in total. The adapter bridges `cu-sort`, `cu-page-change`,
`cu-selection-change`, `cu-row-action`, the legacy `cu-row-activate` and
`cu-toggle` into `onCu*` callback properties. DataTable `rowActions` and
`headerActions` are assigned as DOM properties, so action predicates remain
JavaScript functions. The header also emits `cu-header-action` and `cu-column-visibility-change`.
Excel-style column filtering emits `cu-filter-change` (`onCuFilterChange` in React) and accepts `columnFilters` as a DOM property. It accepts either arrays of allowed values or conditional operator objects (e.g. `{operator:"contains",value:"Project"}`).

`rows`, `columns`, `rowActions`, `headerActions` and `columnFilters` are assigned to DataTable through DOM **properties**
instead of HTML attribute serialization. Keep stable array references in
React to preserve table sorting and selection across unrelated rerenders.
Vue's compiler predicate already recognizes all new `cu-*` tags; the full
runtime integration still requires local browser tests.

## Additional previews — Chip, Tag, ProgressRing

The browser package registers `<cu-chip>`, `<cu-tag>`, and
`<cu-progress-ring>`. At this milestone, React had **48 wrappers**, including these
three controls. `Chip` emits `cu-change` and the cancelable
`cu-remove` event (React: `onCuChange`, `onCuRemove`); controlled
`selected`, `selectable`, `removable`, `value`, and `disabled`
are applied as element properties. `ProgressRing` supports `value`
and `max` as element properties. Vue and Svelte use the same custom
element registrations and their native event binding conventions.

See [Compact components](COMPACT_COMPONENTS.md). Browser-level adapter
validation remains a release requirement.

## Workflow component previews — SplitButton, Stepper, InfoBar

The React adapter now exposes **51 wrappers**. `SplitButton` accepts
`actions` as a JavaScript property and emits `onCuPress` (primary)
and `onCuAction` (secondary). `Stepper` accepts `steps`, `value`
and `linear` as properties, emitting `onCuChange` with
`{value,index,previousValue}`. `InfoBar` supports the `action`
slot and `onCuDismiss`. Stable `actions` and `steps` references
are not assigned redundantly across React renders. Vue and Svelte
integrate via existing Custom Element recognition and native events.

See [Workflow components](WORKFLOW_COMPONENTS.md). Local browser-level
acceptance and SSR verification are still necessary.

## Command and toolbar component previews

React now exposes **55 wrappers**, including `IconButton`,
`ToggleButtonGroup`, `Toolbar` and `CommandBar`. Their
`name`, `toggle`, `pressed`, `items`, `commands`,
`value`, `multiple`, and `maxVisible` inputs are assigned as
DOM properties where required. Array properties are reference-checked
to avoid resetting controlled selections during unrelated React renders.
Events map to `onCuPress`, `onCuChange` and `onCuAction`.
Vue and Svelte continue using shared Custom Element registration.

See [Command controls](COMMAND_CONTROLS.md). Framework and
cross-browser testing remains part of the local acceptance process.

## Navigation and overlay implementations

The browser package now registers `cu-accordion`,
`cu-accordion-item`, `cu-disclosure`, `cu-pagination`
and `cu-drawer`. React exposes **60 wrappers** including these five
tags. Use `onCuToggle` for Disclosure, `onCuChange` for Accordion,
`onCuPageChange` for Pagination, and `onCuOpen`/`onCuClose` for
Drawer. The `values` array for a multi-open Accordion is assigned
imperatively; stable references avoid unnecessary writes. Use either
`value` or `values` to control Accordion, not both.

See [Navigation surfaces](NAVIGATION_SURFACES.md). Browser/SSR
integration acceptance remains outstanding.

## Resizable layouts and structured filtering

The Web package adds `cu-splitter`, `cu-resizable-panel`,
`cu-filter-bar` and `cu-data-filter`. React has **64 wrappers**,
including `Splitter`, `ResizablePanel`, `FilterBar` and
`DataFilter`. Controlled DOM properties include the Splitter's
`position`, the FilterBar's `query`, and the DataFilter's
`field`/`operator`/`value`. The `onCuResize` event joins
existing `onCuInput`, `onCuChange` and `onCuFilterChange`
handlers. Vue and Svelte continue using Custom Element registration
and native event subscriptions.

See [Layout and Data Filters](LAYOUT_FILTERS.md). Real framework
and browser acceptance remains outstanding.

## v0.9.0 — independent package outputs and Svelte 5

Run `npm run build:packages` and `npm run packages:verify`, then
`npm run pack:local` to install distributable `.tgz` files in a different
repository. React can now import named wrappers from
`@componentui/react/components` without calling the factory:

```tsx
import { Button, Icon } from "@componentui/react/components";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";
```

The original `createReactComponents(React)` API remains available.
Vue uses its existing `isComponentUIElement` and `v-cu-model` APIs
from the package root. Svelte 5 can use `cuModel` and `cuEvents`
actions from `@componentui/svelte` to bind Custom Element properties
and native `cu-*` events. Each adapter is a separate package; none
duplicates the Web Components renderer.

Electron/Tauri share the `@componentui/web` renderer; see
[PACKAGING.md](PACKAGING.md) for secure desktop integration recipes
and the full tarball installation procedure. The packages remain
`private:true`, so this milestone does not release them to a registry.

## v0.10.0 — TextArea, NumberField, SearchBox

React 18/19 factory and named wrappers now expose `TextArea`, `NumberField`
and `SearchBox` (38 tags total). Controlled `value` is assigned as an
element property. `onCuSearch` bridges the new `cu-search` CustomEvent.
Vue's compile-time `isComponentUIElement` helper and Svelte's `cuModel`
action already support the new `cu-*` tags without new renderers.
See [FORM_CONTROLS.md](FORM_CONTROLS.md) for attributes, event contracts
and browser validation requirements.

## v0.11.0 — PasswordField, FilePicker, AppShell

The React wrapper factory and named component export now include 41 tags
and expose `PasswordField`, `FilePicker` and `AppShell`.
Custom events `cu-visibility-change` and `cu-navigation-toggle` are
available as `onCuVisibilityChange` and `onCuNavigationToggle`.
FilePicker emits its selected Files via `onCuChange`, and its
`files` property is read-only. The password value is a JS-only
property, not an attribute. The Vue 3 and Svelte 5 DOM adapters continue
to use the same Web Components. See [ADVANCED_UI.md](ADVANCED_UI.md).

## v0.12.0 — NavigationView and SettingsPage

The React factory/named exports now expose 45 tags, adding
`NavigationView`, `SettingsPage`, `SettingsGroup`, and
`SettingsItem`. The `value`, `query`, and `searchable` DOM
properties are bridged; `onCuFilter` subscribes to `cu-filter`.
Vue/Svelte continue using the shared browser Custom Elements, with
no separate renderer. [Navigation and settings docs](SETTINGS_NAVIGATION.md).
