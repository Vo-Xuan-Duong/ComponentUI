# Date and time controls (preview)

TimePicker and DateRangePicker use Fluent Calm field styling and native browser
date/time inputs, not custom calendar popups. No timezone conversion is performed.
Import all custom elements or the individual module:

```js
import "@componentui/web/components/time-picker";
import "@componentui/web/components/date-range-picker";
```

```html
<form>
  <cu-time-picker name="time" label="Meeting time" value="09:00"
    min="08:00" max="18:00" step="900" required></cu-time-picker>
  <cu-date-range-picker name="period" label="Project period"
    value="2026-11-26/2026-12-04" required></cu-date-range-picker>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
```

| API | TimePicker | DateRangePicker |
| --- | --- | --- |
| value | HH:mm, optional seconds | YYYY-MM-DD/YYYY-MM-DD (inclusive) |
| min / max | time | ISO date |
| step | seconds or any | not applicable |
| label, hint, error, name | supported | supported |
| required, disabled, readonly | supported | supported |
| start-label, end-label | not applicable | customize each input label |
| start, end properties | not applicable | individual ISO date strings |

Both emit cu-input and cu-change with detail.value. DateRangePicker also
provides detail.start and detail.end. A partially entered range produces a
string with one empty operand and is invalid; an entirely empty optional
range is valid. Invalid calendar dates are rejected by the native inputs
and helper. Reversed ranges and out-of-bound dates are invalid. Disabled
controls are omitted from FormData; readonly values are retained.

React 18/19:

```jsx
import "@componentui/web/components";
import { TimePicker, DateRangePicker } from "@componentui/react/components";

<TimePicker label="Meeting" value={time}
  onCuChange={e => setTime(String(e.detail.value ?? ""))} />
<DateRangePicker label="Period" value={period}
  onCuChange={e => setPeriod(String(e.detail.value ?? ""))} />
```

Vue: use the existing v-cu-model directive with property value and event
cu-change; Svelte: use the cuModel action with the same event. Electron
and Tauri can use the registered elements directly. No new runtime
dependency or framework-specific implementation is required.

## Local acceptance
Run npm run check, npm run check:packages and npm run preview. Try keyboard
and pointer operation, reset, disabled fieldset, readonly, required/empty,
reversed ranges, leap dates, min/max, step mismatch and FormData.
Check Light/Dark and narrow viewports. Native calendar/time popups vary by
browser and OS. Real browser, framework and screen-reader tests remain
required before production readiness.
