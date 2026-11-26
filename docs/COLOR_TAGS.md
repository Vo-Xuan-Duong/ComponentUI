# ColorPicker and TagInput (preview)

Both are native form-associated custom elements with Fluent Calm theme tokens.
Import the full registry or individual component entrypoints.

```js
import "@componentui/web/components/color-picker";
import "@componentui/web/components/tag-input";
```

## ColorPicker

```html
<cu-color-picker name="accent" label="Accent color" value="#0067c0"
  alpha format="hex" required></cu-color-picker>
```

Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA and comma-separated RGB/RGBA
or HSL/HSLA functions. RGB percentages are supported. HSL hue uses degrees.
Out-of-range channels are clamped. Named colors and modern space-separated
CSS color functions are not supported. Pure parseColor and formatColor
helpers are exported. The format attribute controls the text representation;
the value property and FormData use lowercase canonical #rrggbb, or
#rrggbbaa when alpha is enabled. Switching formats does not change the
submitted representation. With alpha disabled, opacity is discarded.
The UI includes a preview, a native system color chooser, eight presets,
a text field, format selector and optional opacity slider.
An invalid draft is not submitted as a stale valid color; required,
custom error, reset, disabled and readonly are supported. cu-input and
cu-change expose detail.value. A custom saturation/hue canvas is not included.

## TagInput

```html
<cu-tag-input name="tags" label="Tags" value='["Design","Frontend"]'
  max-tags="5" max-tag-length="30" required></cu-tag-input>
```

Value is a defensive string array; the value attribute is a JSON array.
Enter, comma or the add button commits the draft. Empty tags and duplicate
tags are rejected (case-insensitive by default); case-sensitive is optional.
Paste comma/newline separated tags to add in bulk. Limits skip overlong tags
and cap the number of tags. Backspace on empty input removes the last tag;
each tag has a named removal button. Draft text is not part of the value
until committed. FormData.getAll(name) returns the tags as repeated entries.
The component exposes addTag and removeTag; each returns whether a change
was made. cu-input and cu-change include value and values arrays.
Required, readonly, disabled, custom error and form reset are supported.

## Integration

React: ColorPicker and TagInput from @componentui/react/components.
Vue/Svelte: existing model adapters with value and cu-change. Electron/Tauri:
web registry. No additional runtime dependencies.

Run npm run check, npm run check:packages and npm run preview locally.
Verify alpha rounding, format switching, native color chooser, invalid input,
tag paste, limits, keyboard navigation, IME, readonly, reset, FormData, dark
mode and touch layout. Components remain preview pending browser and
installed-package acceptance.
