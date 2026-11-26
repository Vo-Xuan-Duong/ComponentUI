# Overlay quality milestone

The second quality milestone improves Select, Combobox, Menu, ContextMenu,
Popover, Dialog and Drawer. These remain **experimental previews**.
Existing public component tags, properties, events and package imports
are retained. No new external runtime dependency is required.

## Shared positioning and focus

The private `packages/web/src/components/_overlay.js` module provides
viewport geometry, overlay stack registration, deep Shadow DOM focus
capture, safe trigger focus restoration and viewport listener cleanup.

Select, Combobox, Menu and Popover now choose above/below placement
according to available space and clamp their width and horizontal position.
Select and Combobox match their anchor width when space permits.
Long panels receive a maximum height based on available space and can
scroll. Layout and visual viewport resize/scroll events refresh placement.
Popover preserves visible overflow for nested overlays when its own
content fits.

ContextMenu retains its existing fixed-position geometry, but shares
the nested-overlay Escape stack and safe focus restoration.

**Limitation:** these anchored popups are still positioned inside their
component's containing block. They cannot reliably escape a clipping
ancestor (such as an overflow-hidden or constrained scroll container)
or every stacking context. A top-layer/portal positioning architecture,
transformed ancestor support and comprehensive RTL collision testing
remain future work.

## Interaction and accessibility

- Escape targets the topmost registered anchored overlay. Closing a
  nested menu or select must not also dismiss its parent popover.
- Outside pointer actions do not force focus back to the old trigger.
- Menu and ContextMenu restore trigger focus on Escape and Tab before
  normal keyboard navigation continues. Menu preserves its focused
  item across declarative item changes where possible.
- Combobox now applies the actual option class to rendered rows so
  hover and keyboard-active styling work. Its input label is associated
  with the internal input, and closed state clears active-descendant
  metadata.
- Popover opened by its trigger moves focus to its panel, while
  programmatic show retains its existing contract.
- Dialog and Drawer capture focus through nested open Shadow DOM,
  reset returnValue on opening, and restore the trigger before
  notifying consumers of the close. A queued close after reopening
  does not close the newly opened modal.
- Dialog hides an empty action footer and uses responsive height
  constraints; overlay entry animation respects reduced motion.
- No decorative left-edge selection bars have been added.

## Local review

In the Playground, open **Quality Lab → Nested overlay test** and
exercise the nested Select and Menu. Open a child then press Escape:
only that child should close. Press Escape again: the parent should
close and return focus to its trigger. Repeat using pointer, keyboard,
and touch, and check behavior near viewport boundaries.

Also test every overlay under Light/Dark/System, all densities and
accents, reduced motion, forced colors, 200% zoom, mobile widths and
the mobile on-screen keyboard. Test long menus, disabled items,
dynamic options, tab navigation, outside clicks, modal reopening,
form state, and disconnected triggers.

Run locally:

```sh
npm run check
npm run check:packages
npm run preview
```

The regression file `tests/overlay-quality.test.mjs` covers geometry,
stack order, deep focus, watcher cleanup, Combobox Escape and source
integration. Eleven cases passed in an isolated JavaScript harness.
That is not a full Node suite, browser, visual or assistive technology
acceptance result. No GitHub Actions were run.
