import type { IconName } from "../../../icons/src/icons.js";

/** ComponentUI experimental browser-native Custom Elements. */
export type ButtonVariant = "standard" | "accent" | "subtle" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface CuPressDetail { type: "button" | "submit" | "reset"; }
export interface CuInputDetail { value: string; }
export interface CuChangeDetail { value: string; checked?: boolean; }
export interface CuCloseDetail { returnValue: string; }

export declare class CuButton extends HTMLElement {
  static formAssociated: boolean;
  disabled: boolean;
  loading: boolean;
  type: "button" | "submit" | "reset";
  focus(options?: FocusOptions): void;
  click(): void;
}
export interface CuSplitAction { value:string;label?:string;disabled?:boolean; }
export declare class CuSplitButton extends HTMLElement {
  actions:CuSplitAction[];
  disabled:boolean;
  loading:boolean;
  readonly open:boolean;
  press():boolean;
  showMenu():boolean;
  hideMenu(restoreFocus?:boolean):void;
  focus(options?:FocusOptions):void;
}
export declare function normalizeSplitActions(actions:unknown):Required<CuSplitAction>[];
export interface CuStep {
  value:string;label?:string;description?:string;disabled?:boolean;optional?:boolean;
}
export declare function normalizeSteps(value:unknown):Required<CuStep>[];
export declare function canVisitStep(steps:CuStep[],index:number,currentIndex:number,linear?:boolean):boolean;
export declare class CuStepper extends HTMLElement {
  steps:CuStep[];
  value:string;
  readonly currentIndex:number;
  linear:boolean;
  goTo(value:string|number):boolean;
  next():boolean;
  previous():boolean;
}
export declare class CuInfoBar extends HTMLElement {
  dismiss():boolean;
  show():void;
}
export declare class CuIconButton extends HTMLElement {
  name:IconName|string;
  disabled:boolean;loading:boolean;pressed:boolean;toggle:boolean;
  press():boolean;focus(options?:FocusOptions):void;click():void;
}
export interface CuToggleOption {
  value:string;label?:string;icon?:IconName|string;disabled?:boolean;
}
export declare function normalizeToggleOptions(items:unknown):Required<CuToggleOption>[];
export declare function toggleGroupValues(current:string|string[],value:string,multiple?:boolean):string|string[];
export declare class CuToggleButtonGroup extends HTMLElement {
  items:CuToggleOption[];
  value:string|string[];
  multiple:boolean;disabled:boolean;
  select(value:string):boolean;focus(options?:FocusOptions):void;
}
export declare function nextToolbarIndex(
  items:Array<{disabled:boolean}>,current:number,direction:"next"|"previous"|"Home"|"End"
):number;
export declare class CuToolbar extends HTMLElement {
  refresh():void;focus(options?:FocusOptions):void;
}
export interface CuCommand {
  value:string;label?:string;icon?:IconName|string;disabled?:boolean;
}
export declare function normalizeCommands(items:unknown):Required<CuCommand>[];
export declare function partitionCommands<T>(items:T[],maxVisible:number):
  {visible:T[];overflow:T[]};
export declare class CuCommandBar extends HTMLElement {
  commands:CuCommand[];
  disabled:boolean;
  maxVisible:number;
  readonly visibleCommands:CuCommand[];
  readonly overflowCommands:CuCommand[];
  activate(value:string):boolean;
  showOverflow():boolean;
}
export declare class CuDisclosure extends HTMLElement {
  value:string;
  open:boolean;
  disabled:boolean;
  show():boolean;
  hide():void;
  toggle():boolean;
  focus(options?:FocusOptions):void;
}
export declare class CuAccordionItem extends CuDisclosure {}
export declare function accordionValues(
  items:Array<{value:string;open:boolean;disabled?:boolean}>,
  multiple?:boolean
):string[];
export declare class CuAccordion extends HTMLElement {
  multiple:boolean;
  value:string;
  values:string[];
}
export interface CuPaginationState {
  page:number;
  pageCount:number;
  total:number;
  pageSize:number;
  start:number;
  end:number;
}
export declare function normalizePagination(
  page?:string|number|null,
  total?:string|number|null,
  pageSize?:string|number|null
):CuPaginationState;
export declare function paginationItems(
  page:number,pageCount:number,siblings?:number
):(number|"ellipsis")[];
export declare class CuPagination extends HTMLElement {
  total:number;pageSize:number;page:number;
  readonly pageCount:number;
  goTo(page:number):boolean;
  next():boolean;
  previous():boolean;
}
export declare class CuDrawer extends HTMLElement {
  open:boolean;dismissible:boolean;
  show():void;close(returnValue?:string):void;
}
export declare function clampSplitPosition(position:number|string|null,
  min?:number,max?:number):number;
