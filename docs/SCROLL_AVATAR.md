# ScrollArea and AvatarGroup (preview)

Native Web Components using Fluent Calm theme tokens. Import the registry or the standalone modules.

```js
import "@componentui/web/components/scroll-area";
import "@componentui/web/components/avatar-group";
```

## ScrollArea

```html
<cu-scroll-area id="activity" label="Workspace activity"
  axis="vertical" scrollbar="thin" variant="outlined"
  style="--cu-scroll-max-height:240px">
  <div>Scrollable content</div>
</cu-scroll-area>
```

The slotted content is inside a focusable, labeled native scroll viewport.
Axis is vertical (default), horizontal or both. The default maximum block
size is 240px in vertical/both modes; override --cu-scroll-max-height
for a larger or smaller viewport. Horizontal mode is not height-constrained.
Native scrollbars can be auto, thin or hidden; browser/platform scrollbar
behavior varies. Hidden scrollbars remain scrollable but may be harder
to discover. Native touch, wheel, keyboard and focus behavior is preserved.
Overscroll chaining is contained. The metrics getter returns positions,
maxima, edge flags (one-pixel tolerance) and overflow flags. RTL horizontal
coordinates follow native negative scrollLeft; atStart/atEnd are logical.
The cu-scroll event emits metrics on native scroll, not on initial render
or resize. ResizeObserver updates viewport data attributes as dimensions
change. Use the native-compatible scrollTo and scrollBy methods and focus().
This is a regular scroll region, not a virtualized list.

```js
const area = document.querySelector("#activity");
area.addEventListener("cu-scroll", event => {
  if (event.detail.atBottom) console.log("End reached");
});
area.scrollTo({top:area.metrics.maxScrollTop});
```

## AvatarGroup

```html
<cu-avatar-group id="team" label="Contributors" max-visible="3"></cu-avatar-group>
```

```js
const team = document.querySelector("#team");
team.items = [
  {id:"a",name:"Alex Nguyen"},
  {id:"b",name:"Mai Tran"},
  {id:"c",name:"Linh Pham"},
  {id:"d",name:"Minh Vo"}
];
```

Items contain a nonempty name and optional id, src and alt.
Duplicate explicit IDs are ignored; people with the same name may
remain distinct. Missing images use initials through the existing Avatar
component. No avatar service is required. max-visible defaults to 4 and
supports 0–100. Overflow is displayed as +N with an accessible disclosure
button. The button reveals an inline list of remaining members; Escape
closes it when focus is inside the component. It is not a floating popover.
The expanded property, size (sm/md/lg/xl), shape (circle/square), and
variant (overlap/spaced) customize the display. cu-toggle exposes expanded,
count (additional members) and total. Array properties return defensive copies.

## Framework integration and acceptance

React wrappers are ScrollArea and AvatarGroup. Use onCuScroll and onCuToggle.
Vue and Svelte can assign items as a DOM property and subscribe to custom
events directly; Electron and Tauri reuse the same web implementation.
Run npm run check, npm run check:packages and npm run preview.
Test native scrollbar appearance, keyboard/touch/trackpad scrolling, RTL,
dynamic content resize, hidden scrollbars, avatar image fallback, overflow
disclosure, dark mode, forced colors and narrow viewports. Browser and
installed-package acceptance are pending.
