# Data, navigation and menu components — v0.8.0

This experimental batch implements five reusable Web Components:
`DataTable`, `TreeView`, `ListBox`, `Combobox`, and `ContextMenu`.
Components use **Fluent Calm tokens, Shadow DOM, and bundled Lucide SVG
icons**. All are previews: accessibility, browser compatibility and
React/Vue integration require local verification before production.

**API naming:** `Combobox` matches the existing catalog entry;
`cu-combobox` is the browser tag. `ListBox` is a new catalog entry.

## API overview

| Tag | Main API | Events | Interaction |
| --- | --- | --- | --- |
| `cu-data-table` | `.columns`, `.rows`, `.columnFilters`, `.rowActions`, `.headerActions`, `.page` | `cu-filter-change`, `cu-sort`, `cu-page-change`, `cu-row-action`, `cu-header-action`, `cu-column-visibility-change` | Excel-style checkbox filters, right-click menus, sorting, visibility, selection and pagination |
| `cu-tree-view` | `label`, `value` and nested `cu-tree-item` elements | `cu-change`, `cu-toggle` | Arrow navigation, expand/collapse, Home/End, Enter |
| `cu-listbox` | `name`, `value`, `label`, `required`; child `cu-list-option` | `cu-input`, `cu-change` | Single select, arrow keys, Enter/Space, FormData |
| `cu-combobox` | `name`, `value`, `label`, `placeholder`; child `cu-combo-option` | `cu-input` (query), `cu-change` (committed value) | Editable filtering, Arrow keys, Enter, Escape |
| `cu-context-menu` | target slot, child `cu-menu-item`, `showAt(x,y)`, `hide()` | `cu-open`, `cu-close`, `cu-select` | Right-click, keyboard ContextMenu / Shift+F10, arrow navigation |

`cu-tree-item`, `cu-list-option`, and `cu-combo-option` are
declarative **data child tags**, not separate catalog components.
`cu-context-menu` reuses the existing `cu-menu-item`.

### Registration

```js
import "./packages/web/src/components/index.js";
```

Or import only needed modules:

```js
import "./packages/web/src/components/data-table.js";
import "./packages/web/src/components/tree-view.js";
import "./packages/web/src/components/listbox.js";
import "./packages/web/src/components/combobox.js";
import "./packages/web/src/components/context-menu.js";
```

Load `packages/theme/src/tokens.css` beforehand for the intended
theme and density. The packages remain private/workspace-only, not
published npm packages.

## DataTable

```html
<cu-data-table id="projects" caption="Projects" page-size="5"
  selectable></cu-data-table>
```

```js
const table = document.querySelector("#projects");
table.columns = [
  { key: "name", label: "Project" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status", sortable: false }
];
table.rows = [
  { id: "nova", name: "NovaBrowser", owner: "Dev", status: "Active" },
  { id: "ui", name: "ComponentUI", owner: "Dev", status: "Draft" }
];

table.rowActions = [
  { value: "open", label: "Open" },
  { value: "rename", label: "Rename" },
  { value: "archive", label: "Archive", disabled: row => row.status === "Draft" }
];
table.headerActions = [
  { value: "inspect", label: "Inspect column" }
];

table.addEventListener("cu-sort", event => {
  console.log(event.detail.key, event.detail.direction);
});
table.addEventListener("cu-selection-change", event => {
  console.log(event.detail.selectedIds);
});
table.addEventListener("cu-row-action", event => {
  // {action, label, id, row}; perform the action in the host application.
  console.log(event.detail.action, event.detail.id, event.detail.row);
});
table.addEventListener("cu-header-action", event => {
  // {action, label, key, column}: also fired for built-in menu actions
  console.log(event.detail.action, event.detail.key);
});
table.addEventListener("cu-column-visibility-change", event => {
  console.log(event.detail.visibleKeys, event.detail.hiddenKeys);
});
table.addEventListener("cu-filter-change", event => {
  console.log(event.detail.filters, event.detail.filteredCount, event.detail.totalCount);
});
// Programmatic equivalent of applying a filter through the column header:
table.setColumnFilter("status", ["Active"]);
// table.clearColumnFilter("status");
// table.clearAllFilters();
```

