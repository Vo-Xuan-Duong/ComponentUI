# Statistic and LoadingOverlay (preview)

Both use Fluent Calm theme tokens and standalone custom-element entrypoints.

```js
import "@componentui/web/components/statistic";
import "@componentui/web/components/loading-overlay";
```

## Statistic

```html
<cu-statistic id="revenue" label="Revenue" value="48250" previous="43200"
  format="currency" currency="USD" locale="en-US" precision="0"
  description="vs. previous period"></cu-statistic>
```

```js
document.querySelector("#revenue").series = [31000,36500,34100,40900,43200,48250];
```

The value and previous properties accept finite numbers or null. A missing
value displays an em dash, not zero. Formatting uses Intl.NumberFormat:
decimal, currency and percent (0.25 means 25%), locale, precision (0–6),
compact notation, optional prefix and suffix. Invalid locale or currency
falls back to English decimal formatting. Trend is calculated as
(current - previous) / abs(previous) when previous is nonzero. A zero
baseline displays the absolute difference rather than infinity.
trend-tone="inverse" marks decreases as favorable; neutral suppresses
success/danger coloring. Optional series of 2–500 finite numbers renders
a decorative SVG sparkline; it is not an interactive or labeled chart.
The application must provide an accessible description if the series
conveys information beyond the displayed values. No chart dependency.
Supports plain variant, compact size and shared icon names.

## LoadingOverlay

```html
<cu-loading-overlay id="busy" label="Loading projects">
  <cu-button>Workspace action</cu-button>
</cu-loading-overlay>
```

```js
const overlay = document.querySelector("#busy");
overlay.show();
try {
  await loadProjects();
} finally {
  overlay.hide();
}
```

Regional mode preserves layout, blocks pointer and keyboard interaction
through an inert content region, and sets aria-busy on the content.
The status announcement is outside the busy region. If focus was inside
the region, it moves to the overlay and returns when appropriate.
Set fullscreen to use a native modal dialog and block background
interaction. Escape does not cancel the loading operation. Use this
mode only for short, genuinely blocking work, and guarantee cleanup
on errors. The component does not start or cancel requests, impose
timeouts, or coordinate concurrent tasks; the application owns loading
state. cu-change reports activation via detail.loading.

## Frameworks and acceptance

React exposes Statistic and LoadingOverlay. Vue/Svelte use DOM property
bindings; Electron/Tauri reuse the web implementation.
Run npm run check, npm run check:packages and npm run preview.
Verify localized values, zero baselines, flat sparklines, regional
focus behavior, fullscreen modal interactions, dark mode, reduced motion,
screen-reader announcements and narrow viewports. Preview status does not
imply production certification.
