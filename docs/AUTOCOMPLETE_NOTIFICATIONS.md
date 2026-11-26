# AutoComplete and NotificationCenter (preview)

Import the complete ComponentUI web registry or the individual modules.

```js
import "@componentui/web/components/autocomplete";
import "@componentui/web/components/notification-center";
```

## AutoComplete

Unlike Combobox, which commits an option identity, AutoComplete accepts free
text and inserts the selected suggestion value into the text field.
The items property accepts objects with value, label, description and disabled.
Duplicate values are removed. The value property is a string.

```html
<cu-autocomplete id="technology" name="technology" label="Technology"
  min-chars="1" max-results="8" required></cu-autocomplete>
```

```js
const field = document.querySelector("#technology");
field.items = [
  {value:"React",description:"UI library"},
  {value:"Vue",description:"Progressive framework"}
];
field.addEventListener("cu-select", event => console.log(event.detail.value));
```

Local matching is case-insensitive across value, label and description.
Set manual-filter to bypass local matching and use externally supplied results.
The cu-search event exposes detail.query. An application can debounce its
handler, request remote results, set loading, assign items and ignore stale
responses using its own request ID or AbortController. The component does not
perform network requests or manage request cancellation itself.
min-chars controls when suggestions open; max-results caps the list (0–100).
ArrowUp/Down moves active selection, Enter commits it and Escape closes the
popup. The input also supports native text editing, composition, clear,
required, disabled, readonly, FormData and reset.
cu-input reports current text; cu-change reports native change or selection;
cu-select reports an accepted suggestion.

## NotificationCenter

```html
<cu-notification-center id="notifications"></cu-notification-center>
```

```js
const center = document.querySelector("#notifications");
center.items = [{id:"build-1",title:"Build completed",tone:"success"}];
center.add({id:"review-1",title:"Review requested",action:"Review"});
center.markRead("build-1");
center.markAllRead();
// center.dismiss("review-1");
// center.clear();
```

The list supports all/unread filters, unread count, read/unread toggles,
dismissal and action buttons. The items getter returns defensive snapshots;
add prepends new records and rejects duplicate IDs. cu-change emits
detail.notifications, unreadCount, reason and optional id.
cu-action emits id and action; cu-dismiss emits id and reason.
Actions must be implemented by the application.
The component does not persist to disk, access OS notifications, or automatically
share a data store with Toast. Applications may wire the two explicitly.

## Framework integration

React: AutoComplete and NotificationCenter from @componentui/react/components.
AutoComplete accepts items, value, loading and onCuSearch/onCuSelect.
NotificationCenter accepts items and onCuChange; read and dismiss operations
emit updated snapshots. Vue/Svelte use DOM property bindings and existing
cu-* event support. Electron/Tauri reuse the web implementation.

## Local acceptance

Run npm run check, npm run check:packages and npm run preview.
Test keyboard and pointer interaction, IME, disabled suggestions, empty/loading
states, remote response ordering, form reset, read/unread focus restoration,
theme contrast, reduced motion and narrow viewport behavior.
Browser, screen-reader and installed-package integration are not yet certified.
