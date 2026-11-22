# Select — Fluent Calm UI and interaction checks (v0.4.1)

This component uses a fully styled popup instead of Chrome/Windows native select dropdown. The original markup with `<option>` and `<optgroup>` remains supported.

## Local launch

```bash
git pull origin main
npm run check
npm run preview
```

Open `http://127.0.0.1:4173/apps/playground-web/`, then scroll to **Real Web Components → Select & RadioGroup**.

## Manual acceptance checklist

- [ ] Light/Dark: trigger and popup background, text and option hover match Fluent Calm theme.
- [ ] The `Web` optgroup label appears visually separate from React / Next.js, Vue / Nuxt, and Svelte options.
- [ ] Selecting an option updates the trigger text and shows a check mark. Previously selected value persists on reopen.
- [ ] The focused option uses a **subtle tint**, not Chrome's bright blue native selection bar.
- [ ] ArrowDown / ArrowUp / Home / End move active highlight; Enter/Space commit; Escape closes without changing value.
- [ ] Type `r` to highlight React; Tab closes without changing the value.
- [ ] Disabled options cannot be selected; required form validation rejects the placeholder (empty value).
- [ ] FormData includes `framework` only once after selection; reset restores the initial value.
- [ ] Changing light-DOM `option` attributes or replacing options updates the dropdown.
- [ ] Resize browser or open near bottom of page: popup can flip upward; the list scrolls without extending beyond the viewport.
- [ ] At 320px width, 200% zoom and high-contrast mode the list remains usable and legible.
- [ ] Screen readers (NVDA/VoiceOver) announce combobox name, expanded state, highlighted option and selection.
- [ ] Focus ring is visible in keyboard mode; Escape/outside clicks dismiss reliably.

These are manual checks for the maintainer. Source-level tests do not establish WCAG conformance or cross-browser certification.

ARIA guidance: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Hover / active-row visibility — v0.4.2

- Pointer hover on an enabled option uses a 20% accent-tinted background and a slightly bolder option label (no decorative leading stripe), visible in both Light/Dark modes.
- Moving the mouse/pen updates the active option and `aria-activedescendant`. Keyboard ArrowUp/Down use the **same** active styling.
- The chosen option is indicated separately by a checkmark and `aria-selected=true`; hovering another row does **not** change the submitted value.
- Disabled options never receive active or hover treatment.
- The highlight has a forced-colors outline fallback and respects reduced-motion preferences.

Manual verification: open the Select preview, hover React, Vue and Svelte in turn; the accent highlight should follow the pointer without scrolling. Press ArrowUp/Down; the same indicator should move. Verify the checkmark remains on the committed value until a click or Enter.

## Updated selection styling — v0.4.3

Removed the **leading accent stripe** from hovered/keyboard-active Select options. Hover still uses a 20% accent-tinted *full-row background* and slightly stronger text weight. Selected values retain their check mark, and disabled options are excluded. Vertical Tabs also use a full-row active background rather than a left-edge bar. Inline InfoBars use a uniform 1px border instead of an accent left border.

## Full Playground migration — v0.8.1

A repository audit found **five** native OS dropdowns still present in
`apps/playground-web/index.html`, despite the custom Select implementation
being available. All five are now replaced with the same `<cu-select>`:

| UI location | Element id / name | Behavioral integration |
| --- | --- | --- |
| Top toolbar Theme | `#theme-select` | `cu-change` updates theme; persisted value is restored |
| Top toolbar Density | `#density-select` | `cu-change` updates density and control-height readout |
| Forms → Project type | `[name=project]` | Native form association and reset, explicit initial Web application |
| Catalog → Category | `#catalog-category` | Filter updates via `cu-change`; options are appended from catalog JSON |
| Catalog → Priority | `#catalog-priority` | Filter updates via `cu-change`; initial option shows all priorities |

The category dropdown exposed an additional bug: the `MutationObserver`
previously ignored direct `childList` changes on the `cu-select` host.
It now detects dynamically inserted options on the host and re-renders
the listbox correctly. Programmatic `.value` assignments still update
the rendered selection. Option checkmarks now use Lucide `check` SVGs.

**Design rule:** in the active Playground, use `<cu-select>` for
single-choice dropdowns; don't use `<select class="cu-select">`.
Legacy native-select CSS tokens may still exist as a compatibility style
for standalone HTML references, but the Playground no longer renders
OS-native `<select>` dropdowns.

A dedicated regression source test verifies that all five controls
use Custom Elements, that the correct `cu-change` listeners exist,
that no native select tags remain, and that the dynamic category
options are supported.

### Manual verification

1. Run `npm run check` and `npm run preview`.
2. Open **Forms & inputs → Project type** and confirm the popup has
   the same hover background and selected checkmark as **Real Web Components → Select**.
3. Change Project type, submit the sample form and press Reset:
   the value should return to Web application.
4. Change Theme through System/Light/Dark and Density through
   Compact/Comfortable/Touch; confirm visual preferences still apply
   and survive a page reload.
5. Under **Component catalog**, choose a Category loaded dynamically
   from the JSON catalog and a Priority. Confirm filtered counts are correct.
6. Use ArrowUp/Down, Home/End, Enter/Space, Escape and Tab; verify
   disabled options and screen-reader focus, in Dark and Light mode.
7. Resize to narrow screens and verify popup position and clipping.

As before, browser testing and accessibility sign-off are performed locally
by the maintainer; no GitHub Actions are created or executed.
