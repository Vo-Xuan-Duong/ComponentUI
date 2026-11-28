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
  DatePicker:"cu-date-picker", TimePicker:"cu-time-picker", DateRangePicker:"cu-date-range-picker", Calendar:"cu-calendar", Rating:"cu-rating", Slider:"cu-slider", RangeSlider:"cu-range-slider", OTPInput:"cu-otp-input", ColorPicker:"cu-color-picker", TagInput:"cu-tag-input", CommandPalette:"cu-command-palette", EmptyState:"cu-empty-state", Statistic:"cu-statistic", LoadingOverlay:"cu-loading-overlay", ScrollArea:"cu-scroll-area", AvatarGroup:"cu-avatar-group", SegmentedControl:"cu-segmented-control", Timeline:"cu-timeline", Carousel:"cu-carousel", PropertyGrid:"cu-property-grid", FileExplorer:"cu-file-explorer", DataGrid:"cu-data-grid", TitleBar:"cu-title-bar", WindowControls:"cu-window-controls", StatusBar:"cu-status-bar", DockLayout:"cu-dock-layout", KanbanBoard:"cu-kanban-board", DashboardShell:"cu-dashboard-shell", Wizard:"cu-wizard", UploadManager:"cu-upload-manager", MediaPlayer:"cu-media-player", SearchResults:"cu-search-results", LogViewer:"cu-log-viewer", JsonViewer:"cu-json-viewer", DiffViewer:"cu-diff-viewer", MarkdownEditor:"cu-markdown-editor", ImageViewer:"cu-image-viewer", TransferList:"cu-transfer-list", CurrencyInput:"cu-currency-input", MaskedInput:"cu-masked-input", MentionInput:"cu-mention-input", PhoneInput:"cu-phone-input", QueryBuilder:"cu-query-builder", FormulaInput:"cu-formula-input", PivotTable:"cu-pivot-table", Spreadsheet:"cu-spreadsheet", Scheduler:"cu-scheduler", GanttChart:"cu-gantt-chart", MenuBar:"cu-menu-bar", Ribbon:"cu-ribbon", Terminal:"cu-terminal", WindowManager:"cu-window-manager", PDFViewer:"cu-pdf-viewer", ResourceCalendar:"cu-resource-calendar", TimelineEditor:"cu-timeline-editor", PropertyInspector:"cu-property-inspector", CommandConsole:"cu-command-console", KeyboardShortcutEditor:"cu-keyboard-shortcut-editor", ColorPalette:"cu-color-palette", FontPicker:"cu-font-picker", ChartEditor:"cu-chart-editor", NotificationSettings:"cu-notification-settings", ImageGallery:"cu-image-gallery", FileManager:"cu-file-manager", ThemeEditor:"cu-theme-editor", ComponentDesigner:"cu-component-designer", WorkflowEditor:"cu-workflow-editor", NodeEditor:"cu-node-editor", ShortcutSettings:"cu-shortcut-settings", DocumentWorkspace:"cu-document-workspace", DataInspector:"cu-data-inspector", APIExplorer:"cu-api-explorer", MessageList:"cu-message-list", ChatComposer:"cu-chat-composer", WindowPane:"cu-window-pane", CommandSurface:"cu-command-surface", TaskPanel:"cu-task-panel", Masonry:"cu-masonry", TreeTable:"cu-tree-table", Banner:"cu-banner", Callout:"cu-callout", TeachingTip:"cu-teaching-tip", Flyout:"cu-flyout", ConfirmDialog:"cu-confirm-dialog", Snackbar:"cu-snackbar", TabView:"cu-tab-view", BottomNavigation:"cu-bottom-navigation", VerticalTabs:"cu-vertical-tabs", TopNav:"cu-top-nav", Sidebar:"cu-sidebar", FloatingActionButton:"cu-floating-action-button", MenuButton:"cu-menu-button", Hyperlink:"cu-hyperlink", ToggleButton:"cu-toggle-button", Form:"cu-form", FormField:"cu-form-field", FileUpload:"cu-file-upload", Collapsible:"cu-collapsible", ScrollView:"cu-scroll-view", Image:"cu-image", CodeBlock:"cu-code-block", Kbd:"cu-kbd", DescriptionList:"cu-description-list", ListItem:"cu-list-item", List:"cu-list", ChartContainer:"cu-chart-container", RichTextEditor:"cu-rich-text-editor", PageHeader:"cu-page-header", Surface:"cu-surface", Flex:"cu-flex", Grid:"cu-grid", Stack:"cu-stack", Container:"cu-container",
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
  onCuRetry:"cu-retry", onCuScroll:"cu-scroll", onCuCellChange:"cu-cell-change", onCuMove:"cu-move", onCuUpload:"cu-upload", onCuSubmit:"cu-submit", onCuSend:"cu-send", onCuFinish:"cu-finish", onCuReset:"cu-reset", onCuWindowAction:"cu-window-action", onCuWindowDrag:"cu-window-drag",
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
  "cu-data-table":["rows","columns","rowActions","headerActions","columnFilters","page","loading","error","selectedIds"],
  "cu-data-grid":["rows","columns","rowActions","headerActions","columnFilters","page","loading","error","readonly","selectedIds"],
  "cu-file-explorer":["items","folderId","query","actions"],
  "cu-title-bar":["maximized","draggableRegion"],
  "cu-window-controls":["maximized","disabled","minimizable","maximizable","closable"],
  "cu-status-bar":["items"],
  "cu-dock-layout":["layout","disabled"],
  "cu-kanban-board":["lanes","items","readonly"],
  "cu-rich-text-editor":["value","disabled","readonly","required"],
  "cu-chart-container":["items"],
  "cu-description-list":["items"],
  "cu-tree-table":["items","columns","expandedValues","query","rowActions"],
  "cu-task-panel":["items","readonly"],
  "cu-command-surface":["commands","maxVisible","disabled"],
  "cu-window-pane":["collapsed"],
  "cu-chat-composer":["value","disabled"],
  "cu-message-list":["items"],
  "cu-search-results":["items","query"],
  "cu-log-viewer":["items","query","level"],
  "cu-json-viewer":["value","query"],
  "cu-diff-viewer":["before","after"],
  "cu-markdown-editor":["value","disabled"],
  "cu-image-viewer":["src","zoom","rotation"],
  "cu-transfer-list":["items","value","disabled"],
  "cu-currency-input":["currency","locale","value","disabled"],
  "cu-masked-input":["mask","value","disabled"],
  "cu-mention-input":["items","value","required","disabled","readonly","loading"],
  "cu-phone-input":["value","disabled","required"],
  "cu-query-builder":["fields","value","disabled"],
  "cu-formula-input":["value","disabled","required"],
  "cu-pivot-table":["fields","rows","query","rowField","columnField","valueField","aggregate"],
  "cu-spreadsheet":["cells","readonly","loading","error","page"],
  "cu-scheduler":["events","date","readonly"],
  "cu-gantt-chart":["tasks","rangeStart","rangeEnd","loading","error","page"],
  "cu-menu-bar":["groups","disabled"],
  "cu-ribbon":["tabs","active","disabled"],
  "cu-terminal":["lines","disabled"],
  "cu-window-manager":["active","layout"],
  "cu-pdf-viewer":["pages","document","page"],
  "cu-resource-calendar":["resources","events","date","resourceId"],
  "cu-timeline-editor":["items","readonly"],
  "cu-property-inspector":["objects","selected","readonly"],
  "cu-command-console":["commands","lines","disabled"],
  "cu-keyboard-shortcut-editor":["items","disabled"],
  "cu-color-palette":["colors","value","disabled"],
  "cu-font-picker":["fonts","value","disabled"],
  "cu-chart-editor":["items","config","readonly"],
  "cu-notification-settings":["value","disabled"],
  "cu-image-gallery":["items","active","loop"],
  "cu-file-manager":["items","folderId","query","actions"],
  "cu-theme-editor":["value","readonly"],
  "cu-component-designer":["items","selected","readonly"],
  "cu-workflow-editor":["lanes","items","readonly"],
  "cu-node-editor":["value","readonly"],
  "cu-shortcut-settings":["items","defaults","disabled"],
  "cu-document-workspace":["pages","document","page","notes","active","readonly"],
  "cu-data-inspector":["rows","query"],
  "cu-api-explorer":["request","response","disabled","loading"],
  "cu-upload-manager":["items"],
  "cu-wizard":["steps","value","linear"],
  "cu-dashboard-shell":["navigationOpen","withoutNavigation"],
  "cu-toggle-button":["pressed","disabled","loading"],
  "cu-hyperlink":["href","disabled"],
  "cu-menu-button":["open","disabled"],
  "cu-floating-action-button":["disabled","loading","type"],
  "cu-sidebar":["value"],
  "cu-top-nav":["value"],
  "cu-bottom-navigation":["value"],
  "cu-vertical-tabs":["active"],
  "cu-tab-view":["active"],
  "cu-confirm-dialog":["open"],
  "cu-flyout":["open"],
  "cu-teaching-tip":["open"],
  "cu-list-item":["value","disabled"],
  "cu-code-block":["value"],
  "cu-collapsible":["open","disabled","value"],
  "cu-file-upload":["disabled","required","multiple","maxSize","loading"],
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
    if ((tagName === "cu-dialog" || tagName === "cu-confirm-dialog") && name === "open") {
      if (value && !element.open) element.showModal();
      else if (!value && element.open) element.close();
      continue;
    }
    if (name in element) {
      if (((tagName==="cu-split-button"||tagName==="cu-file-explorer")&&name==="actions") ||
          ((tagName==="cu-stepper"||tagName==="cu-wizard")&&name==="steps") ||
          ((tagName==="cu-multi-select"||tagName==="cu-transfer-list")&&(name==="items"||name==="value")) ||
          ((tagName==="cu-range-slider"||tagName==="cu-tag-input")&&name==="value") ||
          ((tagName==="cu-autocomplete"||tagName==="cu-mention-input"||tagName==="cu-notification-center")&&name==="items") ||
          (tagName==="cu-query-builder"&&(name==="fields"||name==="value")) ||
          (tagName==="cu-pivot-table"&&["fields","rows","query"].includes(name)) ||
          (tagName==="cu-spreadsheet"&&name==="cells") ||
          (tagName==="cu-scheduler"&&name==="events") ||
          (tagName==="cu-gantt-chart"&&name==="tasks") ||
          (tagName==="cu-menu-bar"&&name==="groups") ||
          (tagName==="cu-ribbon"&&name==="tabs") ||
          (tagName==="cu-terminal"&&name==="lines") ||
          (tagName==="cu-window-manager"&&name==="layout") ||
          (tagName==="cu-pdf-viewer"&&(name==="pages"||name==="document")) ||
          (tagName==="cu-resource-calendar"&&(name==="resources"||name==="events")) ||
          (tagName==="cu-timeline-editor"&&name==="items") ||
          (tagName==="cu-property-inspector"&&name==="objects") ||
          (tagName==="cu-command-console"&&(name==="commands"||name==="lines")) ||
          (tagName==="cu-keyboard-shortcut-editor"&&name==="items") ||
          (tagName==="cu-color-palette"&&name==="colors") ||
          (tagName==="cu-font-picker"&&name==="fonts") ||
          (tagName==="cu-chart-editor"&&(name==="items"||name==="config")) ||
          (tagName==="cu-notification-settings"&&name==="value") ||
          (tagName==="cu-image-gallery"&&name==="items") ||
          (tagName==="cu-file-manager"&&(name==="items"||name==="actions")) ||
          (tagName==="cu-theme-editor"&&name==="value") ||
          (tagName==="cu-component-designer"&&name==="items") ||
          (tagName==="cu-workflow-editor"&&(name==="lanes"||name==="items")) ||
          (tagName==="cu-node-editor"&&name==="value") ||
          (tagName==="cu-shortcut-settings"&&(name==="items"||name==="defaults")) ||
          (tagName==="cu-document-workspace"&&(name==="pages"||name==="document")) ||
          (tagName==="cu-data-inspector"&&(name==="rows"||name==="query")) ||
          (tagName==="cu-api-explorer"&&(name==="request"||name==="response")) ||
          ((tagName==="cu-command-bar"||tagName==="cu-command-palette"||tagName==="cu-command-surface")&&name==="commands") ||
          (tagName==="cu-statistic"&&name==="series") ||
          (tagName==="cu-dock-layout"&&name==="layout") ||
          (tagName==="cu-kanban-board"&&name==="lanes") ||
          (tagName==="cu-tree-table"&&(name==="columns"||name==="expandedValues"||name==="rowActions")) ||
          (tagName==="cu-data-grid"&&name==="rows") ||
          (["cu-avatar-group","cu-segmented-control","cu-timeline","cu-carousel","cu-property-grid","cu-file-explorer","cu-status-bar","cu-kanban-board","cu-chart-container","cu-description-list","cu-tree-table","cu-task-panel","cu-message-list","cu-search-results","cu-log-viewer","cu-upload-manager"].includes(tagName)&&name==="items") ||
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
