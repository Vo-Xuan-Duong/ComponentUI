# ComponentUI native-first previews

This milestone implements reusable **DOM-based progressive enhancements** in `packages/web/src/interactions.js` and CSS primitives in `packages/theme/src/components.css`. They are **developer previews**, not yet fully accessible, browser-tested production components or published npm releases.

## Implemented in the local Playground

| Preview | Underlying element | Behavior |
| --- | --- | --- |
| Accordion | `details` / `summary` | Expand/collapse using native keyboard behavior |
| Tooltip | CSS + `aria-describedby` | Visible on hover and focus; supplemental content |
| Popover | Button + panel | Toggle, outside click and Escape dismiss |
| Menu | `role=menu` and menuitems | ArrowUp/Down, Home/End, Escape and click selection |
| Drawer | Native `dialog.showModal()` | Modal focus, Escape, submit/close |
| Empty State | Semantic HTML | Static composed layout with call to action |
| Pagination | Buttons and result list | Safe DOM-rendered pages, active page and disabled bounds |
| Command Palette | Native `dialog` with combobox/listbox | Ctrl/⌘ K, typeahead search, ArrowUp/Down, Enter, Escape |

## Importing reusable interactions

```js
import {
  enhanceMenu, enhancePopover, enhanceDialogTrigger,
  enhancePagination, enhanceCommandPalette, paginate, filterCommands
} from "./packages/web/src/interactions.js";
```

Typical usage with semantic HTML:

```html
<div data-cu-popover>
  <button type="button" aria-controls="info" aria-expanded="false" data-cu-popover-trigger>
    Show information
  </button>
  <div id="info" data-cu-popover-panel hidden>Information</div>
</div>
```

```js
enhancePopover(document.querySelector("[data-cu-popover]"));
```

The `enhanceMenu` and `enhancePopover` functions return cleanup callbacks for component lifecycle integration. `enhanceCommandPalette` returns open/close/destroy methods. `enhancePagination` returns an object with `goTo`, `refresh` and `page`.

**Important limitations:** no automated cross-browser/visual/axe tests yet, SSR behavior not validated, and no React/Vue adapters or final `<cu-*>` Web Components exist yet. For menus and commands, provide accessible names and application-specific actions; test with a keyboard and screen reader before production use.

## Sidebar adjustment

The sidebar intentionally uses **text-only links**, without the previous placeholder symbols or the left-edge active indicator; the active item is communicated through background contrast and weight.

## Testing locally

```bash
npm run check
npm run preview
```

Do not add or run GitHub Actions workflows for this repository.