Assign arrays to **JavaScript properties**, not HTML string attributes.
Columns must have stable string `key` values and rows should use
stable unique `id` values for selection. Table cells use `textContent`,
not unsanitized HTML. Sorting is stable for equal keys and handles
numeric values; pagination is client-side and clamps to a valid page.
`page-size` is capped at 100. `loading` shows a loading row.
actions are no longer rendered in a dedicated table column. Instead, set
`.rowActions` to an array of `{value,label,disabled?}` (the optional
`disabled` can be a boolean or a per-row predicate). Right-click any
actionable row to open the shared `cu-context-menu`; focused rows support the
ContextMenu key and Shift+F10, and the flyout supports Up/Down, Home/End,
Escape, disabled entries and focus return. A row is focusable only when it has
actions. Opening an action menu highlights its row without changing checkbox
selection. Use `cu-row-action` with `{action,label,id,row}` to handle actions
in the application; the table never performs destructive actions itself.
`row-action="Open"` is retained as a deprecated compatibility alias: it
creates a single **context-menu item**, not a button or actions column, and
also emits `cu-row-activate` when chosen. There is no menu on rows without
configured actions.

### Excel-style column filtering

Each filterable column gets a small **sliders** button beside its header.
Select it, or right-click the header and choose **Filter by values...**, to
open a non-modal filter dialog with distinct values and occurrence counts.
The dialog provides a case-insensitive **Search values** input, checkboxes,
**Select all matching** (affects only values matched by the search), and
**Apply**, **Cancel**, **Clear**. Escape and outside clicks dismiss edits
without applying. Keyboard focus returns to the originating header when the
dialog is dismissed. Active filters color the header and filter trigger.

Filters are client-side and evaluated **before** sorting/pagination. Multiple
column filters are combined using AND; alternative checked values within a
single column use OR. The checkbox choices for a column are derived from
records matching all *other* column filters; currently selected values are
retained even if they temporarily have zero matching records.
Blank/null/undefined values are grouped as `(Blanks)`, while strings,
numbers and booleans use distinct keys. A search only narrows the visible
checkbox choices, not the table until Apply is pressed.

`table.columnFilters = {status:["Active"],owner:["Dev"]}` sets the whole
filter state; `table.setColumnFilter(key,values)` updates one column.
`table.clearColumnFilter(key)` and `table.clearAllFilters()` remove
applied filters. `table.filteredRows` returns all matching records before
sorting/pagination. An empty values array matches no records, while null
clears a filter; condition objects use supported operators; `filterable:false` disables filtering for that column.
Filter state survives sort, page changes, and replacement row arrays.
The `cu-filter-change` event exposes
`{filters,filteredCount,totalCount}`. Filtered summaries read
**N of M rows**, and the empty state reads **No matching records**.
The helpers `filterTableRows`, `uniqueTableFilterValues`, and
`tableFilterValueKey` are exported for advanced use.

### Conditional filters (text and numeric)

The filter flyout has two modes: **Values** (checkboxes) and **Conditions**.
The Conditions mode uses the shared `cu-select` styling (no native OS select
dropdown), a primary operand, and a second operand for inclusive **Between**.
The available operators are:

| Kind | Operators |
| --- | --- |
| Text | `contains`, `not-contains`, `starts-with`, `ends-with`, `equals`, `not-equals` |
| Numeric | `greater-than`, `greater-or-equal`, `less-than`, `less-or-equal`, `between` |
| Blank | `is-blank`, `is-not-blank` |

Text operations compare case-insensitively. Numeric operations coerce finite
numbers and reject non-numeric cells (including blank cells); Between is
inclusive. Blank operators require no operand. The operator field reuses
`<cu-select>` for consistent hover and keyboard behavior, and invalid or
missing operands are rejected before Apply. Switching modes edits a draft
until Apply; Cancel and Escape discard draft changes.

Filters now accept either the existing **array of allowed values** or a
condition object with `{operator,value?,value2?}`:

