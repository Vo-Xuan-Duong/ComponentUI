# TreeList, InfiniteScroll and DataTable performance

This milestone adds the native `cu-tree-list` Web Component, the
auxiliary `cu-infinite-scroll` control, and opt-in-safe internal
caching for DataTable. Both new controls are registered through
`@componentui/web/components` and have individual package entries.
All components remain **experimental preview**.

The design-system catalog is still 129 components: TreeList moves
from planned to preview, giving 57 preview and 72 planned entries.
InfiniteScroll is an auxiliary feature (not a separate catalog entry).
The React adapter exposes 68 tags including these two.

## TreeList: virtualized hierarchical navigation

```html
<cu-tree-list id="file-tree" label="Workspace files"
  item-height="38" overscan="4" style="height:400px"></cu-tree-list>
```

```js
const tree=document.querySelector("#file-tree");
tree.items=[
  {value:"src",label:"Source",expanded:true,children:[
    {value:"app",label:"app.ts"},
    {value:"components",label:"Components",children:[
      {value:"button",label:"Button.tsx"},
      {value:"dialog",label:"Dialog.tsx"}
    ]}
  ]},
  {value:"docs",label:"Documentation"}
];
tree.addEventListener("cu-change",event=>{
  console.log("Selected",event.detail.value,event.detail.item);
});
tree.addEventListener("cu-toggle",event=>{
  console.log(event.detail.value,event.detail.expanded);
});
tree.expand("components");tree.select("button");
tree.collapse("src");
```

`items` is a JavaScript **property** with nested records. Each record
should have a stable, unique `value` (a string), a `label`, optional
`disabled`, optional `expanded` (initial state) and optional `children`.
The `expandedValues` property allows programmatic control of expansion.
Reassign `items` with a new array when source records change; keep the
array stable across unrelated React renders.

The component flattens **only expanded branches**, then calls the
same fixed-height `virtualListRange()` helper used by VirtualList.
It renders a small range of visible rows plus overscan; the remaining
scroll height is represented by spacers. Row height is fixed in CSS
pixels (default 38), and overscan is 4 by default. Variable-height
rows are not yet supported.

The scroll container uses `role="tree"`, with
`role="treeitem"`, `aria-level`, `aria-posinset`,
`aria-setsize`, `aria-expanded`, `aria-selected` and
`aria-activedescendant` on the currently rendered active row.
ArrowRight expands or moves into children; ArrowLeft collapses or
selects the parent; ArrowUp/Down, Home/End, Enter/Space are supported.
Disabled items cannot be selected or expanded. User labels use
`textContent`, never interpolated HTML.

The pure helpers `flattenTreeList(items,expandedSet)` and
`initialTreeExpansion(items)` are available from the standalone
`@componentui/web/components/tree-list` path.

## InfiniteScroll: request, render, complete

```html
<cu-infinite-scroll id="activity-feed" label="Recent activity"
  has-more threshold="180" style="height:320px">
  <ul id="activity-items"></ul>
</cu-infinite-scroll>
```

```js
const feed=document.querySelector("#activity-feed");
const list=feed.querySelector("#activity-items");
feed.addEventListener("cu-load-more",async event=>{
  try {
    const records=await fetchActivityPage(event.detail.page);
    for(const record of records){
      const li=document.createElement("li");
      li.textContent=record.title;
      list.append(li);
    }
    feed.complete({hasMore:records.length>0});
  } catch(error){
    console.error(error);
    feed.complete({hasMore:true}); // Permit the user to retry.
  }
});
```

The component **does not fetch data itself**. It emits
`cu-load-more` with `{page,reason}`, then sets `loading`.
The application appends slotted elements and calls
`complete({hasMore})` to clear the loading state and indicate
whether more pages exist. Only one request can be pending at a time.
When no more pages remain, the status announces that loading is
complete. `reset()` sets the request page counter to zero and scrolls
to the top; the application must clear/repopulate its own content.

The scroll container uses `IntersectionObserver` with an adjustable
root margin to request the next page when its sentinel approaches the
viewport. A scroll-position fallback is used if the observer API is
unavailable, and a labeled native Load more button remains available
for keyboard and assistive technology use. The region exposes
`aria-busy` during requests and uses a polite live status.

`shouldLoadMore(scrollTop,clientHeight,scrollHeight,threshold)`
is an exported pure helper for near-bottom detection.
InfiniteScroll and VirtualList are **different compositional tools**:
InfiniteScroll loads additional content supplied by the application;
VirtualList limits how many already loaded records have DOM nodes.
This preview does not provide a built-in network provider, retry policy
or variable-height virtualization.

## DataTable: cached derived views

DataTable now memoizes filtered and sorted row arrays until the
relevant inputs change. Changing page or rerendering the table does not
need to repeat the full filter/sort pipeline. Cache invalidation occurs
when consumers assign `rows`, change `columns`, set/clear column
filters, update a bound FilterBar or change sorting. The public
`filteredRows` getter returns a defensive array copy.

For records without explicit `id`, DataTable builds a `WeakMap`
of row objects to their original input index when a new `rows`
array is assigned. This avoids repeated `Array.indexOf` scans
during selection and rendering.

```js
const table=document.querySelector("cu-data-table");
table.columns=[
  {key:"name",label:"Name"},
  {key:"status",label:"Status"},
  {key:"rank",label:"Rank"}
];
table.rows=Array.from({length:10000},(_,index)=>({
  id:"row-"+index,name:"Record "+index,
  status:index%2?"Draft":"Active",rank:index
}));
table.setColumnCondition("status","equals","Active");
table.page=2; // Reuses the derived filtered/sorted view
```

**Important:** If application code mutates an existing row object or
array in place, assign a **new rows array** to tell DataTable to
invalidate its derived views. This follows the same reference-based
update convention used by the React property bridge.

These changes target data processing; the DataTable remains a
paginated native table, **not** a fully virtualized table renderer.
For very large or remote datasets, use server-side paging and validate
browser performance before release.

## Framework adapters and imports

```js
import "@componentui/web/components/tree-list";
import "@componentui/web/components/infinite-scroll";
```

React provides `TreeList` and `InfiniteScroll` wrappers under
`@componentui/react/components`. The `items` and
`expandedValues` array props are passed through the native DOM
property bridge with stable-reference checks. `onCuChange`,
`onCuToggle` and `onCuLoadMore` receive native Custom Events.
Vue and Svelte can use the Custom Elements and their events directly.

## Local acceptance

```bash
git pull origin main
npm run check
npm run check:packages
npm run preview
```

In Playground, exercise the 2,000-file hierarchy, keyboard expansion,
large tree scrolling and disabled items; the incremental 120-record
feed using both automatic and manual loading; and the DataTable
5,000-row/6-row toggle with sorting, filtering, row selection and
page navigation. Review Light/Dark, focus-visible, 200% zoom, mobile
widths, forced colors and screen-reader announcements.

Source-level checks do **not** establish a complete browser and
cross-framework test pass. All components remain experimental until
local package installation and real-browser acceptance are completed.
No GitHub Actions were run.
