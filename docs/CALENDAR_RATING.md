# Calendar and Rating (preview)

Both controls are dependency-free, form-associated Custom Elements using Fluent Calm
theme tokens. They support standalone imports and the React, Vue and Svelte
adapters; Electron and Tauri use the same browser implementation.

```js
import "@componentui/web/components/calendar";
import "@componentui/web/components/rating";
```

```html
<cu-calendar name="appointment" value="2026-11-26"
  label="Appointment date" week-start="1" locale="vi-VN"
  min="2020-01-01" max="2035-12-31" required></cu-calendar>
<cu-rating name="rating" label="Experience" value="4" max="5"></cu-rating>
```

## Calendar

- ISO date value (YYYY-MM-DD), no timezone conversion of selected date.
- Localized Gregorian month/weekday/day labels; week-start 0 (Sunday) through 6.
- Six-row inline month grid, previous/next month controls, current-day outline,
  selected date, adjacent-month dates and unavailable dates.
- Arrow keys move a day or week; Home/End move within the week;
  PageUp/PageDown move a month, Shift+PageUp/PageDown move a year.
  Enter/Space select using the native button. Movement does not commit a value.
- min/max constrain selection; required enforces nonempty selection.
- disabled prevents interaction and submission; readonly permits navigation but
  prevents changes. Form reset restores the original value.
- cu-input and cu-change emit detail.value (string) only when selection changes.
- calendarDays and moveCalendarDate are exported for pure date arithmetic.

Calendar is inline only in this milestone; DatePicker and DateRangePicker
still use native date input popups. Calendar is single-date, not a range selector.

## Rating

- Numeric integer value, 0 (not rated) through max, with max limited to 1–10.
- Native radio buttons with accessible labels and keyboard behavior, visual
  stars rendered through the shared cu-icon Lucide subset.
- Selected stars fill with the theme accent; optional ratings can be cleared.
- required, disabled, readonly, FormData and reset are supported. An unset
  rating is omitted from FormData, while positive ratings serialize as strings.
- cu-input and cu-change emit detail.value (number).
- normalizeRating is available for clamping and rounding inputs.

React wrappers: Calendar and Rating from @componentui/react/components.
Vue v-cu-model and Svelte cuModel use value and cu-change.

## Local acceptance

Run npm run check, npm run check:packages and npm run preview. Test Gregorian
leap years, minimum and maximum dates, keyboard focus at month/year changes,
readonly navigation, required and reset states, radio keyboard navigation,
dark mode, forced colors, responsive sizes and FormData. Browser, screen-reader,
and installed-package integration remain unverified.