```js
table.setColumnCondition("owner", "contains", "duong");
table.setColumnCondition("amount", "between", 100, 500);
table.columnFilters = {
  owner: { operator: "starts-with", value: "D" },
  status: ["Active", "Review"]
};
table.clearAllFilters();
```

Both kinds compose with AND across columns. Existing value filters,
`setColumnFilter()`, `cu-filter-change`, `filteredRows` and all pagination
APIs remain supported. `matchTableFilterCondition`,
`isTableFilterCondition`, `normalizeTableFilterSpec`, and
`TABLE_FILTER_OPERATORS` are exported for non-DOM data consumers.

### Header context menu

Right-click a column heading (or focus it and press Shift+F10 / ContextMenu)
to open the same `cu-context-menu` used for row actions. The built-in menu
offers **Sort ascending**, **Sort descending**, **Clear sorting**, **Filter by values...**, **Clear column filter**, **Clear all filters**, **Hide column**
and **Show all columns**. Sorting entries are disabled when a column declares
`sortable: false`; the last remaining visible column cannot be hidden.
The menu highlights the active header, supports keyboard navigation and
returns focus to a visible header after applying an action.

Header actions work on the client: sorting changes row order and resets the
current page; hiding a column changes rendered headers and cells, including
empty/loading colspans. `.columns` retains the full original configuration.
`.hiddenColumnKeys` and `.visibleColumnKeys` expose the current state;
`hideColumn(key)`, `showAllColumns()` and `clearSort()` are available for
programmatic control. Hiding the sorted column clears sorting and emits
`cu-sort` with `{key:"",direction:"asc"}`.

Developers may append custom `.headerActions` entries shaped as
`{value,label,disabled?}`, with an optional disabled predicate receiving
the selected column. Reserved built-in identifiers (`sort-asc`,
`sort-desc`, `clear-sort`, `filter-values`, `clear-filter`,
`clear-all-filters`, `hide-column`, `show-all-columns`) cannot
be overridden. Selecting any enabled entry emits `cu-header-action`
with `{action,label,key,column}`; column visibility changes also emit
`cu-column-visibility-change` with `{hiddenKeys,visibleKeys}`.
All actions use text-only safe rendering and application-specific custom
actions are dispatched rather than executed by DataTable.

This is a **basic client-side DataTable**, not a virtualized DataGrid:
server-side pagination, 100k-row virtualization, column resizing, drag
and drop, cell editors, server-side filtering and date-grouping/pivot features are future enhancements.

## TreeView

```html
<cu-tree-view label="Project files" value="components">
  <cu-tree-item label="src" value="src" expanded>
    <cu-tree-item label="components" value="components"></cu-tree-item>
    <cu-tree-item label="assets" value="assets"></cu-tree-item>
  </cu-tree-item>
  <cu-tree-item label="Archived" value="archive" disabled></cu-tree-item>
</cu-tree-view>
```

Use Up/Down to move the active item, Right/Left to expand/collapse or
move into/out of a branch, Home/End to navigate, and Enter/Space to
select. The root uses `role=tree` with `aria-activedescendant`, and
rendered rows expose treeitem level and expansion semantics.

`cu-change` sends `{value,label}`; `cu-toggle` sends
`{value,expanded}`. Nodes may be changed declaratively.
Keep values unique across the hierarchy.

## ListBox

```html
<form id="settings">
  <cu-listbox label="Layout" name="layout" required value="details">
    <cu-list-option value="grid">Grid</cu-list-option>
    <cu-list-option value="details" selected>Details</cu-list-option>
    <cu-list-option value="compact">Compact</cu-list-option>
  </cu-listbox>
</form>
```

ListBox mirrors declarative options into a Shadow DOM `role=listbox`
with ARIA selection state and active descendant. Its `value` property
is mutable; `ElementInternals` participates in native `FormData`,
reset and required validity when supported. Hover and keyboard-active
rows use a **whole-row background**; the committed option uses a check
mark. Disabled options cannot be selected.

## Combobox

