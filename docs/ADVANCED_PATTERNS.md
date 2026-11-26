# Advanced patterns (preview)

The final twelve planned components are implemented as Web Components and
React wrappers. Vue/Svelte can bind native DOM properties and custom events.

| Component | Preview behavior |
| --- | --- |
| TreeTable | Nested items, additional columns, expand/collapse, native table semantics |
| Masonry | Responsive CSS multi-column layout; reading order is column-based |
| TaskPanel | Task checklist, progress, disabled/readonly, cu-change |
| CommandSurface | Reuses CommandBar actions and overflow |
| WindowPane | Slotted panel with title, actions, collapse and close request |
| ChatComposer | Plain-text draft, send button, optional Enter-to-send, cu-send |
| MessageList | Plain-text message bubbles, sender/time and opt-in auto-scroll |
| SearchResults | Local accent-insensitive search, result selection |
| MediaPlayer | Native audio/video controls, local or supplied source, captions |
| UploadManager | Host-supplied file status, progress, cancel/retry requests |
| Wizard | Stepper, named step slots, back/next/finish events |
| DashboardShell | AppShell variant with navigation opt-in |

TreeTable requires unique IDs, a label, optional values map and child nodes.
Use items, columns and expandedValues. It is a native table with expandable
rows, not a full ARIA treegrid, does not sort/filter hierarchy and is not
virtualized. Masonry uses CSS columns rather than a JavaScript layout engine.
TaskPanel items are {id,label,completed,disabled}; the application owns
persistence. WindowPane's close event is a request, not a window close.

ChatComposer emits cu-send with the trimmed draft, clears the draft, and
does not perform network requests. MessageList accepts {id,sender,text,time,own}
records, rendered as text. SearchResults accepts {id,title,description,meta}
and filters only supplied items. MediaPlayer does not auto-play and uses
native controls. Provide captions-src and captions-language for video where
needed; actual codec support depends on the browser or webview.
UploadManager accepts {id,name,size,progress,status,error} and emits cu-action
for cancel/retry. The application owns transport and authorization.
Wizard accepts steps with unique values, slots named step-VALUE, and emits
cu-change/cu-finish; applications own validation and persistence.
DashboardShell has no default sidebar; with-navigation enables it.

```html
<cu-wizard id="setup" linear>
  <section slot="step-profile">Profile settings</section>
  <section slot="step-review">Review settings</section>
</cu-wizard>
```

```js
const setup = document.querySelector("#setup");
setup.steps = [{value:"profile",label:"Profile"},{value:"review",label:"Review"}];
setup.addEventListener("cu-finish", () => console.log("Finish requested"));
```

All components remain preview. Test keyboard navigation, accessibility,
focus, dynamic data, validation, empty states, performance, responsive
layouts and real installed-package integration before production adoption.
