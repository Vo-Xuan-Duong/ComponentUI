# DockLayout and KanbanBoard (preview)

Import the registry or standalone modules.

```js
import "@componentui/web/components/dock-layout";
import "@componentui/web/components/kanban-board";
```

## DockLayout

```html
<cu-dock-layout id="workspace" label="IDE workspace">
  <div slot="start">Explorer</div>
  <main>Editor</main>
  <div slot="end">Inspector</div>
  <div slot="bottom">Output</div>
</cu-dock-layout>
```

```js
const workspace = document.querySelector("#workspace");
workspace.layout = {start:24,end:24,bottom:28};
workspace.addEventListener("cu-resize", e => console.log(e.detail.layout));
workspace.toggleRegion("start");
```

The default slot is the main workspace. The start, end and bottom slots
are optional and only occupy space when supplied and open. Side widths
are percentages constrained to 10–40; bottom height is 10–70 percent.
The component has fixed docking regions, not a freeform floating window
manager. Drag separators, use the arrow keys (2 percentage points, Shift
10), or Home/End. Horizontal coordinates account for RTL. Pointer cancel
restores the initial state. Closing a region hides its content without
destroying it. The layout property is a serializable defensive snapshot;
the host application owns persistence. cu-input reports live resizing,
cu-resize reports committed resizing, and cu-change reports region
toggles. The disabled property prevents user resizing and toggling.

## KanbanBoard

```html
<cu-kanban-board id="tasks" label="Project tasks"></cu-kanban-board>
```

```js
const board = document.querySelector("#tasks");
board.lanes = [{id:"todo",label:"To do"},{id:"done",label:"Done"}];
board.items = [{id:"a",laneId:"todo",title:"Review changes"}];
board.addEventListener("cu-move", e => console.log(e.detail));
board.moveItem("a","done");
```

Lanes and tasks use unique nonempty IDs. Tasks require a title and
an existing laneId, and support description, tag and disabled fields.
Drag a task over a card to insert before it, or drop on lane whitespace
to append. Native HTML drag/drop support varies on touch devices; the
lane selector and up/down buttons are usable without dragging.
moveItem(id,laneId,beforeId) provides the same operations programmatically.
Readonly and disabled tasks prevent moves. The cu-move event reports id,
laneId, previousLaneId, beforeId and a copy of the moved item. For a
controlled board the application should replace its items state using
board.items after an accepted move. No backend writes, task editing,
swimlanes, multi-card moves or virtualization are included.

## Frameworks and local acceptance

React exports DockLayout and KanbanBoard with property bindings and
onCuResize/onCuMove handlers. Vue and Svelte can bind native DOM properties;
Electron/Tauri can reuse the same components. Run npm run check,
npm run check:packages and npm run preview. Verify pointer cancellation,
RTL, keyboard resizing, slot visibility, focus restoration, drag/drop,
touch alternatives, narrow layouts and dark mode before production use.
