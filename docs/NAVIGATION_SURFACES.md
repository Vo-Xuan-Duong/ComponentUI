# Accordion, Disclosure, Pagination and Drawer

This milestone supplies three previously catalogued preview components as
actual browser-native Web Components, plus a reusable auxiliary
`cu-disclosure` element. `cu-accordion-item` is an auxiliary declarative
child used by Accordion. **All remain experimental previews**, not
production-certified or published.

| Component | Tags | Main properties | Events |
| --- | --- | --- | --- |
| Disclosure | `cu-disclosure` | `open`, `disabled`, `value`, `label` | `cu-toggle` |
| Accordion | `cu-accordion`, `cu-accordion-item` | `value`, `values`, `multiple` | `cu-change` |
| Pagination | `cu-pagination` | `page`, `pageSize`, `total` | `cu-page-change` |
| Drawer | `cu-drawer` | `open`, `dismissible`, `placement`, `size` | `cu-open`, `cu-close` |

All use Fluent Calm semantic tokens, Shadow DOM and locally bundled
Lucide icons where appropriate.

## Disclosure and Accordion

```html
<cu-disclosure label="More information" value="help">
  Read the installation guide before starting.
</cu-disclosure>

<cu-accordion id="setup-steps" label="Setup options">
  <cu-accordion-item value="install" label="Install" open>
    Build the local packages and install their tarballs.
  </cu-accordion-item>
  <cu-accordion-item value="configure" label="Configure">
    Register the Custom Elements in your application's client entry.
  </cu-accordion-item>
</cu-accordion>
```

```js
const accordion=document.querySelector("#setup-steps");
accordion.addEventListener("cu-change",event => {
  console.log(event.detail); // {value,values,changedValue,open}
});
accordion.value="configure"; // controlled update; no event emitted
accordion.multiple=true;
accordion.values=["install","configure"];
```

Disclosure has `show()`, `hide()`, `toggle()` and `focus()`.
Its `cu-toggle` event contains `{open,value}` and only dispatches
for the element's user-initiated toggle method, not for property assignment.
The header is a native button with `aria-expanded`/`aria-controls`
linked to the hidden panel; disabled headers do not respond.

Accordion accepts direct `cu-accordion-item` children with unique,
stable `value` strings. In its default single-open mode, opening a
different item closes the existing one. In `multiple` mode, independent
items can remain open simultaneously. The parent emits one `cu-change`
event for a user toggle with `{value,values,changedValue,open}`.
`value` reports the first open section, `values` is a defensive
array copy. Setting `value` or `values` programmatically does not
dispatch a change. Disabled items cannot be opened by the parent API.
Use `variant="flush"` for flush dividers.

## Pagination

```html
<cu-pagination id="pages" page="1" total="125" page-size="10"
  siblings="1" label="Search results"></cu-pagination>
```

```js
const pages=document.querySelector("#pages");
pages.addEventListener("cu-page-change",event => {
  const {page,pageCount,total,pageSize,start,end}=event.detail;
  loadDataPage(page,pageSize); // Application owns data fetching.
});
pages.goTo(3);
pages.next();
pages.previous();
pages.total=0; // Shows 0–0 of 0 and disables navigation.
```

`normalizePagination(page,total,pageSize)` clamps invalid page
numbers and returns `{page,pageCount,total,pageSize,start,end}`.
A non-positive/invalid page size falls back to 10, `total` defaults
to 0, and pages are 1-indexed. `paginationItems(page,pageCount,siblings)`
generates the page/ellipsis range as a pure helper. `siblings` is
clamped to 0–3.

Previous/Next and numbered pages use native buttons, with accessible
labels and `aria-current="page"`; disabled buttons indicate the
boundaries. The component preserves focus on the selected page after
re-rendering a numbered page. Only valid transitions emit
`cu-page-change`. Changing properties programmatically does not emit.
The component is a **navigation widget**, not a data loader:
applications must update their own table/list state and remote data.

## Drawer

```html
<cu-drawer id="preferences" title="Preferences"
  placement="right" size="md" dismissible>
  <p>Update your workspace preferences.</p>
  <cu-button slot="actions" id="save-preferences">Save changes</cu-button>
</cu-drawer>
```

```js
const drawer=document.querySelector("#preferences");
drawer.addEventListener("cu-open",()=>console.log("opened"));
drawer.addEventListener("cu-close",event=>console.log(event.detail.returnValue));
drawer.show();
document.querySelector("#save-preferences").addEventListener("cu-press",()=>{
  drawer.close("saved");
});
```

Drawer uses the native `HTMLDialogElement.showModal()` mechanism
for modal focus containment, Escape handling and the backdrop. Its
`title` labels the dialog through `aria-labelledby`.
The `actions` slot renders a footer only when assigned action
elements exist. `placement="left"` switches its side; right is
the default. Sizes are sm (~300px), md (~380px) and lg (~560px);
narrow screens use the full viewport width.

When **`dismissible` is present**, the labeled close button, Escape,
and a backdrop click can dismiss the panel. When absent, only
application-driven `close()` can dismiss it: provide an action
for the user to complete or cancel the workflow. Closing restores
focus to the previously focused element, when available.
`cu-close` supplies `{returnValue}`; `cu-open` has an empty detail.

## Imports and framework integration

```js
import "@componentui/web/components/accordion";
import "@componentui/web/components/disclosure";
import "@componentui/web/components/pagination";
import "@componentui/web/components/drawer";
```

The Web package also supports `import "@componentui/web/components"`
to register all controls. The React factory and
`@componentui/react/components` expose `Accordion`,
`AccordionItem`, `Disclosure`, `Pagination`, and `Drawer`
as wrappers. React maps `cu-toggle`, `cu-change`,
`cu-page-change`, `cu-open` and `cu-close` to the corresponding
`onCu*` props. `Accordion.values` is assigned as a DOM
property and stable array prop identities avoid repeated assignments.
For single-open Accordion, control `value`; for multiple-open use
`values`. Avoid passing both simultaneously.

Vue 3 and Svelte 5 recognize the `cu-*` elements and their
Custom Events; consumers may use the existing directive/action helpers.
SSR and hydration handling requires real browser verification.

## Local acceptance checklist

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

- Accordion: Enter/Space, single and multiple modes, disabled headings,
  dynamically added children, and focus order.
- Pagination: first/last page, empty dataset, changing page sizes,
  keyboard focus restoration and large page-count ellipses.
- Drawer: left/right placements, Escape, backdrop, non-dismissible
  mode, opening from a trigger, action-slot footer and focus return.
- All four: Light/Dark, compact/comfortable/touch, forced colors,
  200% zoom, mobile widths, reduced motion and screen-reader behavior.
- React 18/19, Vue 3 and Svelte 5 integration, standalone package
  imports and local package tarballs.

These are acceptance instructions, **not** claims that a real browser
matrix was executed. No GitHub Actions workflows are used.
