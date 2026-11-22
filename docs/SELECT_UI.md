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

- Pointer hover on an enabled option uses a 20% accent-tinted background and a clear 3px inset accent stripe at the start of the row, visible in both Light/Dark modes.
- Moving the mouse/pen updates the active option and `aria-activedescendant`. Keyboard ArrowUp/Down use the **same** active styling.
- The chosen option is indicated separately by a checkmark and `aria-selected=true`; hovering another row does **not** change the submitted value.
- Disabled options never receive active or hover treatment.
- The highlight has a forced-colors outline fallback and respects reduced-motion preferences.

Manual verification: open the Select preview, hover React, Vue and Svelte in turn; the accent highlight should follow the pointer without scrolling. Press ArrowUp/Down; the same indicator should move. Verify the checkmark remains on the committed value until a click or Enter.
