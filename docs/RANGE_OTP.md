# RangeSlider and OTPInput (preview)

Both are native form-associated Custom Elements using Fluent Calm tokens.
Import the registry or standalone modules.

```js
import "@componentui/web/components/range-slider";
import "@componentui/web/components/otp-input";
```

## RangeSlider

```html
<cu-range-slider name="budget" label="Budget range"
  min="0" max="1000" step="25" value="[200,750]"></cu-range-slider>
```

The value property is a defensive numeric pair [lower, upper]. The attribute
accepts a JSON array. Bounds are inclusive, values are snapped to positive
step increments from min, and the last selectable step may be below max
when the interval is not divisible by step. The lower thumb cannot exceed
the upper thumb and vice versa. Two native range inputs share a visual track;
both can be focused with Tab and operated using native keyboard controls.
Click the rail to move the closest thumb. Disabled and readonly prevent edits;
readonly retains submitted values. FormData.getAll(name) returns the two
serialized values, lower first. cu-input and cu-change report value and thumb.
Form reset restores the original attribute value (or full range).

## OTPInput

```html
<cu-otp-input name="code" label="Verification code"
  length="6" required></cu-otp-input>
```

A single native text input with inputmode numeric and autocomplete
one-time-code drives the decorative segmented cells. Supports ASCII digits,
leading zeroes, paste, selection, deletion, keyboard editing and mobile
autofill when the browser supports it. Length is 1–12 (default 6).
A nonempty incomplete code is invalid; an empty optional code is valid.
The value remains a string. cu-input and cu-change expose value and complete.
Do not log or persist real verification codes. This UI does not send codes,
verify identities, or authenticate users. Those operations belong to the
application backend. FormData and reset use ElementInternals.

## Integration and acceptance

React wrappers: RangeSlider and OTPInput from @componentui/react/components.
Vue/Svelte use existing model bindings with property value and cu-change
(or cu-input for live updates). Electron/Tauri use the web registry.
Run npm run check, npm run check:packages and npm run preview.
Test coincident thumbs, fractional steps, keyboard operation, touch dragging,
paste, selection, screen readers, mobile autofill, disabled fieldset,
readonly, reset, dark mode and narrow viewports. Preview status remains
until browser and installed-package acceptance is completed.
