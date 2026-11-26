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
export interface CuMultiOption {value:string;label?:string;disabled?:boolean;}
export declare function normalizeMultiOptions(items:unknown):Required<CuMultiOption>[];
export declare function normalizeMultiValue(value:unknown,items:CuMultiOption[],max?:number):string[];
export declare class CuMultiSelect extends HTMLElement {
  static formAssociated:boolean;
  items:CuMultiOption[];
  value:string[];
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  show():void;
  hide():void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuSuggestion {value:string;label?:string;description?:string;disabled?:boolean;}
export declare function normalizeSuggestions(items:unknown):Required<CuSuggestion>[];
export declare function filterSuggestions(items:CuSuggestion[],query:string,max?:number):CuSuggestion[];
export declare class CuAutoComplete extends HTMLElement {
  static formAssociated:boolean;
  items:CuSuggestion[];
  value:string;
  disabled:boolean;
  required:boolean;
  loading:boolean;
  focus(options?:FocusOptions):void;
  show():void;
  hide():void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuNotification {id:string;title:string;message?:string;tone?:"info"|"success"|"warning"|"danger";read?:boolean;action?:string;}
export declare function normalizeNotifications(items:unknown):Required<CuNotification>[];
export declare class CuNotificationCenter extends HTMLElement {
  items:CuNotification[];
  readonly unreadCount:number;
  add(item:CuNotification):boolean;
  markRead(id:string,read?:boolean):boolean;
  markAllRead():void;
  dismiss(id:string):boolean;
  clear():void;
}
export interface CuToastOptions {id?:string;title?:string;message?:string;tone?:"info"|"success"|"warning"|"danger";duration?:number;action?:string;}
export declare function normalizeToast(options?:CuToastOptions):Required<CuToastOptions>;
export declare class CuToast extends HTMLElement {
  show(options:CuToastOptions):string;
  dismiss(id:string,reason?:string):boolean;
  clear():void;
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
export interface CuRangeState {min:number;max:number;step:number;value:[number,number];}
export declare function normalizeRange(value:unknown,min?:unknown,max?:unknown,step?:unknown):CuRangeState;
export declare class CuRangeSlider extends HTMLElement {
  static formAssociated:boolean;
  value:[number,number];
  disabled:boolean;
  focus(options?:FocusOptions):void;
}
export declare function normalizeOTP(value:unknown,length?:unknown):string;
export declare class CuOTPInput extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  length:number;
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuRGBA {r:number;g:number;b:number;a:number;}
export declare function parseColor(value:unknown):CuRGBA|null;
export declare function formatColor(color:CuRGBA,format?:"hex"|"rgb"|"hsl",alpha?:boolean):string;
export declare class CuColorPicker extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  disabled:boolean;
  required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export declare function normalizeTags(value:unknown,options?:{max?:number;maxLength?:number;caseSensitive?:boolean}):string[];
export declare class CuTagInput extends HTMLElement {
  static formAssociated:boolean;
  value:string[];
  disabled:boolean;
  required:boolean;
  addTag(value:string):boolean;
  removeTag(value:string):boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuPaletteCommand {value:string;label?:string;description?:string;group?:string;icon?:string;shortcut?:string;keywords?:string[];disabled?:boolean;}
export declare function normalizePaletteCommands(items:unknown):Required<CuPaletteCommand>[];
export declare function searchPaletteCommands(items:CuPaletteCommand[],query:string):CuPaletteCommand[];
export declare class CuCommandPalette extends HTMLElement {
  commands:CuPaletteCommand[];
  open:boolean;
  show():boolean;
  close(reason?:string):void;
}
export declare class CuEmptyState extends HTMLElement {}
export interface CuStatisticFormat {locale?:string;format?:"decimal"|"currency"|"percent";currency?:string;precision?:number;compact?:boolean;}
export declare function formatStatistic(value:unknown,options?:CuStatisticFormat):string;
export declare function statisticTrend(value:unknown,previous:unknown):{delta:number|null;percent:number|null;direction:"up"|"down"|"flat"|"none"};
export declare function sparklinePoints(values:unknown,width?:number,height?:number):string;
export declare class CuStatistic extends HTMLElement {
  value:number|null;
  previous:number|null;
  series:number[];
}
export declare class CuLoadingOverlay extends HTMLElement {
  loading:boolean;
  fullscreen:boolean;
  show():void;
  hide():void;
}
export interface CuScrollMetrics {scrollTop:number;scrollLeft:number;maxScrollTop:number;maxScrollLeft:number;atTop:boolean;atBottom:boolean;atStart:boolean;atEnd:boolean;canScrollX:boolean;canScrollY:boolean;}
export declare function scrollAreaMetrics(metrics:{scrollTop:number;scrollLeft:number;scrollHeight:number;scrollWidth:number;clientHeight:number;clientWidth:number;rtl?:boolean}):CuScrollMetrics;
export declare class CuScrollArea extends HTMLElement {
  readonly metrics:CuScrollMetrics;
  scrollTo(options?:ScrollToOptions):void;
  scrollTo(x:number,y:number):void;
  scrollBy(options?:ScrollToOptions):void;
  scrollBy(x:number,y:number):void;
  focus(options?:FocusOptions):void;
}
export interface CuAvatarMember {id?:string;name:string;src?:string;alt?:string;}
export declare function normalizeAvatarMembers(items:unknown):CuAvatarMember[];
export declare function splitAvatarMembers(items:CuAvatarMember[],max?:number):{visible:CuAvatarMember[];overflow:CuAvatarMember[]};
export declare class CuAvatarGroup extends HTMLElement {
  items:CuAvatarMember[];
  maxVisible:number;
  expanded:boolean;
}
export interface CuSegmentOption {value:string;label?:string;icon?:string;disabled?:boolean;}
export declare function normalizeSegmentOptions(items:unknown):Required<CuSegmentOption>[];
export declare function resolveSegmentValue(value:unknown,items:CuSegmentOption[]):string;
export declare class CuSegmentedControl extends HTMLElement {
  static formAssociated:boolean;
  items:CuSegmentOption[];
  value:string;
  disabled:boolean;
  readonly:boolean;
  required:boolean;
  select(value:string):boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export interface CuTimelineItem {id:string;title:string;description?:string;time?:string;datetime?:string;status?:"neutral"|"success"|"warning"|"danger"|"active";icon?:string;action?:string;}
export declare function normalizeTimelineItems(items:unknown):Required<CuTimelineItem>[];
export declare class CuTimeline extends HTMLElement {items:CuTimelineItem[];}
export interface CuCarouselItem {id:string;title?:string;description?:string;src?:string;alt?:string;}
export declare function normalizeCarouselItems(items:unknown):Required<CuCarouselItem>[];
export declare function carouselIndex(index:unknown,count:number,loop?:boolean):number;
export declare class CuCarousel extends HTMLElement {
  items:CuCarouselItem[];
  active:number;
  loop:boolean;
  next():boolean;
  previous():boolean;
  goTo(index:number):boolean;
}
export type CuPropertyValue=string|number|boolean;
export interface CuPropertyItem {
  key:string;label?:string;group?:string;description?:string;type?:"text"|"number"|"boolean"|"select"|"color";
  value?:CuPropertyValue;readonly?:boolean;disabled?:boolean;required?:boolean;
  min?:number;max?:number;step?:number;options?:{value:string;label?:string;disabled?:boolean}[];
}
export declare function normalizePropertyItems(items:unknown):CuPropertyItem[];
export declare function coercePropertyValue(item:CuPropertyItem,value:unknown):{valid:boolean;value:CuPropertyValue;message:string};
export declare function filterPropertyItems(items:CuPropertyItem[],query:string):CuPropertyItem[];
export declare class CuPropertyGrid extends HTMLElement {
  items:CuPropertyItem[];
  readonly values:Record<string,CuPropertyValue>;
  query:string;
  readonly:boolean;
  disabled:boolean;
  setValue(key:string,value:CuPropertyValue):boolean;
}
export type CuWindowAction="minimize"|"maximize"|"restore"|"close";
export interface CuWindowControlOptions {maximized?:boolean;minimizable?:boolean;maximizable?:boolean;closable?:boolean;}
export declare function windowControlActions(options?:CuWindowControlOptions):{action:CuWindowAction;label:string;disabled:boolean}[];
export declare function isTitleBarDragTarget(path:unknown[],region:unknown):boolean;
export declare class CuTitleBar extends HTMLElement {
  maximized:boolean;
  draggableRegion:boolean;
}
export declare class CuWindowControls extends HTMLElement {
  maximized:boolean;
  disabled:boolean;
  minimizable:boolean;
  maximizable:boolean;
  closable:boolean;
}
export interface CuStatusItem {id:string;label:string;value?:string;icon?:string;tone?:"neutral"|"success"|"warning"|"danger"|"info";align?:"start"|"end";action?:string;disabled?:boolean;}
export declare function normalizeStatusItems(items:unknown):Required<CuStatusItem>[];
export declare class CuStatusBar extends HTMLElement {items:CuStatusItem[];}
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
export interface CuGridColumn extends CuTableColumn {
  editable?:boolean;type?:"text"|"number"|"boolean"|"select"|"color";
  required?:boolean;min?:number;max?:number;step?:number;
  options?:{value:string;label?:string;disabled?:boolean}[];
}
export declare function coerceGridValue(column:CuGridColumn,value:unknown,previous?:unknown):{valid:boolean;value:unknown;message:string};
export declare class CuDataGrid extends CuDataTable {
  columns:CuGridColumn[];
  readonly:boolean;
  editCell(id:string,key:string):boolean;
  setCellValue(id:string,key:string,value:unknown):boolean;
}
export interface CuFileEntry {id:string;parentId?:string|null;name:string;kind:"file"|"folder";size?:number;modified?:string;}
export declare function normalizeFileEntries(items:unknown):CuFileEntry[];
export declare function fileExplorerPath(items:CuFileEntry[],folderId:string):CuFileEntry[];
export declare function listFileEntries(items:CuFileEntry[],folderId:string,query?:string):CuFileEntry[];
export declare class CuFileExplorer extends HTMLElement {
  items:CuFileEntry[];
  folderId:string;
  query:string;
  actions:{value:string;label?:string;disabled?:boolean}[];
  navigate(id:string):boolean;
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
    "cu-multi-select": CuMultiSelect;
    "cu-toast": CuToast;
    "cu-autocomplete": CuAutoComplete;
    "cu-notification-center": CuNotificationCenter;
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
    "cu-range-slider": CuRangeSlider;
    "cu-otp-input": CuOTPInput;
    "cu-color-picker": CuColorPicker;
    "cu-tag-input": CuTagInput;
    "cu-command-palette": CuCommandPalette;
    "cu-empty-state": CuEmptyState;
    "cu-statistic": CuStatistic;
    "cu-loading-overlay": CuLoadingOverlay;
    "cu-scroll-area": CuScrollArea;
    "cu-avatar-group": CuAvatarGroup;
    "cu-segmented-control": CuSegmentedControl;
    "cu-timeline": CuTimeline;
    "cu-carousel": CuCarousel;
    "cu-property-grid": CuPropertyGrid;
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
    "cu-data-grid": CuDataGrid;
    "cu-title-bar": CuTitleBar;
    "cu-window-controls": CuWindowControls;
    "cu-status-bar": CuStatusBar;
    "cu-file-explorer": CuFileExplorer;
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
