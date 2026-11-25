# SplitView, VirtualList and connected FilterBar/DataTable

This milestone implements two experimental browser-native components and
integrates the existing FilterBar with DataTable. The filtering helpers
now live in a **small, dependency-free** module instead of requiring
DataTable (with its menus, selection controls and rendering graph) just
to filter a JavaScript array.

All remain **preview**, not production-certified or published.

| Component / utility | API | Events |
| --- | --- | --- |
| `cu-split-view` | `position`, `collapsible`, `collapsed`, `collapse()`, `expand()`, `toggle()` | `cu-input`, `cu-change`, `cu-toggle` |
| `cu-virtual-list` | `items`, `itemHeight`, `overscan`, `selectedIndex`, `labelKey`, `scrollToIndex()`, `select()` | `cu-change` |
| `CuDataTable.bindFilterBar()` | `bindFilterBar(bar,{searchKeys})`, `unbindFilterBar()`, `externalFilterState` | `cu-filter-change` on the table |

## SplitView

```html
<cu-split-view id="workspace" label="Project editor"
  position="30" min="15" max="75" collapsible style="height:400px">
  <aside slot="sidebar">Project navigation</aside>
  <main slot="content">Document editor</main>
</cu-split-view>
```

```js
const workspace=document.querySelector("#workspace");
workspace.addEventListener("cu-change",event=>{
  console.log("Split width",event.detail.position);
});
workspace.addEventListener("cu-toggle",event=>{
  console.log("Sidebar collapsed",event.detail.collapsed);
});
workspace.collapse();
workspace.expand();
workspace.setAttribute("orientation","vertical");
```

SplitView composes existing `cu-splitter` and
`cu-resizable-panel` rather than duplicating drag logic.
The **sidebar/content slots** are standard DOM nodes provided by the
application; user content is not interpolated into innerHTML.

When `collapsible` is set, a native toggle button shows or hides
the sidebar. It carries `aria-expanded` and `aria-controls`.
A collapsed sidebar becomes inert, so its buttons/fields are excluded
from keyboard focus, while the content pane gets the available space.
Re-expanding restores the original percentage from the `position`
attribute. `cu-toggle` emits `{collapsed,position}`.

The inner Splitter supplies pointer/touch dragging, a focus-visible
separator, Arrow keys, Shift+Arrow and Home/End adjustments.
Resize events from nested controls are **not** treated as panel-resize
events. A visible SplitView reports `cu-input` during dragging and
`cu-change` when the resize is committed.
Give the host an explicit height and test both orientations at mobile
widths.

## VirtualList

```html
<cu-virtual-list id="records" label="Records" item-height="40"
  overscan="5" style="height:320px"></cu-virtual-list>
```

```js
const list=document.querySelector("#records");
list.items=Array.from({length:10000},(_,index)=>({
  id:index,
  label:"Record "+String(index+1)
}));
list.addEventListener("cu-change",event=>{
  console.log(event.detail.index,event.detail.item);
});
list.scrollToIndex(7999);
list.select(7999);
list.focus();
```

`items` is a **JavaScript property**, not a JSON attribute. Keep a
stable array reference when using React; replace the array when records
change. For object items, `label-key="title"` controls the displayed
text key. Records with `disabled:true` are not selectable.
`item-height` sets the **fixed item height in CSS pixels** (default
40); dynamic row heights are not supported. Overscan defaults to 4
items on either side and can be set between 0 and 50.

The virtualization algorithm computes the visible range based on
scroll offset, viewport height and fixed item height, then renders only
that range plus overscan. It uses top and bottom spacers for the
remaining scrollable height. The listbox container has
`role="listbox"`, accessible label and roving selection.
Rendered rows have `role="option"`, `aria-selected`,
`aria-posinset` and `aria-setsize`. The list uses
`aria-activedescendant` only for an option actually present in
the DOM. Supported keys: ArrowUp/ArrowDown, Home/End,
PageUp/PageDown, Enter and Space.

The component renders each record label through `textContent`, not
HTML interpolation. `select(index)` emits
`cu-change {index,previousIndex,item,value}`, scrolls the selected
record into view and returns whether selection changed.
Setting `selectedIndex` programmatically does not emit a user event.
`virtualListRange` and `virtualListLabel` are pure helpers, exported
through the main Web Component barrel and standalone VirtualList entry.

For remote datasets, supply only pages already loaded into `items`;
this preview does not yet implement infinite remote fetch or
variable-size item measurement.

## FilterBar binds directly to DataTable

```html
<cu-filter-bar id="filters" label="Find projects">
  <cu-data-filter field="status" label="Status" operator="equals">
  </cu-data-filter>
  <cu-data-filter field="owner" label="Owner">
  </cu-data-filter>
</cu-filter-bar>
<cu-data-table id="projects" page-size="10"></cu-data-table>
```

```js
const filters=document.querySelector("#filters");
const table=document.querySelector("#projects");
table.columns=[
  {key:"name",label:"Name"},
  {key:"status",label:"Status"},
  {key:"owner",label:"Owner"}
];
table.rows=[
  {name:"ComponentUI",status:"Active",owner:"Ada"},
  {name:"NovaBrowser",status:"Review",owner:"Ada"}
];
const unbind=table.bindFilterBar(filters,{searchKeys:["name","owner"]});

// Column filters remain independent; results must pass BOTH sets.
table.setColumnCondition("status","equals","Active");
console.log(table.filteredRows);
console.log(table.externalFilterState); // {query,conditions}

// On teardown:
unbind(); // same as table.unbindFilterBar()
```

`bindFilterBar(bar,{searchKeys})` immediately reads the FilterBar's
keyword query and structured conditions, then subscribes to
`cu-filter-change`. This triggers DataTable's existing paging and
rendering logic, resetting page to 1 and dispatching the table's
`cu-filter-change` with both the existing `filters` and additional
`query`/`externalFilters` metadata. The table's
`columnFilters` API is **not replaced**.

Use `unbindFilterBar()` or the cleanup callback to detach listeners,
clear external conditions and restore the table's independent column
filters. A disconnected DataTable also unbinds. Rebind explicitly after
reconnecting or moving the table if needed.

Filters are applied client-side, over `table.rows`. A server-backed
table should use application-level fetching instead of passing a
large remote dataset into this component.

## Lightweight shared filter helpers

The pure data helpers moved into
`@componentui/web/components/filter-utils`. The following imports
retain their existing public behavior and compatibility:

```js
import { applyFilterBar } from "@componentui/web/components/filter-bar";
import { filterTableRows,matchTableFilterCondition }
  from "@componentui/web/components/data-table";
```

New lightweight import:

```js
import {
  applyFilterBar,filterTableRows,matchTableFilterCondition,
  TABLE_FILTER_OPERATORS
} from "@componentui/web/components/filter-utils";
```

This entry does not import the DataTable UI, Shadow DOM or menu modules.
The old DataTable and FilterBar named exports remain available as
reexports for compatibility. Individual Web Component imports still
register the component tag:

```js
import "@componentui/web/components/split-view";
import "@componentui/web/components/virtual-list";
```

React adds `SplitView` and `VirtualList` wrappers in
`@componentui/react/components` and the React factory. Vue and
Svelte continue to use native Custom Elements and their `cu-*` events.

## Local acceptance

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

Test mouse/touch dragging, keyboard focus, collapsed sidebar controls,
horizontal/vertical layout, 10,000-item list scrolling and
selected-item announcements, empty/disabled states, combined table
filters, light/dark and touch density, high contrast and 200% zoom.
Browser testing (including screen-reader behavior and installed-package
smoke tests) is still required before production certification.
No GitHub Actions were run.
