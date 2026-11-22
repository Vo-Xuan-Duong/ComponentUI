# Display, layout and feedback components — v0.7.0

This batch adds **six experimental browser Custom Elements** to
`packages/web/src/components/`. They use the Fluent Calm semantic tokens and
existing bundled Lucide SVG icons. They are browser-native Web Components,
not CSS-only samples. **None is production-certified or published.**

## Component API

| Tag | Inputs | Events / methods | Semantics |
| --- | --- | --- | --- |
| `cu-card` | `variant=default\|flat\|outline\|elevated` | header/default/footer slots | Article container; nested controls retain their own interaction |
| `cu-divider` | `orientation=horizontal\|vertical`, `tone=strong`, `decorative` | none | `role=separator`, `aria-orientation`; decorative mode is hidden from AT |
| `cu-skeleton` | `shape=line\|pill\|rect\|circle`, `width`, `height`, `animated=false` | none | Decorative placeholder hidden from AT |
| `cu-spinner` | `size=sm\|md\|lg\|xl`, `label` | none | `role=status`, accessible label and busy state |
| `cu-alert` | `tone=info\|success\|warning\|danger`, `title`, `dismissible` | `dismiss()`, `show()`, `cu-dismiss` | `role=status`, or `role=alert` for danger |
| `cu-breadcrumb` | `label` | declarative `cu-breadcrumb-item` children | Named nav, list, link and current page semantics |

### Registration

Register all browser components:

```js
import "./packages/web/src/components/index.js";
```

Or import individual modules to reduce initialization work:

```js
import "./packages/web/src/components/card.js";
import "./packages/web/src/components/alert.js";
import "./packages/web/src/components/breadcrumb.js";
```

Load `packages/theme/src/tokens.css` for the intended Fluent Calm
Light/Dark, density and accent appearance. Browser-only elements use
Shadow DOM so CSS classes remain encapsulated; CSS variables inherit.

## Card and Divider

```html
<cu-card variant="elevated">
  <h3 slot="header">Project overview</h3>
  <p>12 active projects.</p>
  <cu-divider decorative></cu-divider>
  <p>8 projects have recent updates.</p>
  <cu-button slot="footer" variant="outline">Open workspace</cu-button>
</cu-card>
```

Card has three slots: `header`, default, and `footer`. Empty named slots
collapse automatically. The entire card does **not** become a button: links,
buttons and form controls inside it remain the only interactive targets.

Divider is horizontal by default and uses a uniform neutral 1px line; use
`orientation="vertical"` in a parent flex layout to separate adjacent
items. Add `decorative` when the separation has no semantic meaning.

## Skeleton and Spinner

```html
<div aria-busy="true" aria-label="Loading profile">
  <cu-skeleton shape="circle" width="48" height="48"></cu-skeleton>
  <cu-skeleton width="70%" height="16"></cu-skeleton>
  <cu-skeleton width="95%" height="12"></cu-skeleton>
</div>
<cu-spinner label="Loading profile" size="lg"></cu-spinner>
```

Skeleton placeholders are decorative. Put `aria-busy`, a status or a
description on the *surrounding loading region*. Spinner provides its own
status label. Both stop animation under `prefers-reduced-motion:reduce`;
Skeleton dimensions accept positive CSS lengths or numbers interpreted as px.

## Alert

```html
<cu-alert id="save-alert" tone="success" title="Saved" dismissible>
  All settings are up to date.
</cu-alert>
```

```js
const alert = document.querySelector("#save-alert");
alert.addEventListener("cu-dismiss", e => console.log(e.detail.tone));
alert.dismiss();
alert.show();
```

Tone controls the Lucide icon and a subtle whole-panel tint, not a
left-edge colored stripe. Important information is still communicated through
the title and text, not color alone. `danger` uses an assertive alert role;
other tones are status messages. The close button has an accessible name.

## Breadcrumb

```html
<cu-breadcrumb label="Project location">
  <cu-breadcrumb-item href="/">Home</cu-breadcrumb-item>
  <cu-breadcrumb-item href="/projects">Projects</cu-breadcrumb-item>
  <cu-breadcrumb-item current>Details</cu-breadcrumb-item>
</cu-breadcrumb>
```

The root renders an ordered list inside a named `nav`. Previous items
render as real anchors, and the explicit current item—or the final item
when no `current` attribute is present—has `aria-current="page"`.
Separators use the existing Lucide `chevron-right` icon and are decorative.

Navigation URIs are filtered: document-relative routes, hash links, HTTP(S)
and mailto are allowed. `javascript:`, `data:`, control characters and
protocol-relative `//` URLs are rejected. A rejected URL becomes plain text.
Runtime changes to children and their href/label/current attributes update
the displayed breadcrumb.

`cu-breadcrumb-item` is a declarative helper tag, **not** a seventh standalone
catalog component.

## Cross-framework compatibility

The React factory in `packages/react/` now contains wrappers for the new
six tags and `BreadcrumbItem`; its total is 27 registered wrapper tags.
Vue 3 uses the existing `isComponentUIElement` compiler predicate for every
`cu-*` name. No separate rendering implementation or duplicated CSS is
required in web frameworks.

This does **not** make Web Components usable directly in React Native, Flutter,
Qt or other non-DOM renderers. Those require distinct native renderers.

## Local test / acceptance checklist

1. `npm run check` — parse checks, contracts and catalog counts.
2. `npm run preview` — inspect each card under **Real Web Components**.
3. Light/Dark and compact/comfortable/touch density — verify contrast,
   spacing, surface elevation and no decorative accent strips.
4. At 320px and 200% zoom — verify Card content, Alert controls, Breadcrumb
   wrapping and loading placeholders do not overflow.
5. Keyboard-only — tab to nested Card button, dismiss Alert, navigate
   Breadcrumb links; passive components must not steal focus.
6. Reduced-motion and forced-colors — verify no shimmer/spin animation when
   reduced motion is requested and outlines remain visible.
7. Screen reader — confirm named breadcrumbs and `aria-current`, active
   Alert and Spinner announcements, and decorative Skeleton/Divider behavior.
8. Exercise Alert dismiss/restore and dynamic breadcrumb labels in the
   Playground. Verify no XSS navigation paths are created.

These acceptance checks **must be performed locally by the maintainer**.
The new Node source tests are not browser, visual-regression or screen-reader
certification. No GitHub Actions workflow is introduced.