```html
<cu-combobox name="framework" label="Framework" required
  placeholder="Search frameworks...">
  <cu-combo-option value="react">React</cu-combo-option>
  <cu-combo-option value="vue">Vue</cu-combo-option>
  <cu-combo-option value="svelte">Svelte</cu-combo-option>
</cu-combobox>
```

Combobox is an **editable, strict-selection** control. Typing filters
suggestions by their label; it does not submit an arbitrary uncommitted
string. `cu-input` emits `{query,value:""}` when searching, and
`cu-change` emits `{value,label}` when an option is committed with
pointer or Enter. Escape or outside click closes the popup and
restores the last selected label. Native form value is the committed
option value only. It uses input `role=combobox`,
`aria-autocomplete=list`, `aria-expanded` and a listbox popup.

It does not fetch remote suggestions or implement virtualization.

## ContextMenu

```html
<cu-context-menu id="project-actions" aria-label="Project actions">
  <button slot="target" type="button">Right-click or Shift+F10</button>
  <cu-menu-item value="open">Open</cu-menu-item>
  <cu-menu-item value="rename">Rename</cu-menu-item>
  <cu-menu-item value="delete" disabled>Delete</cu-menu-item>
</cu-context-menu>
```

```js
const menu=document.querySelector("#project-actions");
menu.addEventListener("cu-select",event => {
  console.log(event.detail.value, event.detail.label);
});
// Optional touch / toolbar fallback:
menu.showAt(240, 120);
```

ContextMenu opens on the slotted target's `contextmenu` event or
ContextMenu key / Shift+F10; Arrow keys, Home/End and Escape navigate
and dismiss it. The flyout uses viewport-fixed positioning and clamps
coordinates to remain visible. Outside pointer or scroll dismisses it.
The component reports actions but does **not** perform destructive
operations itself. Provide a focusable slotted target.

## Framework integration

React wrapper factories in `packages/react/` include all five components
and their declarative child tags. Controlled properties for DataTable
(`rows`, `columns`, `rowActions`, `headerActions`, `page`), TreeView (`value`), ListBox (`value`,
`required`, `disabled`) and Combobox (`value`, `disabled`) are
assigned as DOM properties, not stringified attributes.
Events include `onCuSort`, `onCuPageChange`,
`onCuSelectionChange`, `onCuRowAction`, `onCuRowActivate`,
`onCuHeaderAction`, `onCuColumnVisibilityChange`, `onCuToggle`,
`onCuChange`, `onCuSelect`.

Vue 3 uses the same existing `cu-*` compiler predicate. DataTable
arrays should be bound as element **properties** in actual Vue apps;
validate this and SSR behavior locally.

## Local validation checklist

1. Run `npm run check`, then `npm run preview`. Open **Real Web Components**.
2. Test Light/Dark and Compact/Comfortable/Touch densities at desktop,
   320px and 200% zoom. Confirm table horizontally scrolls.
3. Sort numeric and text columns and verify page transitions, stable
   selections, disabled states and empty/loading rows. Right-click rows and
   use Shift+F10/ContextMenu, Arrow keys, Escape and pointer dismissal;
   verify disabled per-row actions, focus restoration, no Actions column,
   no automatic checkbox selection and correct `cu-row-action` details.
   Also test header right-click/Shift+F10, sort asc/desc/reset, hide/restore
   columns, disabled sorting, last-column protection and focus restoration.
4. Navigate nested TreeView using only the keyboard and verify the
   expanded/current/selected screen-reader states.
5. Check ListBox submission and reset, disabled options and
   keyboard-active vs selected visual states.
6. Filter Combobox suggestions, commit with Enter or pointer, cancel
   with Escape, and check required native FormData validation.
7. Open ContextMenu via right-click, Shift+F10, toolbar fallback and
   near each viewport corner; verify focus return and Escape.
8. Test Windows NVDA/Chrome/Firefox and platform target screen
   readers; validate zoom, high-contrast mode and focus visibility.
9. Test React 18/19, Vue 3 and Electron/Tauri WebViews in local projects.

These tests are **not executed by this change**. Node source tests cannot
certify visual, keyboard, screen-reader or cross-browser behavior.
No GitHub Actions workflows are added.
