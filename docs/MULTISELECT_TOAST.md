# MultiSelect and Toast (preview)

Import the registered Web Components individually or through the complete index.

```js
import "@componentui/web/components/multi-select";
import "@componentui/web/components/toast";
```

## MultiSelect

```html
<cu-multi-select name="framework" label="Frameworks" max-selected="3" required>
  <option value="react" selected>React</option>
  <option value="vue">Vue</option>
  <option value="svelte">Svelte</option>
</cu-multi-select>
```

The value property is a defensive string array. Set items to an array of
{value,label,disabled} objects to use a property-based option source instead
of declarative options. Duplicate and disabled values are excluded.
The value attribute, if supplied, must be a JSON string array. The control
supports search, removable chips, ArrowUp/Down, Enter, Escape, Backspace,
required, disabled, readonly, max-selected, native form reset and state restore.
It emits cu-input and cu-change with detail.value and detail.values (arrays).
FormData submits one entry per selected value; read with formData.getAll(name).
No single string delimiter is imposed. Search is local and synchronous;
remote search, virtualization and grouped headings are not included.

React uses the MultiSelect wrapper with items, value and onCuChange.
Vue and Svelte use the existing model binding with event cu-change;
pass items as a DOM property or use declarative option children.

## Toast

```html
<cu-toast id="notifications" max-visible="3" placement="bottom-end"></cu-toast>
```

```js
const toast = document.querySelector("#notifications");
const id = toast.show({
  title:"Saved", message:"Local changes saved.", tone:"success",
  duration:5000
});
toast.show({title:"Archived",action:"Undo",duration:0});
toast.addEventListener("cu-action", e => console.log(e.detail.id,e.detail.action));
toast.addEventListener("cu-dismiss", e => console.log(e.detail.id,e.detail.reason));
// toast.dismiss(id);
// toast.clear();
```

Tones: info, success, warning, danger. Duration is milliseconds (3–60 seconds)
or 0 for persistent. Notifications queue in FIFO order with 1–10 visible
at a time (default 3). Hover and keyboard focus pause the remaining
timeout. Dismiss reasons include manual, timeout, action and clear.
Placement supports bottom-end, bottom-start and top-end. The host exposes
show, dismiss and clear; the React Toast wrapper uses a ref to call them.
Vue, Svelte, Electron and Tauri use the same DOM methods. Toast does not
automatically execute or undo application operations.

## Local validation

Run npm run check, npm run check:packages and npm run preview. Test keyboard
navigation, form reset, max-selected, repeated FormData entries, disabled
and readonly states, toast queuing and timer pause, theme and viewport
changes, and real screen-reader announcements. These remain preview
components; browser and installed-package acceptance are not certified.
