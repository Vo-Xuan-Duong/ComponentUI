# SegmentedControl and Timeline (preview)

Import the registry or standalone entrypoints.

```js
import "@componentui/web/components/segmented-control";
import "@componentui/web/components/timeline";
```

## SegmentedControl

```html
<cu-segmented-control id="view" name="view" label="Workspace view"
  value="grid" fullwidth required></cu-segmented-control>
```

```js
const view = document.querySelector("#view");
view.items = [{value:"grid",label:"Grid"},{value:"list",label:"List"}];
view.addEventListener("cu-change", event => console.log(event.detail.value));
```

A form-associated single-choice control using native radio inputs inside its
shadow root. Unlike ToggleButtonGroup it has no multiple-selection mode.
Items have a unique nonempty string value, label, optional icon and disabled.
An unknown or disabled value resolves to an empty selection; a requested
value can become valid when asynchronously supplied items arrive. No option
is selected by default unless value is provided. Native radio keyboard
navigation and Home/End are supported. Horizontal (default) and vertical
orientation, fullwidth, sm/md/lg sizes, default and accent variants,
required/custom error, disabled/readonly and form reset are supported.
Readonly prevents selection while retaining the submitted value. Both
cu-input and cu-change expose value and label. Programmatic value assignment
is silent; select(value) emits events on successful changes.

## Timeline

```html
<cu-timeline id="activity" label="Release activity"></cu-timeline>
```

```js
const activity = document.querySelector("#activity");
activity.items = [
  {id:"1",title:"Release prepared",status:"success",time:"09:00"},
  {id:"2",title:"Local review",status:"active",action:"View details"}
];
activity.addEventListener("cu-action", event => console.log(event.detail.id));
```

Items require a unique id and title; description, display time, machine-readable
datetime, icon, action, and status are optional. Status values are neutral,
success, warning, danger and active. The supplied item order is preserved;
reverse reverses display order, not the data. The horizontal variant is
scrollable on narrow layouts. Action buttons are application-owned and
emit cu-action with id, action and item. Status text supplements the marker
color. Empty state text can be configured with empty-text. No automatic
date parsing, sorting, grouping, virtualization or server-side execution.

## Integration and local acceptance

React wrappers SegmentedControl and Timeline support property-bound items.
Vue and Svelte use native custom-element bindings and events; Electron and
Tauri use the web implementation. Run npm run check, npm run check:packages
and npm run preview. Verify native radio navigation, form validation,
asynchronous item updates, focus restoration, RTL, reduced motion,
horizontal timeline, status contrast and custom actions in the browser.
