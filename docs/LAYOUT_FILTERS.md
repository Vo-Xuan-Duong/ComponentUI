# Layout and data filtering — Splitter, ResizablePanel, FilterBar, DataFilter

Four new **experimental** Web Components are available in ComponentUI. They
use Fluent Calm semantic tokens and local Lucide icons and can be imported
individually. All require real browser, accessibility and installed-package
acceptance before production certification.

| Web component | Main attributes / properties | Events |
| --- | --- | --- |
| `cu-splitter` | `position`, `min`, `max`, `orientation`, `disabled` | `cu-input`, `cu-change` |
| `cu-resizable-panel` | `resizable`, `direction`, `label`, `variant` | `cu-resize` |
| `cu-data-filter` | `field`, `operator`, `value`, `disabled` | `cu-input`, `cu-change` |
| `cu-filter-bar` | `query`, `placeholder`, `label` | `cu-filter-change` |

## Splitter and ResizablePanel

```html
<cu-splitter id="workspace" position="38" min="20" max="80"
  label="Workspace layout" style="height:320px">
  <cu-resizable-panel slot="start" label="Navigation">
    <nav>Project tree and shortcuts</nav>
  </cu-resizable-panel>
  <cu-resizable-panel slot="end" label="Editor">
    <main>Workspace content</main>
  </cu-resizable-panel>
</cu-splitter>
```

```js
const splitter=document.querySelector("#workspace");
splitter.addEventListener("cu-input",e=>{
  console.log("Dragging",e.detail.position);
});
splitter.addEventListener("cu-change",e=>{
  console.log("Committed position",e.detail.position);
  saveLayoutPreference(e.detail.position);
});
splitter.position=50; // percentage; no event for programmatic assignment
splitter.setAttribute("orientation","vertical"); // top/bottom layout
```

The two named slots are `start` and `end`; the separator sits
between the panes. `position` specifies the first pane's share in percent.
`min` and `max` limit its range (defaults: 10–90). Each slotted
panel scrolls independently. Give the splitter an explicit height to avoid
collapsing the layout in page flows.

The separator supports mouse, pen and touch via Pointer Events and
pointer capture. Pointer movement fires `cu-input`; completing a changed
drag fires `cu-change`. Cancelling restores the initial position.
ArrowLeft/ArrowRight (horizontal layout) or ArrowUp/ArrowDown
(vertical layout) change by 5 percentage points; Shift changes by 10.
Home/End jump to min/max. The separator exposes
`role=separator`, `aria-valuenow`, `aria-valuemin`,
`aria-valuemax` and the appropriate `aria-orientation`.
`disabled` blocks both pointer and keyboard adjustments.

Pure helpers:

```js
import {
  clampSplitPosition,splitPositionFromPointer
} from "@componentui/web/components/splitter";
clampSplitPosition(95,20,80); // 80
```

To make a panel independently resizable (not inside Splitter):

```html
<cu-resizable-panel label="Notes" resizable direction="both"
  style="width:300px;height:180px">
  Drag the bottom-right corner to resize.
</cu-resizable-panel>
```

`direction` may be `horizontal`, `vertical` or `both`.
Standalone resizing uses browser CSS `resize`; the panel is a
scrollable region. When slotted into a Splitter, standalone resizing is
disabled to avoid competing handles. `cu-resize` emits
`{width,height}` when `ResizeObserver` detects size changes after
the initial observation.

## FilterBar and DataFilter

```html
<cu-filter-bar id="projects-filter" placeholder="Search projects"
  label="Find projects">
  <cu-data-filter field="status" label="Status" operator="contains">
  </cu-data-filter>
  <cu-data-filter field="owner" label="Owner" operator="equals">
  </cu-data-filter>
</cu-filter-bar>
```

```js
import { applyFilterBar } from "@componentui/web/components/filter-bar";
const bar=document.querySelector("#projects-filter");
const sourceRows=[
  {name:"ComponentUI",status:"Active",owner:"Dương"},
  {name:"NovaBrowser",status:"Review",owner:"Dương"},
  {name:"Sync Engine",status:"Active",owner:"Team"}
];
bar.addEventListener("cu-filter-change",event=>{
  const {query,conditions,activeCount}=event.detail;
  const results=applyFilterBar(sourceRows,query,conditions,["name","owner"]);
  renderRows(results);
  console.log("Active criteria",activeCount);
});
```

A `cu-data-filter` exposes `.condition` as either
`{field,operator,value}` or `null` for an inactive filter.
The `operator` dropdown uses **ComponentUI's own custom `cu-select`**,
not a native OS select popup. Supported operators include:

- `contains`, `not-contains`, `starts-with`, `ends-with`
- `equals`, `not-equals`
- `greater-than`, `greater-or-equal`, `less-than`, `less-or-equal`
- `is-blank`, `is-not-blank`

Blank-check operators hide the comparison input and are immediately
active. Other operators require a non-empty comparison value.
`buildFilterCondition(field,operator,value)` validates the specification.
Typing emits `cu-input`; committing a value, selecting an operator or
clearing emits `cu-change`. Direct property assignments don't emit
user-change events.

FilterBar assembles active child filters into `.conditions`,
a mapping from field name to `{operator,value}`. `.activeCount`
includes the non-empty keyword query plus active field conditions.
Its single `cu-filter-change` event has
`{query,conditions,activeCount}` and fires on user input.
`clear()` resets query and all child filters and emits one aggregate
event (returns `false` if there was nothing to clear).
The search input uses the native `type="search"` semantic control.

`applyFilterBar(rows,query,conditions,searchKeys?)` is a pure helper
that combines the existing DataTable condition matching with case-insensitive
keyword search. Supplying `searchKeys` limits the fields inspected
for keyword search; otherwise it searches across the row's enumerable
values. The helper does **not** fetch data, mutate the source rows or
automatically bind to DataTable. Applications remain responsible for
server-side filtering/pagination and synchronizing any DataTable instance.

## Framework adapters and standalone entries

```js
import "@componentui/web/components/splitter";
import "@componentui/web/components/resizable-panel";
import "@componentui/web/components/filter-bar";
import "@componentui/web/components/data-filter";
```

React provides `Splitter`, `ResizablePanel`, `FilterBar`, and
`DataFilter` via `@componentui/react/components` or the
`createReactComponents(React)` factory. Event callbacks are
`onCuInput`, `onCuChange`, `onCuResize` and
`onCuFilterChange` as appropriate. Use property control for
`Splitter.position`, `FilterBar.query` and
`DataFilter.field/operator/value`.
Vue and Svelte use the existing Custom Element/event integration.

## Local acceptance

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

Inspect the new cards in Playground. Check Splitter pointer capture,
touch drag, keyboard Home/End, orientation, min/max and focus;
ResizeObserver behavior and CSS resize affordance; filter operator
selection, disabled and blank operators; keyword/condition combinations,
reset, Light/Dark, densities, high contrast, reduced motion and zoom.
Run browser-based smoke tests and screen-reader review for the
host applications before using these components in production.

The source-level regression tests do not establish browser, framework
or screen-reader certification. No GitHub Actions workflows are executed.
