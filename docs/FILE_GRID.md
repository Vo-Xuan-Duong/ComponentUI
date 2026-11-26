# FileExplorer and DataGrid (preview)

Import the registry or standalone entrypoints:

```js
import "@componentui/web/components/file-explorer";
import "@componentui/web/components/data-grid";
```

## FileExplorer

```html
<cu-file-explorer id="files" label="Project files"></cu-file-explorer>
```

```js
const files = document.querySelector("#files");
files.items = [
  {id:"src",name:"src",kind:"folder"},
  {id:"index",parentId:"src",name:"index.js",kind:"file",size:2048}
];
files.actions = [{value:"rename",label:"Rename"}];
files.addEventListener("cu-open", e => console.log(e.detail.entry));
files.addEventListener("cu-action", e => console.log(e.detail.action,e.detail.id));
```

Flat records require unique IDs, a name and a file/folder kind. The optional
parentId refers to a folder; null or absent means root. Orphans and cycles are
excluded. Folder-first natural-name ordering, breadcrumbs, parent navigation,
current-folder accent-insensitive search, size and modification metadata,
selection, keyboard-accessible context menus (Shift+F10) and empty states
are supported. Activate the name button to open; folder navigation emits
cu-change and file opening emits cu-open. Extra actions emit cu-action.
The component does not access the filesystem or perform rename/copy/delete;
the host application owns authorization, actual operations and updated items.
No recursive search, drag/drop, tree pane or filesystem backend is included.

## DataGrid

```html
<cu-data-grid id="inventory" caption="Inventory" page-size="10" selectable></cu-data-grid>
```

```js
const grid = document.querySelector("#inventory");
grid.columns = [
  {key:"name",label:"Name",editable:true,required:true},
  {key:"quantity",label:"Quantity",editable:true,type:"number",min:0,step:1}
];
grid.rows = [{id:"a",name:"Item A",quantity:12}];
grid.addEventListener("cu-cell-change", e => console.log(e.detail));
```

DataGrid extends DataTable and shares sorting, pagination, row selection,
header and row context menus, Excel-style value/condition filters, hidden
columns, loading/error and filter bar integration. Columns opt in to editing
with editable:true. Editable rows require unique, non-null IDs. The five
editor types are text, number, boolean, select and color. Right-click a cell
and choose Edit cell, or use double-click/F2/Enter. Escape cancels the draft;
valid edits commit via Enter/native change. Invalid edits retain the last
accepted value. setCellValue(id,key,value) validates and emits cu-cell-change
for actual changes, including the previous value and a replacement row.
The input row object is not mutated. Applications with controlled rows
should update their source state from this event. Readonly blocks editing.
There is no additional action column, spreadsheet clipboard, multi-cell
range selection, undo/redo, server persistence or row virtualization.

## Integration

React exposes FileExplorer and DataGrid, with onCuOpen, onCuAction and
onCuCellChange. Vue/Svelte use native DOM properties and events; desktop
hosts can wire their own permitted file APIs. Run npm run check,
npm run check:packages and npm run preview locally. Verify context menu
focus, edit commit/cancel, filter changes after editing, controlled rows,
folder navigation, keyboard access and browser rendering before production use.
