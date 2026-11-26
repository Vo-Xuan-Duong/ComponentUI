# Forms and display utilities (preview)

Eleven standalone Web Components are registered and exposed through React wrappers.

- List: semantic list wrapper with ListItem, optional dividers and plain variant. ListItem supports label, description, value, leading/end slots and actionable buttons. cu-select emits value and label. The actionable row uses text content, not arbitrary interactive descendants.
- DescriptionList: items [{label,value}] render semantic dt/dd pairs. Vertical layout is available.
- Kbd: semantic keyboard key with a default slot.
- CodeBlock: plain code text, language label and optional copyable button. Clipboard access is subject to browser permission and secure context; no code execution or syntax highlighting.
- Image: native img, lazy/eager loading, fit, alt and textual error/empty fallback. cu-change reports success/failure.
- ScrollView: compatible subclass of ScrollArea, preserving native scrolling API and events.
- Collapsible: compatible subclass of Disclosure with open/disabled/value and cu-toggle.
- FileUpload: extends FilePicker with a visible selected-file list, loading indicator on the upload button and validated cu-upload request. No automatic HTTP request; the host owns upload transport, authorization, progress, cancellation and errors. File selection remains available unless disabled.
- FormField: visual and semantic field group with label, hint, required marker and error announcement. Supply the actual control's own accessible label and validation attributes; the wrapper does not set validity or name automatically.
- Form: wraps an explicitly supplied light-DOM native form. This preserves native form ownership for slotted controls. Use intercept-submit to suppress browser navigation and listen for cu-submit, whose detail.formData contains native FormData. cu-reset mirrors native reset. Without intercept-submit the normal submission is not prevented.

```html
<cu-form intercept-submit id="profile">
  <form>
    <cu-form-field label="Profile">
      <cu-text-field label="Name" name="name" required></cu-text-field>
    </cu-form-field>
    <cu-button type="submit">Save</cu-button>
  </form>
</cu-form>
```

```js
document.querySelector("#profile").addEventListener("cu-submit", e => {
  console.log(e.detail.formData.get("name"));
});
```

Radio and MenuItem already had implementations and gallery examples, so their
catalog entries are now marked preview. Local browser and installed-package
acceptance are still required. Run npm run check, npm run check:packages,
and npm run preview. Test form ownership, validity, reset, upload request,
clipboard failure, image fallback, focus and responsive layout.