export declare function splitPositionFromPointer(x:number,y:number,
  rect:{left:number;top:number;width:number;height:number},
  orientation?:"horizontal"|"vertical",min?:number,max?:number):number;
export declare class CuSplitter extends HTMLElement {
  position:number;min:number;max:number;disabled:boolean;
  readonly orientation:"horizontal"|"vertical";
}
export declare class CuResizablePanel extends HTMLElement {
  resizable:boolean;
}
export declare const DATA_FILTER_OPERATORS:readonly string[];
export interface CuFilterCondition {
  field:string;operator:string;value:string;
}
export declare function buildFilterCondition(field:string,operator:string,
  value?:unknown):CuFilterCondition|null;
export declare class CuDataFilter extends HTMLElement {
  field:string;operator:string;value:string;disabled:boolean;
  readonly condition:CuFilterCondition|null;
  readonly active:boolean;
  clear(emit?:boolean):boolean;
}
export type CuFilterBarConditions=Record<string,{operator:string;value:string}>;
export declare function applyFilterBar<T extends Record<string,unknown>>(
  rows:T[],query?:string,conditions?:CuFilterBarConditions,
  searchKeys?:string[]|null
):T[];
export declare class CuFilterBar extends HTMLElement {
  query:string;
  readonly conditions:CuFilterBarConditions;
  readonly activeCount:number;
  refresh():void;
  clear():boolean;
}
export declare class CuSplitView extends HTMLElement {
  position:number;
  collapsible:boolean;
  collapsed:boolean;
  collapse():boolean;
  expand():boolean;
  toggle():boolean;
}
export declare function virtualListRange(
  scrollTop:number,viewportHeight:number,count:number,itemHeight?:number,overscan?:number
):{start:number;end:number;top:number;bottom:number;totalHeight:number};
export declare function virtualListLabel(
  item:unknown,index:number,labelKey?:string
):string;
export declare class CuVirtualList extends HTMLElement {
  items:unknown[];
  itemHeight:number;
  overscan:number;
  labelKey:string;
  selectedIndex:number;
  select(index:number,options?:{emit?:boolean;force?:boolean}):boolean;
  scrollToIndex(index:number,align?:"auto"|"start"|"end"):boolean;
  focus(options?:FocusOptions):void;
}
export interface CuTreeListItem {
  value?:string;id?:string|number;label?:string;name?:string;
  disabled?:boolean;expanded?:boolean;children?:CuTreeListItem[];
}
export interface CuTreeListRow {
  value:string;label:string;level:number;parent:string|null;
  posinset:number;setsize:number;disabled:boolean;
  hasChildren:boolean;expanded:boolean;item:CuTreeListItem;
}
export declare function flattenTreeList(
  items:CuTreeListItem[],expanded?:Set<string>|string[]
):CuTreeListRow[];
export declare function initialTreeExpansion(items:CuTreeListItem[]):Set<string>;
export declare class CuTreeList extends HTMLElement {
  items:CuTreeListItem[];
  value:string;
  itemHeight:number;
  overscan:number;
  expandedValues:string[];
  readonly visibleCount:number;
  expand(value:string):boolean;collapse(value:string):boolean;toggle(value:string):boolean;
  select(value:string):boolean;scrollToIndex(index:number):boolean;
  focus(options?:FocusOptions):void;
}
export declare function shouldLoadMore(
  scrollTop:number,clientHeight:number,scrollHeight:number,threshold?:number
):boolean;
export declare class CuInfiniteScroll extends HTMLElement {
  hasMore:boolean;loading:boolean;threshold:number;
  readonly page:number;
  requestMore(reason?:string):boolean;
  complete(options?:{hasMore?:boolean}):void;
  error:string;
  fail(message?:string):boolean;
  reset():void;
}
export declare class CuTextField extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}

