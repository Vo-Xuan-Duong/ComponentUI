# Layout foundation, RichTextEditor and ChartContainer (preview)

All eight components are available from the web registry and standalone component subpaths, with React wrappers and native property/slot binding for Vue and Svelte.

## Layout

Container limits content width (sm 640px, md 900px, lg 1200px, full unlimited).
Use CSS custom properties --cu-container-max-width and --cu-container-padding
for custom widths and padding (the named sizes override the default maximum).
Stack defaults to vertical; orientation="horizontal" selects row layout.
Flex accepts direction="row|column|row-reverse|column-reverse".
Both support wrap, align, justify and gap (0–8, steps of four pixels).
Grid defaults to responsive auto-fit using --cu-grid-min-item-width (200px);
count="1" through "12" sets an explicit column count. Gap is configurable.
Surface supports default, flat and elevated variants and size-based padding.
PageHeader has title/description attributes and title, description, breadcrumbs
and actions slots; use it for the main page heading.

```html
<cu-container size="full">
  <cu-page-header title="Projects" description="Manage your workspace"></cu-page-header>
  <cu-grid gap="3" style="--cu-grid-min-item-width:200px">
    <cu-surface><cu-stack gap="2">Project A</cu-stack></cu-surface>
    <cu-surface variant="elevated">Project B</cu-surface>
  </cu-grid>
</cu-container>
```

## RichTextEditor

A form-associated contenteditable control with bold, italic, underline,
ordered/unordered lists and clear formatting. value is restricted HTML,
not Markdown. The sanitizer rebuilds an allowlist of basic text and list
elements, strips all attributes and discards executable/embedded elements.
Paste is plain text; drop is disabled. The browser's legacy execCommand
formatting API is used for this preview and needs cross-browser acceptance.
The editor is not a full document engine; no tables, images, links, collaborative
editing, file uploads or arbitrary HTML embeds. Applications must validate
and sanitize submitted content at their own trust boundary. Required,
readonly, disabled, form reset and cu-input/cu-change are supported.

## ChartContainer

```html
<cu-chart-container id="chart" title="Revenue" chart-type="bar" show-table></cu-chart-container>
```

```js
document.querySelector("#chart").items = [
  {label:"Jan",value:20},
  {label:"Feb",value:-5},
  {label:"Mar",value:32}
];
```

Single-series bar or line chart, up to 100 finite numeric points.
Zero baseline and negative values are supported. Uses responsive SVG,
native SVG titles and a semantic data table in a disclosure for screen
reader and keyboard access. show-table opens the disclosure. No external
chart library, multi-series charts, zoom, pan, stacked charts or live
streaming. The supplied order is preserved.

## Acceptance

Run npm run check, npm run check:packages and npm run preview locally.
Verify keyboard and mouse formatting, IME, form validation, sanitized HTML,
responsive slotted layout, narrow screens, contrast and chart data table.
This milestone also reflects readonly on six previous form controls and
min/max/step on RangeSlider. Browser and installed-package acceptance
remain pending.
