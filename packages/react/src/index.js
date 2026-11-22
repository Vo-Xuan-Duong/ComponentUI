/**
 * React adapter for native ComponentUI custom elements.
 *
 * Dependency-free factory: pass your application's React instance. This
 * avoids loading React (or touching window/document) during module import.
 * Native cu-* CustomEvents are subscribed with addEventListener so React
 * versions that differ in their custom-event support behave consistently.
 */
export const REACT_TAGS = Object.freeze({
  Button:"cu-button", TextField:"cu-text-field",
  PasswordField:"cu-password-field", FilePicker:"cu-file-picker", AppShell:"cu-app-shell",
  NavigationView:"cu-navigation-view", SettingsPage:"cu-settings-page",
  SettingsGroup:"cu-settings-group", SettingsItem:"cu-settings-item", TextArea:"cu-textarea",
  NumberField:"cu-number-field", SearchBox:"cu-search-box", Checkbox:"cu-checkbox",
  Switch:"cu-switch", Dialog:"cu-dialog", Select:"cu-select",
  Radio:"cu-radio", RadioGroup:"cu-radio-group", Tab:"cu-tab",
  Tabs:"cu-tabs", Tooltip:"cu-tooltip", Popover:"cu-popover",
  DatePicker:"cu-date-picker", Slider:"cu-slider",
  ProgressBar:"cu-progress-bar", Badge:"cu-badge",
  Avatar:"cu-avatar", Menu:"cu-menu", MenuItem:"cu-menu-item",
  Icon:"cu-icon", Card:"cu-card", Divider:"cu-divider",
  Skeleton:"cu-skeleton", Spinner:"cu-spinner", Alert:"cu-alert",
  Breadcrumb:"cu-breadcrumb", BreadcrumbItem:"cu-breadcrumb-item",
  DataTable:"cu-data-table", TreeView:"cu-tree-view", TreeItem:"cu-tree-item",
  ListBox:"cu-listbox", ListOption:"cu-list-option",
  Combobox:"cu-combobox", ComboOption:"cu-combo-option",
  ContextMenu:"cu-context-menu"
});

export const REACT_EVENT_PROPS = Object.freeze({
  onCuPress:"cu-press", onCuInput:"cu-input", onCuChange:"cu-change",
  onCuVisibilityChange:"cu-visibility-change",
  onCuNavigationToggle:"cu-navigation-toggle",
  onCuFilter:"cu-filter",
  onCuSearch:"cu-search",
  onCuOpen:"cu-open", onCuClose:"cu-close", onCuCancel:"cu-cancel",
  onCuSelect:"cu-select", onCuSort:"cu-sort",
  onCuPageChange:"cu-page-change", onCuSelectionChange:"cu-selection-change",
  onCuRowActivate:"cu-row-activate", onCuRowAction:"cu-row-action",
  onCuHeaderAction:"cu-header-action",
  onCuColumnVisibilityChange:"cu-column-visibility-change",
  onCuToggle:"cu-toggle", onCuDismiss:"cu-dismiss"
});

const PROPERTY_MAP = Object.freeze({
  "cu-button":["disabled","loading","type"],
  "cu-text-field":["value","required","disabled"],
  "cu-password-field":["value","required","disabled"],
  "cu-file-picker":["disabled","required","multiple","maxSize"],
  "cu-app-shell":["navigationOpen","withoutNavigation"],
  "cu-navigation-view":["value"],
  "cu-settings-page":["query","searchable"],
  "cu-textarea":["value","required","disabled"],
  "cu-number-field":["value","required","disabled"],
  "cu-search-box":["value","required","disabled"],
  "cu-checkbox":["checked","value","disabled","required"],
  "cu-switch":["checked","value","disabled","required"],
  "cu-dialog":["open"],
  "cu-select":["value","required","disabled"],
  "cu-radio":["disabled","checked"],
  "cu-radio-group":["value","required","disabled"],
  "cu-tab":["disabled"],
  "cu-tabs":["active"],
  "cu-popover":["open"],
  "cu-date-picker":["value","required","disabled"],
  "cu-slider":["value","disabled"],
  "cu-progress-bar":["value","max"],
  "cu-menu":["open"],
  "cu-menu-item":["disabled"],
  "cu-icon":["name"],
  "cu-data-table":["rows","columns","rowActions","headerActions","page"],
  "cu-tree-view":["value"],
  "cu-listbox":["value","disabled","required"],
  "cu-combobox":["value","disabled"]
});

export function subscribeCuEvents(element, handlers = {}) {
  if (!element) return () => {};
  const subscriptions = [];
  for (const [prop, eventName] of Object.entries(REACT_EVENT_PROPS)) {
    const handler = handlers[prop];
    if (typeof handler !== "function") continue;
    element.addEventListener(eventName, handler);
    subscriptions.push([eventName, handler]);
  }
  return () => {
    for (const [eventName, handler] of subscriptions)
      element.removeEventListener(eventName, handler);
  };
}

export function assignCuProperties(element, tagName, props = {}) {
  if (!element) return;
  for (const name of PROPERTY_MAP[tagName] ?? []) {
    if (!Object.hasOwn(props, name) || props[name] === undefined) continue;
    const value = props[name];

    // The native dialog's open getter is read-only. Do not assign to it.
    if (tagName === "cu-dialog" && name === "open") {
      if (value && !element.open) element.showModal();
      else if (!value && element.open) element.close();
      continue;
    }
    if (name in element) {
      if (element[name] !== value) element[name] = value;
    } else if (typeof value === "boolean") {
      element.toggleAttribute(name, value);
    } else if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, String(value));
    }
  }
}

export function createReactComponent(React, tagName) {
  if (!Object.values(REACT_TAGS).includes(tagName))
    throw new RangeError("Unknown ComponentUI tag: " + tagName);
  if (!React?.forwardRef || !React?.useRef || !React?.useEffect ||
      !React?.useImperativeHandle || !React?.createElement)
    throw new TypeError("Pass a React instance (React 18 or newer)");

  const Component = React.forwardRef(function ComponentUIWrapper(props, forwardedRef) {
    const elementRef = React.useRef(null);
    const handlersRef = React.useRef({});
    const handlers = {};
    const nativeProps = { ...props };
    for (const prop of Object.keys(REACT_EVENT_PROPS)) {
      handlers[prop] = props[prop];
      delete nativeProps[prop];
    }
    // React 18 may serialize custom element properties as attributes rather
    // than invoking setters; imperative synchronization supports both 18/19.
    for (const prop of PROPERTY_MAP[tagName] ?? []) delete nativeProps[prop];
    handlersRef.current = handlers;

    React.useImperativeHandle(forwardedRef, () => elementRef.current);
    const useDOMEffect = typeof window === "undefined" || !React.useLayoutEffect
      ? React.useEffect : React.useLayoutEffect;
    useDOMEffect(() => assignCuProperties(elementRef.current, tagName, props));

    React.useEffect(() => {
      const relays = {};
      for (const key of Object.keys(REACT_EVENT_PROPS)) {
        relays[key] = event => handlersRef.current[key]?.(event);
      }
      return subscribeCuEvents(elementRef.current, relays);
    }, []);

    return React.createElement(tagName, {
      ...nativeProps,
      ref: element => { elementRef.current = element; }
    });
  });
  Component.displayName = "ComponentUI(" + tagName + ")";
  return Component;
}

export function createReactComponents(React) {
  return Object.fromEntries(
    Object.entries(REACT_TAGS).map(([name, tag]) =>
      [name, createReactComponent(React, tag)])
  );
}
