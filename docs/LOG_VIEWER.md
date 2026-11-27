# LogViewer (preview)

A general-purpose, client-side log inspection component. It composes the existing SearchBox, Select, Button, VirtualList, EmptyState and Icon; no external dependency or network request is required.

```html
<cu-log-viewer id="logs" label="Application logs"></cu-log-viewer>
<script type="module">
  import "@componentui/web/components/log-viewer";
  const logs = document.getElementById("logs");
  logs.items = [{id:"1", level:"info", source:"App", message:"Ready"}];
  logs.addEventListener("cu-select", event => console.log(event.detail.item));
</script>
```

Use `items` as an array of unique string IDs and string messages. Optional fields: level (debug/info/warn/error), timestamp and source. Invalid rows and duplicate IDs are ignored; invalid levels become info. Search is case- and accent-insensitive and matches all whitespace-separated terms. Set `query` and `level` to filter programmatically. `visibleItems` returns defensive copies. `resetFilters()` clears both filters. `cu-filter` reports query, level, visible and total counts; `cu-select` reports id, value and the selected item. The underlying VirtualList handles keyboard selection and renders a bounded visible window. Detail text is rendered as text, not HTML.

React exposes LogViewer with items/query/level properties and onCuFilter/onCuSelect events; Vue and Svelte can use the same registered custom element and property binding. Styling inherits shared theme tokens; `--cu-log-height` sets the list height.

This preview does not implement live log streaming, persistence, export, server-side filtering or automatic follow-tail. The application owns data ingestion and retention. Browser and accessibility acceptance is still required.
