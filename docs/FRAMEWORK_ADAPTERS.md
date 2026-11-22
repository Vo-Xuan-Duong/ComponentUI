# ComponentUI framework adapters — experimental v0.6.0

The ComponentUI browser layer remains native **Custom Elements**. This milestone
adds two optional, framework-specific adapters to reduce integration boilerplate:

| Framework | Package (workspace only) | Capability |
| --- | --- | --- |
| React 18/19 | `packages/react/` | Factory for 27 tags (16 controls, Icon, and 3 declarative child elements); controlled properties; native `cu-*` event handlers; forwarded ref |
| Vue 3 | `packages/vue/` | Vite SFC `isCustomElement` predicate; reusable `v-cu-model` directive; native event-value extraction and cleanup |
| HTML/JavaScript | `packages/web/` | No framework adapter required; import Custom Elements directly |

**Status:** These are source-level integration helpers and unit-tested contracts,
not published npm releases or cross-browser/SSR-tested production adapters.
The dependencies on React/Vue are optional for the root's local Playground.
React/Vue runtime browser integration is intentionally left to the maintainer.

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
registry to 27 tags (22 cataloged controls, Icon, plus four declarative child
tags). Vue's `isComponentUIElement` predicate already recognizes all `cu-*`
tags and requires no code change. Browser integration and SSR smoke checks
remain pending.
