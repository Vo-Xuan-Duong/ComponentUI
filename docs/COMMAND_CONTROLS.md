# Command controls — IconButton, ToggleButtonGroup, Toolbar and CommandBar

These are **experimental** Fluent Calm browser Custom Elements using locally
bundled Lucide icons, Shadow DOM and the shared CSS variables. They are
marked `preview`, not production-certified or published.

| Element | Purpose | Properties | Events |
| --- | --- | --- | --- |
| `cu-icon-button` | Labeled icon-only button; optional toggle | `name`, `disabled`, `loading`, `toggle`, `pressed` | `cu-press`, `cu-change` when toggle |
| `cu-toggle-button-group` | Single/multiple selection | `items`, `value`, `multiple`, `disabled` | `cu-change` |
| `cu-toolbar` | Compose custom controls with arrow navigation | slotted children, `orientation`, `label` | Delegated from children |
| `cu-command-bar` | Adaptive command actions and overflow | `commands`, `maxVisible`, `disabled` | `cu-action` |

## IconButton

```html
<cu-icon-button name="save" label="Save changes" variant="filled"></cu-icon-button>
<cu-icon-button name="eye" label="Toggle preview" toggle></cu-icon-button>
<cu-icon-button name="pencil" label="Edit" disabled></cu-icon-button>
```

`name` is a Lucide icon name from the locally bundled subset.
**Always provide a meaningful accessible label** using `label` or
`aria-label`. Variants: subtle (default), filled, outline, accent. Sizes:
sm, default, lg, xl. The native button responds to Enter/Space and has
focus-visible, high-contrast and reduced-motion styling.

A normal activation emits `cu-press` with `{type:"button",name}`.
With `toggle`, the element additionally reflects `pressed` and emits
`cu-change` with `{value:name,pressed}`, using `aria-pressed` on the
native button. `disabled` and `loading` prevent activation. Public
methods: `press()`, `focus()`, `click()`.

## ToggleButtonGroup

```html
<cu-toggle-button-group id="align" label="Text alignment"></cu-toggle-button-group>
<cu-toggle-button-group id="filters" multiple label="Status filters"></cu-toggle-button-group>
```

```js
const align=document.querySelector("#align");
align.items=[
  {value:"left",label:"Left",icon:"menu"},
  {value:"center",label:"Center",icon:"check"},
  {value:"right",label:"Right",disabled:true}
];
align.value="left";
align.addEventListener("cu-change",event=>console.log(event.detail.value));

const filters=document.querySelector("#filters");
filters.items=[{value:"draft"},{value:"review"},{value:"published"}];
filters.value=["draft","review"];
filters.addEventListener("cu-change",event=>console.log(event.detail.values));
```

`items` is a JavaScript property, not an HTML attribute.
In single mode `value` is a string; in `multiple` mode it is an array
of selected strings, returned as a defensive copy. The event contains
`{value,values}`; `values` is always an array. Assignment to the
`value` property is controlled and does not itself emit `cu-change`.
Disabled options cannot be selected through the user interface.

The component renders a named group of native buttons with `aria-pressed`
states. Arrow keys and Home/End move a roving keyboard focus; Enter/Space
activate. Set `orientation="vertical"` to stack controls vertically.
These controls are **not form-associated**: application code must persist or
serialize their selection.

## Toolbar

```html
<cu-toolbar label="Editor tools">
  <cu-icon-button name="save" label="Save"></cu-icon-button>
  <cu-icon-button name="pencil" label="Edit"></cu-icon-button>
  <cu-button variant="outline">Publish</cu-button>
</cu-toolbar>
```

Toolbar composes children rather than duplicating controls. It accepts
`button`, `cu-button`, `cu-icon-button`, `cu-split-button`,
`cu-select`, `cu-toggle-button-group` and elements with
`data-toolbar-control`. Child controls own their activation and events.
The toolbar provides `role=toolbar` and an accessible name.

ArrowLeft/ArrowRight move focus in the default horizontal layout;
ArrowUp/ArrowDown do so in vertical layout. Home/End move to first/last.
Disabled or hidden children are excluded. Focus moves among eligible controls
without activating them. The public `refresh()` method can recompute
focus order after application-driven disabled-state changes.

Toolbar can scroll horizontally on small screens; `variant="flat"`
removes its surrounding surface and border. A `data-separator` element
can visually divide groups.

## CommandBar

```html
<cu-command-bar id="commands" label="Project actions" max-visible="3">
</cu-command-bar>
```

```js
const bar=document.querySelector("#commands");
bar.commands=[
  {value:"save",label:"Save",icon:"save"},
  {value:"new",label:"New item",icon:"plus"},
  {value:"search",label:"Search",icon:"search"},
  {value:"archive",label:"Archive",disabled:true}
];
bar.addEventListener("cu-action",event=>console.log(event.detail));
bar.maxVisible=2;
```

`commands` uses a property array with unique `value` keys.
`normalizeCommands()` removes invalid or duplicate keys and normalizes
labels and disabled states. `partitionCommands(items,maxVisible)` is a
pure helper for predictable overflow. `maxVisible` is an upper bound,
default 4; `ResizeObserver` adjusts how many items fit in the host.
Remaining actions go into the locally styled `cu-context-menu` flyout.

Both visible buttons and overflow menu items emit the same
`cu-action` event with `{value,label}`. Disabled commands never activate.
`activate(value)` and `showOverflow()` are public methods.
The More button offers ArrowDown/ArrowUp to open and the shared context menu
provides Arrow navigation, Home/End and Escape with focus restoration.
The `visibleCommands` and `overflowCommands` getters return copies.

## Framework integration

All four are available via `@componentui/web/components` or individual paths:

```js
import "@componentui/web/components/icon-button";
import "@componentui/web/components/toggle-button-group";
import "@componentui/web/components/toolbar";
import "@componentui/web/components/command-bar";
```

React wrappers are available from `@componentui/react/components` or the
`createReactComponents(React)` factory. React passes `items`,
`commands`, `value`, `pressed`, `toggle` and `maxVisible`
through DOM properties, not serialized attribute strings. Stable array prop
references avoid unnecessary reassignment. Events are exposed through
`onCuPress`, `onCuChange` and `onCuAction`.

Vue 3's Custom Element compiler predicate and Svelte 5 native Custom Event
binding can use these elements without a separate renderer.

## Local verification

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

In Playground, exercise keyboard focus, single/multiple selection,
disabled/loading states, command overflow at different widths, Light/Dark
themes, all densities, 200% zoom, forced colors, and reduced-motion settings.
Verify NVDA/VoiceOver narration of icon button labels, pressed states,
group/toolbar naming and the overflow menu. Browser and framework runtime
checks remain local acceptance tasks, not completed certification.
No GitHub Actions are run.
