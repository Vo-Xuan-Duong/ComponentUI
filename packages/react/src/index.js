/**
 * React adapter for native ComponentUI custom elements.
 *
 * Dependency-free factory: pass your application's React instance. This
 * avoids loading React (or touching window/document) during module import.
 * Native cu-* CustomEvents are subscribed with addEventListener so React
 * versions that differ in their custom-event support behave consistently.
 */
export const REACT_TAGS = Object.freeze({
  Button:"cu-button", IconButton:"cu-icon-button", ToggleButtonGroup:"cu-toggle-button-group", Toolbar:"cu-toolbar", CommandBar:"cu-command-bar", SplitButton:"cu-split-button", Stepper:"cu-stepper", InfoBar:"cu-info-bar", TextField:"cu-text-field",
  PasswordField:"cu-password-field", FilePicker:"cu-file-picker", AppShell:"cu-app-shell",
  NavigationView:"cu-navigation-view", SettingsPage:"cu-settings-page",
  SettingsGroup:"cu-settings-group", SettingsItem:"cu-settings-item", TextArea:"cu-textarea",
  NumberField:"cu-number-field", SearchBox:"cu-search-box", Checkbox:"cu-checkbox",
  Switch:"cu-switch", Dialog:"cu-dialog", Drawer:"cu-drawer", Accordion:"cu-accordion", AccordionItem:"cu-accordion-item", Disclosure:"cu-disclosure", Pagination:"cu-pagination", Select:"cu-select", MultiSelect:"cu-multi-select", Toast:"cu-toast", AutoComplete:"cu-autocomplete", NotificationCenter:"cu-notification-center",
  Radio:"cu-radio", RadioGroup:"cu-radio-group", Tab:"cu-tab",
  Tabs:"cu-tabs", Tooltip:"cu-tooltip", Popover:"cu-popover",
  DatePicker:"cu-date-picker", TimePicker:"cu-time-picker", DateRangePicker:"cu-date-range-picker", Calendar:"cu-calendar", Rating:"cu-rating", Slider:"cu-slider", RangeSlider:"cu-range-slider", OTPInput:"cu-otp-input", ColorPicker:"cu-color-picker", TagInput:"cu-tag-input", CommandPalette:"cu-command-palette", EmptyState:"cu-empty-state", Statistic:"cu-statistic", LoadingOverlay:"cu-loading-overlay", ScrollArea:"cu-scroll-area", AvatarGroup:"cu-avatar-group", SegmentedControl:"cu-segmented-control", Timeline:"cu-timeline", Carousel:"cu-carousel", PropertyGrid:"cu-property-grid", FileExplorer:"cu-file-explorer", DataGrid:"cu-data-grid", TitleBar:"cu-title-bar", WindowControls:"cu-window-controls", StatusBar:"cu-status-bar", DockLayout:"cu-dock-layout", KanbanBoard:"cu-kanban-board", ChartContainer:"cu-chart-container", RichTextEditor:"cu-rich-text-editor", PageHeader:"cu-page-header", Surface:"cu-surface", Flex:"cu-flex", Grid:"cu-grid", Stack:"cu-stack", Container:"cu-container",
  ProgressBar:"cu-progress-bar", ProgressRing:"cu-progress-ring", Badge:"cu-badge", Chip:"cu-chip", Tag:"cu-tag",
  Avatar:"cu-avatar", Menu:"cu-menu", MenuItem:"cu-menu-item",
  Icon:"cu-icon", Card:"cu-card", Divider:"cu-divider",
  Skeleton:"cu-skeleton", Spinner:"cu-spinner", Alert:"cu-alert",
  Breadcrumb:"cu-breadcrumb", BreadcrumbItem:"cu-breadcrumb-item",
  DataTable:"cu-data-table", TreeView:"cu-tree-view", TreeList:"cu-tree-list", InfiniteScroll:"cu-infinite-scroll", TreeItem:"cu-tree-item",
  ListBox:"cu-listbox", ListOption:"cu-list-option",
  Combobox:"cu-combobox", ComboOption:"cu-combo-option",
  ContextMenu:"cu-context-menu", SplitView:"cu-split-view", VirtualList:"cu-virtual-list", Splitter:"cu-splitter", ResizablePanel:"cu-resizable-panel", FilterBar:"cu-filter-bar", DataFilter:"cu-data-filter"
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
  onCuFilterChange:"cu-filter-change",
  onCuLoadMore:"cu-load-more",
  onCuRetry:"cu-retry", onCuScroll:"cu-scroll", onCuCellChange:"cu-cell-change", onCuMove:"cu-move", onCuWindowAction:"cu-window-action", onCuWindowDrag:"cu-window-drag",
  onCuToggle:"cu-toggle", onCuDismiss:"cu-dismiss", onCuRemove:"cu-remove", onCuAction:"cu-action", onCuResize:"cu-resize"
});

