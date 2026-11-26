# Desktop window chrome (preview)

TitleBar, WindowControls and StatusBar are renderer-independent custom
elements. They do not import Electron, Tauri, Node filesystem APIs, or
assume access to native window handles.

```js
import "@componentui/web/components/title-bar";
import "@componentui/web/components/window-controls";
import "@componentui/web/components/status-bar";
```

## TitleBar and WindowControls

```html
<cu-title-bar id="titlebar" title="ComponentUI Studio"
  subtitle="Workspace" icon="panel-left" draggable-region>
  <cu-button slot="actions" size="sm">Settings</cu-button>
</cu-title-bar>
<cu-window-controls id="controls"></cu-window-controls>
```

The title bar has leading, title, center, actions and controls slots.
Default controls expose minimize, maximize/restore and close. Set
no-controls to omit them; no-minimize, no-maximize and no-close disable
individual actions. Set inactive for an inactive window appearance.
WindowControls supports maximized, disabled and individual capability
properties minimizable, maximizable and closable. It emits requests, not
actual operating-system state changes. Update maximized from the host
after successful operations or native maximize/unmaximize notifications.

For Electron, use native-drag for opt-in CSS app-region dragging with
interactive slots excluded. Host configuration and Chromium/WebView
behavior determine whether CSS drag works; test the actual window.
Alternatively set draggable-region and handle cu-window-drag from the
eligible pointerdown. Interactive children do not emit drag requests.
A double-click in the event-based drag region requests maximize/restore.
Do not enable both drag strategies; native-drag takes precedence.

```js
const titlebar = document.querySelector("#titlebar");
// windowHost is a narrow, application-owned bridge, not a library export.
titlebar.addEventListener("cu-window-action", async ({detail}) => {
  try {
    await windowHost.perform(detail.action);
    titlebar.maximized = await windowHost.isMaximized();
  } catch (error) {
    console.error("Window action failed", error);
  }
});
titlebar.addEventListener("cu-window-drag", () => {
  windowHost.startDragging().catch(console.error);
});
```

Electron: expose an allowlisted window-action bridge through a preload
with context isolation. Implement minimize/maximize/unmaximize/close
in the main process for the sender's permitted window. Do not expose
arbitrary IPC channels, eval or unrestricted native APIs.

Tauri: implement the narrow bridge using the application's configured
window APIs (minimize/maximize/unmaximize/close/startDragging and
isMaximized). Grant only the required capabilities. Match the installed
Tauri version and test pointer activation and native window state.
For web-only apps, intercept requests to simulate a window or omit controls.
Do not call window.close() automatically.

## StatusBar

```html
<cu-status-bar id="status" label="Editor status"></cu-status-bar>
```

```js
const status = document.querySelector("#status");
status.items = [
  {id:"connection",label:"Connected",tone:"success",icon:"circle-check"},
  {id:"encoding",label:"UTF-8",align:"end"},
  {id:"language",label:"JavaScript",align:"end",action:"language"}
];
status.addEventListener("cu-action", e => console.log(e.detail.action));
status.setAttribute("announcement","Workspace connected");
```

Items have unique IDs, labels, optional values, icons, tones, alignment,
actions and disabled flags. Start/end slots allow application-owned
content. Use announcement for meaningful status updates; ordinary
item changes do not announce the entire bar. Items without an action
are informational text rather than focusable buttons.

## Integration and acceptance

React wrappers: TitleBar, WindowControls and StatusBar. Use
onCuWindowAction, onCuWindowDrag and onCuAction; Vue and Svelte can
listen to native custom events and bind properties directly.
The Playground simulates native actions only. Verify real Electron and
Tauri window behavior, drag/no-drag boundaries, maximize state,
disabled actions, keyboard navigation, focus, high contrast, RTL,
dark mode and narrow layouts before production use. Run npm run check,
npm run check:packages and npm run preview locally.