export declare class CuTextArea extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuNumberField extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  readonly valueAsNumber: number;
  disabled: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare function stepNumber(
  value: string | number | null, direction?: number, step?: number | string,
  min?: number | string | null, max?: number | string | null
): string;
export declare class CuSearchBox extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  clear(): void;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}


export declare class CuPasswordField extends HTMLElement {
  static formAssociated: boolean;
  value: string; disabled: boolean; required: boolean;
  readonly visible: boolean;
  toggleVisibility(): void;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuFilePicker extends HTMLElement {
  static formAssociated: boolean;
  readonly files: File[];
  disabled: boolean; multiple: boolean; maxSize: number;
  clear(emit?: boolean): void;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare function formatFileSize(bytes: number): string;
export declare function matchesFileAccept(file: Pick<File, "name"|"type">, accept?: string): boolean;
export declare function validateFileSelection(
  files: Iterable<File>, options?: {
    accept?:string;multiple?:boolean;required?:boolean;maxSize?:number
  }
): string;
export declare class CuNavigationView extends HTMLElement {
  value: string;
  select(value: string, emit?: boolean): boolean;
}
export declare function nextNavigationIndex(
  length: number, index: number, key: string
): number;
export declare class CuSettingsPage extends HTMLElement {
  query: string;
  searchable: boolean;
  clearSearch(): void;
}
export declare function matchesSettingsQuery(record: {
  label?:string|null;description?:string|null;keywords?:string|null
},query?:string):boolean;
export declare class CuSettingsGroup extends HTMLElement {}
export declare class CuSettingsItem extends HTMLElement {}
export declare class CuAppShell extends HTMLElement {
  navigationOpen: boolean;
  withoutNavigation: boolean;
  openNavigation(): void;
  closeNavigation(restoreFocus?: boolean): void;
  toggleNavigation(): void;
}
export declare class CuCheckbox extends HTMLElement {
  static formAssociated: boolean;
  checked: boolean;
  disabled: boolean;
  value: string;
  focus(options?: FocusOptions): void;
}
export declare class CuSwitch extends CuCheckbox {}
export declare class CuDialog extends HTMLElement {
  readonly open: boolean;
  readonly returnValue: string;
  showModal(): void;
  close(returnValue?: string): void;
}


export declare class CuSelect extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuRadio extends HTMLElement {}
export declare class CuRadioGroup extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuTab extends HTMLElement {}
export declare class CuTabs extends HTMLElement {
  active: number;
}
export declare class CuTooltip extends HTMLElement {}
export declare class CuPopover extends HTMLElement {
  open: boolean;
  show(): void;
  hide(): void;
  toggle(): void;
}


export declare class CuDatePicker extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuTimePicker extends CuDatePicker {}
export declare function splitDateRange(value:unknown):{start:string;end:string};
export declare function dateRangeValidity(start:string,end:string,options?:{required?:boolean;min?:string;max?:string}):{flags:ValidityStateFlags;message:string;field:"start"|"end"};
export declare class CuDateRangePicker extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  start:string;
  end:string;
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuCalendarDay {value:string;day:number;inMonth:boolean;}
export declare function calendarDays(month:string,weekStart?:number):CuCalendarDay[];
export declare function moveCalendarDate(value:string,amount:number,unit?:"day"|"month"|"year"):string;
export declare class CuCalendar extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export declare function normalizeRating(value:unknown,max?:unknown):{value:number;max:number};
export declare class CuRating extends HTMLElement {
  static formAssociated:boolean;
  value:number;
  max:number;
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export declare class CuSlider extends HTMLElement {
  static formAssociated: boolean;
  value: number;
  disabled: boolean;
  focus(options?: FocusOptions): void;
}
export declare class CuProgressBar extends HTMLElement {
  value: number | null;
  max: number;
}
export declare class CuProgressRing extends HTMLElement {
  value:number|null;
  max:number;
}
export declare function normalizeRingProgress(value:string|number|null|undefined,max?:string|number):
  {value:number|null;max:number;percent:number|null};
export declare class CuChip extends HTMLElement {
  value:string;selected:boolean;selectable:boolean;removable:boolean;disabled:boolean;
  toggle():void;removeChip():void;
}
export declare class CuTag extends HTMLElement {}
export declare class CuBadge extends HTMLElement {}
export declare class CuAvatar extends HTMLElement {}
export declare class CuMenu extends HTMLElement {
  open: boolean;
  show(focus?: "first" | "last"): void;
  hide(restoreFocus?: boolean): void;
  toggle(): void;
}
export declare class CuMenuItem extends HTMLElement {}
export declare function initialsFromName(name: string): string;


export declare class CuCard extends HTMLElement {}
export declare class CuDivider extends HTMLElement {}
export declare class CuSkeleton extends HTMLElement {}
export declare class CuSpinner extends HTMLElement {}
export declare class CuAlert extends HTMLElement {
  dismiss(): void;
  show(): void;
}
export declare class CuBreadcrumb extends HTMLElement {}
export declare class CuBreadcrumbItem extends HTMLElement {}
export declare function safeBreadcrumbHref(value: string | null): string | null;


export interface CuTableColumn { key:string;label?:string;sortable?:boolean;filterable?:boolean; }
export type CuTableFilterOperator =
  "contains"|"not-contains"|"starts-with"|"ends-with"|"equals"|"not-equals"|
  "greater-than"|"greater-or-equal"|"less-than"|"less-or-equal"|
  "between"|"is-blank"|"is-not-blank";
export interface CuTableFilterCondition {
  operator:CuTableFilterOperator;
  value?:string|number;
  value2?:string|number;
}
export type CuTableFilterSpec=unknown[]|CuTableFilterCondition;
export type CuTableRecord = {id?:string|number;[key:string]:unknown};
export interface CuTableRowAction {
  value:string;
  label?:string;
  disabled?:boolean|((row:CuTableRecord)=>boolean);
}
export interface CuTableHeaderAction {
  value:string;
  label?:string;
  disabled?:boolean|((column:CuTableColumn|null)=>boolean);
}
export declare class CuDataTable extends HTMLElement {
  loading:boolean;
  error:string;
  rows:CuTableRecord[];
  columns:CuTableColumn[];
  rowActions:CuTableRowAction[];
  headerActions:CuTableHeaderAction[];
  columnFilters:Record<string,CuTableFilterSpec>;
  readonly filteredRows:CuTableRecord[];
  readonly externalFilterState:{query:string;conditions:CuFilterBarConditions};
  bindFilterBar(bar:CuFilterBar,options?:{searchKeys?:string[]|null}):()=>void;
  unbindFilterBar():void;
  readonly hiddenColumnKeys:string[];
  readonly visibleColumnKeys:string[];
  page:number;
  readonly sortKey:string;
  readonly sortDirection:"asc"|"desc";
  readonly selectedIds:string[];
  clearSelection():void;
  setColumnFilter(key:string,filter:CuTableFilterSpec|null):void;
  setColumnCondition(key:string,operator:CuTableFilterOperator,value?:string|number,value2?:string|number):void;
  clearColumnFilter(key:string):void;
  clearAllFilters():void;
  clearSort():void;
  hideColumn(key:string):void;
  showAllColumns():void;
}
export declare function tableFilterValueKey(value:unknown):string;
export declare function tableFilterValueLabel(value:unknown):string;
export declare const TABLE_FILTER_OPERATORS:readonly CuTableFilterOperator[];
export declare function isTableFilterCondition(value:unknown):value is CuTableFilterCondition;
export declare function matchTableFilterCondition(value:unknown,condition:CuTableFilterCondition):boolean;
export declare function normalizeTableFilterSpec(spec:CuTableFilterSpec):CuTableFilterSpec;
export declare function filterTableRows<T extends Record<string,unknown>>(
  rows:T[],filters:Map<string,CuTableFilterSpec>|Record<string,CuTableFilterSpec>,
  omitKey?:string|null
):T[];
export declare function uniqueTableFilterValues<T extends Record<string,unknown>>(
  rows:T[],key:string
):{key:string;value:unknown;label:string;count:number}[];
export declare function sortTableRows<T extends Record<string,unknown>>(
  rows:T[],key:string,direction?:"asc"|"desc"
):T[];
export declare function paginateRows<T>(
  rows:T[],page?:number,size?:number
):{page:number;totalPages:number;total:number;rows:T[]};
export declare class CuTreeView extends HTMLElement {
  value:string;
  focus(options?:FocusOptions):void;
}
export declare class CuTreeItem extends HTMLElement {}
export declare function flattenVisibleTree(items:unknown[],level?:number,parent?:string|null):unknown[];
export declare class CuListBox extends HTMLElement {
  static formAssociated:boolean;
  value:string;disabled:boolean;required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;reportValidity():boolean;
}
export declare class CuListOption extends HTMLElement {}
export declare function readListOptions(entries:unknown[]):unknown[];
export declare class CuCombobox extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  readonly query:string;
  readonly open:boolean;
  disabled:boolean;
  focus(options?:FocusOptions):void;
  show():void;hide(restore?:boolean):void;
  checkValidity():boolean;reportValidity():boolean;
}
export declare class CuComboOption extends HTMLElement {}
export declare function filterComboOptions(entries:unknown[],query:string):unknown[];
export declare class CuContextMenu extends HTMLElement {
  readonly open:boolean;
  items:{value:string;label?:string;disabled?:boolean}[]|null;
  showAt(x:number,y:number,focusTarget?:HTMLElement|null):void;
  hide(restoreFocus?:boolean):void;
}
export declare function clampMenuPosition(
  x:number,y:number,menuWidth:number,menuHeight:number,
  viewportWidth:number,viewportHeight:number
):{x:number;y:number};

declare global {
  interface HTMLElementTagNameMap {
    "cu-button": CuButton;
    "cu-text-field": CuTextField;
    "cu-password-field": CuPasswordField;
    "cu-file-picker": CuFilePicker;
    "cu-app-shell": CuAppShell;
    "cu-navigation-view": CuNavigationView;
    "cu-settings-page": CuSettingsPage;
    "cu-settings-group": CuSettingsGroup;
    "cu-settings-item": CuSettingsItem;
    "cu-textarea": CuTextArea;
    "cu-number-field": CuNumberField;
    "cu-search-box": CuSearchBox;
    "cu-checkbox": CuCheckbox;
    "cu-switch": CuSwitch;
    "cu-dialog": CuDialog;
    "cu-select": CuSelect;
    "cu-radio": CuRadio;
    "cu-radio-group": CuRadioGroup;
    "cu-tab": CuTab;
    "cu-tabs": CuTabs;
    "cu-tooltip": CuTooltip;
    "cu-popover": CuPopover;
    "cu-date-picker": CuDatePicker;
    "cu-time-picker": CuTimePicker;
    "cu-date-range-picker": CuDateRangePicker;
    "cu-calendar": CuCalendar;
    "cu-rating": CuRating;
    "cu-slider": CuSlider;
    "cu-progress-bar": CuProgressBar;
    "cu-badge": CuBadge;
    "cu-avatar": CuAvatar;
    "cu-menu": CuMenu;
    "cu-menu-item": CuMenuItem;
    "cu-icon": CuIcon;
    "cu-card": CuCard;
    "cu-divider": CuDivider;
    "cu-skeleton": CuSkeleton;
    "cu-spinner": CuSpinner;
    "cu-alert": CuAlert;
    "cu-breadcrumb": CuBreadcrumb;
    "cu-breadcrumb-item": CuBreadcrumbItem;
    "cu-data-table": CuDataTable;
    "cu-tree-view": CuTreeView;
    "cu-tree-item": CuTreeItem;
    "cu-listbox": CuListBox;
    "cu-list-option": CuListOption;
    "cu-combobox": CuCombobox;
    "cu-combo-option": CuComboOption;
    "cu-context-menu": CuContextMenu;
  }
}

export declare class CuIcon extends HTMLElement {
  name: IconName;
}