const PROPERTY_MAP = Object.freeze({
  "cu-button":["disabled","loading","type"],
  "cu-icon-button":["name","disabled","loading","pressed","toggle"],
  "cu-toggle-button-group":["items","value","multiple","disabled"],
  "cu-command-bar":["commands","maxVisible","disabled"],
  "cu-split-button":["actions","disabled","loading"],
  "cu-stepper":["steps","value","linear"],
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
  "cu-drawer":["open","dismissible"],
  "cu-accordion":["values","value","multiple"],
  "cu-accordion-item":["open","disabled","value"],
  "cu-disclosure":["open","disabled","value"],
  "cu-pagination":["page","pageSize","total"],
  "cu-split-view":["position","collapsible","collapsed"],
  "cu-virtual-list":["items","itemHeight","overscan","labelKey","selectedIndex"],
  "cu-splitter":["position","min","max","disabled"],
  "cu-resizable-panel":["resizable"],
  "cu-filter-bar":["query"],
  "cu-data-filter":["field","operator","value","disabled"],
  "cu-select":["value","required","disabled"],
  "cu-multi-select":["items","value","required","disabled","readonly"],
  "cu-autocomplete":["items","value","required","disabled","readonly","loading"],
  "cu-notification-center":["items"],
  "cu-radio":["disabled","checked"],
  "cu-radio-group":["value","required","disabled"],
  "cu-tab":["disabled"],
  "cu-tabs":["active"],
  "cu-popover":["open"],
  "cu-date-picker":["value","required","disabled"],
  "cu-time-picker":["value","required","disabled","readonly"],
  "cu-date-range-picker":["value","required","disabled","readonly"],
  "cu-calendar":["value","required","disabled","readonly"],
  "cu-rating":["max","value","required","disabled","readonly"],
  "cu-slider":["value","disabled"],
  "cu-range-slider":["min","max","step","value","disabled","readonly"],
  "cu-otp-input":["length","value","required","disabled","readonly"],
  "cu-color-picker":["alpha","value","required","disabled","readonly"],
  "cu-tag-input":["value","required","disabled","readonly"],
  "cu-command-palette":["commands","open"],
  "cu-statistic":["value","previous","series"],
  "cu-loading-overlay":["fullscreen","loading"],
  "cu-avatar-group":["items","maxVisible","expanded"],
  "cu-segmented-control":["items","value","disabled","readonly","required"],
  "cu-timeline":["items"],
  "cu-carousel":["items","active","loop"],
  "cu-property-grid":["items","query","disabled","readonly"],
  "cu-progress-bar":["value","max"],
  "cu-progress-ring":["value","max"],
  "cu-chip":["value","selected","selectable","removable","disabled"],
  "cu-menu":["open"],
  "cu-menu-item":["disabled"],
  "cu-icon":["name"],
  "cu-data-table":["rows","columns","rowActions","headerActions","columnFilters","page","loading","error"],
  "cu-data-grid":["rows","columns","rowActions","headerActions","columnFilters","page","loading","error","readonly"],
  "cu-file-explorer":["items","folderId","query","actions"],
  "cu-title-bar":["maximized","draggableRegion"],
  "cu-window-controls":["maximized","disabled","minimizable","maximizable","closable"],
  "cu-status-bar":["items"],
  "cu-dock-layout":["layout","disabled"],
  "cu-kanban-board":["lanes","items","readonly"],
  "cu-rich-text-editor":["value","disabled","readonly","required"],
  "cu-chart-container":["items"],
  "cu-tree-view":["value"],
  "cu-tree-list":["items","value","expandedValues","itemHeight","overscan"],
  "cu-infinite-scroll":["hasMore","loading","threshold","error"],
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

// DataTable exposes a defensive snapshot from columnFilters; compare incoming
// React object references instead of comparing that snapshot to props.
const lastControlledFilters=new WeakMap();
const lastControlledArrays=new WeakMap();

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
      if (((tagName==="cu-split-button"||tagName==="cu-file-explorer")&&name==="actions") ||
          (tagName==="cu-stepper"&&name==="steps") ||
          (tagName==="cu-multi-select"&&(name==="items"||name==="value")) ||
          ((tagName==="cu-range-slider"||tagName==="cu-tag-input")&&name==="value") ||
          ((tagName==="cu-autocomplete"||tagName==="cu-notification-center")&&name==="items") ||
          ((tagName==="cu-command-bar"||tagName==="cu-command-palette")&&name==="commands") ||
          (tagName==="cu-statistic"&&name==="series") ||
          (tagName==="cu-dock-layout"&&name==="layout") ||
          (tagName==="cu-kanban-board"&&name==="lanes") ||
          (tagName==="cu-data-grid"&&name==="rows") ||
          (["cu-avatar-group","cu-segmented-control","cu-timeline","cu-carousel","cu-property-grid","cu-file-explorer","cu-status-bar","cu-kanban-board","cu-chart-container"].includes(tagName)&&name==="items") ||
          (tagName==="cu-virtual-list"&&name==="items") ||
          (tagName==="cu-tree-list"&&(name==="items"||name==="expandedValues")) ||
          (tagName==="cu-accordion"&&name==="values"&&Array.isArray(value)) ||
          (tagName==="cu-toggle-button-group"&&(name==="items"||
            (name==="value"&&Array.isArray(value))))) {
        let refs=lastControlledArrays.get(element);
        if(!refs){refs=new Map();lastControlledArrays.set(element,refs);}
        if(refs.get(name)===value)continue;
        refs.set(name,value);
      }
      if ((tagName === "cu-data-table" || tagName === "cu-data-grid") && name === "columnFilters") {
        if (lastControlledFilters.get(element) === value) continue;
        lastControlledFilters.set(element,value);
      }
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
