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
  disabled: boolean; required: boolean; multiple: boolean; maxSize: number;
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
  readonly:boolean;
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
  readonly:boolean;
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
export declare class CuRadio extends HTMLElement {disabled:boolean;checked:boolean;}
export declare class CuRadioGroup extends HTMLElement {
  static formAssociated: boolean;
  value: string;
  disabled: boolean;
  required: boolean;
  focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
export declare class CuTab extends HTMLElement {disabled:boolean;}
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
  min:number;max:number;step:number;
  disabled:boolean;
  readonly:boolean;
  focus(options?:FocusOptions):void;
}
export declare function normalizeOTP(value:unknown,length?:unknown):string;
export declare class CuOTPInput extends HTMLElement {
  static formAssociated:boolean;
  value:string;
  length:number;
  disabled:boolean;
  readonly:boolean;
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
  alpha:boolean;
  disabled:boolean;
  readonly:boolean;
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
  readonly:boolean;
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
export type CuDockRegion="start"|"end"|"bottom";
export interface CuDockState {start:number;end:number;bottom:number;startOpen:boolean;endOpen:boolean;bottomOpen:boolean;}
export declare function normalizeDockLayout(value?:Partial<CuDockState>):CuDockState;
export declare class CuDockLayout extends HTMLElement {
  get layout():CuDockState;
  set layout(value:Partial<CuDockState>);
  disabled:boolean;
  toggleRegion(region:CuDockRegion):boolean;
  resizeRegion(region:CuDockRegion,size:number):boolean;
}
export interface CuKanbanLane {id:string;label:string;}
export interface CuKanbanItem {id:string;laneId:string;title:string;description?:string;tag?:string;disabled?:boolean;}
export declare function normalizeKanbanLanes(value:unknown):CuKanbanLane[];
export declare function normalizeKanbanItems(value:unknown,lanes:CuKanbanLane[]):CuKanbanItem[];
export declare function moveKanbanItem(items:CuKanbanItem[],id:string,laneId:string,beforeId?:string|null):CuKanbanItem[];
export declare class CuKanbanBoard extends HTMLElement {
  lanes:CuKanbanLane[];
  items:CuKanbanItem[];
  readonly:boolean;
  moveItem(id:string,laneId:string,beforeId?:string|null):boolean;
}
export declare class CuContainer extends HTMLElement {}
export declare class CuStack extends HTMLElement {}
export declare class CuGrid extends HTMLElement {}
export declare class CuFlex extends HTMLElement {}
export declare class CuSurface extends HTMLElement {}
export declare class CuPageHeader extends HTMLElement {}
export interface CuChartItem {label:string;value:number;}
export declare function normalizeChartItems(value:unknown):CuChartItem[];
export declare function chartDomain(items:CuChartItem[]):{min:number;max:number};
export declare class CuChartContainer extends HTMLElement {items:CuChartItem[];}
export declare function sanitizeRichText(value:unknown,doc?:Document):string;
export declare class CuRichTextEditor extends HTMLElement {
  static formAssociated:boolean;
  value:string; disabled:boolean; readonly:boolean; required:boolean;
  focus(options?:FocusOptions):void;
  checkValidity():boolean;
  reportValidity():boolean;
}
export declare class CuList extends HTMLElement {}
export declare class CuListItem extends HTMLElement {disabled:boolean;value:string;}
export interface CuDescriptionItem {label:string;value:string;}
export declare function normalizeDescriptionItems(value:unknown):CuDescriptionItem[];
export declare class CuDescriptionList extends HTMLElement {items:CuDescriptionItem[];}
export declare class CuKbd extends HTMLElement {}
export declare class CuCodeBlock extends HTMLElement {value:string;copy():Promise<boolean>;}
export declare class CuImage extends HTMLElement {}
export declare class CuScrollView extends CuScrollArea {}
export declare class CuCollapsible extends CuDisclosure {}
export declare class CuFileUpload extends CuFilePicker {
  loading:boolean;
  requestUpload():boolean;
}
export declare class CuFormField extends HTMLElement {}
export declare class CuForm extends HTMLElement {
  readonly form:HTMLFormElement|null;
  readonly data:FormData|null;
  checkValidity():boolean;
  reportValidity():boolean;
  requestSubmit(submitter?:HTMLElement):boolean;
  reset():boolean;
}
export declare class CuToggleButton extends HTMLElement {
  pressed:boolean;disabled:boolean;loading:boolean;focus(options?:FocusOptions):void;click():void;
}
export declare class CuHyperlink extends HTMLElement {href:string;disabled:boolean;focus(options?:FocusOptions):void;}
export declare class CuMenuButton extends CuMenu {disabled:boolean;}
export declare class CuFloatingActionButton extends CuButton {}
export declare class CuSidebar extends CuNavigationView {}
export declare class CuTopNav extends CuNavigationView {}
export declare class CuVerticalTabs extends CuTabs {}
export declare class CuBottomNavigation extends CuNavigationView {}
export declare class CuTabView extends CuTabs {}
export declare class CuSnackbar extends CuToast {}
export declare class CuConfirmDialog extends CuDialog {}
export declare class CuFlyout extends CuPopover {}
export declare class CuTeachingTip extends CuPopover {}
export declare class CuCallout extends CuAlert {}
export declare class CuBanner extends CuInfoBar {}
export interface CuTreeTableItem {id:string;label:string;values?:Record<string,unknown>;children?:CuTreeTableItem[];expanded?:boolean;}
export declare function normalizeTreeTableItems(value:unknown):CuTreeTableItem[];
export declare function visibleTreeTableRows(items:CuTreeTableItem[],expanded:Set<string>|string[]):{item:CuTreeTableItem;depth:number}[];
export declare function filterTreeTableItems(items:CuTreeTableItem[],query?:string):CuTreeTableItem[];
export declare function sortTreeTableItems(items:CuTreeTableItem[],key:string|null,direction?:"asc"|"desc"):CuTreeTableItem[];
export declare class CuTreeTable extends HTMLElement {
  items:CuTreeTableItem[];columns:CuTableColumn[];expandedValues:string[];query:string;readonly renderBatch:number;
  rowActions:{value:string;label?:string;disabled?:boolean|((item:CuTreeTableItem)=>boolean)}[];
  readonly sortKey:string|null;readonly sortDirection:"asc"|"desc";
  toggle(id:string):boolean;expandAll():void;collapseAll():void;
  sortBy(key:string,direction?:"asc"|"desc"):boolean;clearSort():void;
}
export declare class CuMasonry extends HTMLElement {}
export interface CuTaskItem {id:string;label:string;completed?:boolean;disabled?:boolean;}
export declare function normalizeTasks(value:unknown):Required<CuTaskItem>[];
export declare class CuTaskPanel extends HTMLElement {items:CuTaskItem[];readonly:boolean;toggle(id:string):boolean;}
export declare class CuCommandSurface extends CuCommandBar {}
export declare class CuWindowPane extends HTMLElement {collapsed:boolean;toggle():boolean;}
export declare class CuChatComposer extends HTMLElement {value:string;disabled:boolean;send():boolean;focus(options?:FocusOptions):void;}
export interface CuMessageItem {id:string;sender:string;text:string;time?:string;own?:boolean;}
export declare function normalizeMessages(value:unknown):Required<CuMessageItem>[];
export declare class CuMessageList extends HTMLElement {items:CuMessageItem[];scrollToEnd():void;}
export interface CuSearchResult {id:string;title:string;description?:string;meta?:string;}
export declare function normalizeSearchResults(value:unknown):Required<CuSearchResult>[];
export declare function filterSearchResults(items:CuSearchResult[],query:string):CuSearchResult[];
export declare class CuSearchResults extends HTMLElement {items:CuSearchResult[];query:string;}
export declare class CuMediaPlayer extends HTMLElement {play():Promise<void>;pause():void;currentTime:number;readonly duration:number;}
export interface CuUploadItem {id:string;name:string;size?:number;progress?:number;status?:"queued"|"uploading"|"complete"|"error"|"cancelled";error?:string;}
export declare function normalizeUploadItems(value:unknown):CuUploadItem[];
export declare class CuUploadManager extends HTMLElement {items:CuUploadItem[];}
export declare class CuWizard extends HTMLElement {steps:CuStep[];value:string;linear:boolean;next():boolean;previous():boolean;goTo(value:string|number):boolean;}
export declare class CuDashboardShell extends CuAppShell {}
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
export declare class CuMenuItem extends HTMLElement {disabled:boolean;}
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
  selectedIds:string[];
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
    "cu-icon-button": CuIconButton;
    "cu-toggle-button-group": CuToggleButtonGroup;
    "cu-toolbar": CuToolbar;
    "cu-command-bar": CuCommandBar;
    "cu-split-button": CuSplitButton;
    "cu-stepper": CuStepper;
    "cu-info-bar": CuInfoBar;
    "cu-drawer": CuDrawer;
    "cu-accordion": CuAccordion;
    "cu-accordion-item": CuAccordionItem;
    "cu-disclosure": CuDisclosure;
    "cu-pagination": CuPagination;
    "cu-progress-ring": CuProgressRing;
    "cu-chip": CuChip;
    "cu-tag": CuTag;
    "cu-tree-list": CuTreeList;
    "cu-infinite-scroll": CuInfiniteScroll;
    "cu-split-view": CuSplitView;
    "cu-virtual-list": CuVirtualList;
    "cu-splitter": CuSplitter;
    "cu-resizable-panel": CuResizablePanel;
    "cu-filter-bar": CuFilterBar;
    "cu-data-filter": CuDataFilter;
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
    "cu-dock-layout": CuDockLayout;
    "cu-kanban-board": CuKanbanBoard;
    "cu-dashboard-shell": CuDashboardShell;
    "cu-wizard": CuWizard;
    "cu-upload-manager": CuUploadManager;
    "cu-media-player": CuMediaPlayer;
    "cu-search-results": CuSearchResults;
    "cu-log-viewer": CuLogViewer;
    "cu-json-viewer": CuJsonViewer;
    "cu-diff-viewer": CuDiffViewer;
    "cu-markdown-editor": CuMarkdownEditor;
    "cu-image-viewer": CuImageViewer;
    "cu-transfer-list": CuTransferList;
    "cu-currency-input": CuCurrencyInput;
    "cu-masked-input": CuMaskedInput;
    "cu-mention-input": CuMentionInput;
    "cu-phone-input": CuPhoneInput;
    "cu-query-builder": CuQueryBuilder;
    "cu-formula-input": CuFormulaInput;
    "cu-pivot-table": CuPivotTable;
    "cu-spreadsheet": CuSpreadsheet;
    "cu-scheduler": CuScheduler;
    "cu-gantt-chart": CuGanttChart;
    "cu-menu-bar": CuMenuBar;
    "cu-ribbon": CuRibbon;
    "cu-terminal": CuTerminal;
    "cu-window-manager": CuWindowManager;
    "cu-pdf-viewer": CuPdfViewer;
    "cu-resource-calendar": CuResourceCalendar;
    "cu-timeline-editor": CuTimelineEditor;
    "cu-property-inspector": CuPropertyInspector;
    "cu-command-console": CuCommandConsole;
    "cu-keyboard-shortcut-editor": CuKeyboardShortcutEditor;
    "cu-color-palette": CuColorPalette;
    "cu-font-picker": CuFontPicker;
    "cu-chart-editor": CuChartEditor;
    "cu-notification-settings": CuNotificationSettings;
    "cu-image-gallery": CuImageGallery;
    "cu-file-manager": CuFileManager;
    "cu-theme-editor": CuThemeEditor;
    "cu-component-designer": CuComponentDesigner;
    "cu-workflow-editor": CuWorkflowEditor;
    "cu-node-editor": CuNodeEditor;
    "cu-shortcut-settings": CuShortcutSettings;
    "cu-document-workspace": CuDocumentWorkspace;
    "cu-data-inspector": CuDataInspector;
    "cu-api-explorer": CuAPIExplorer;
    "cu-media-library": CuMediaLibrary;
    "cu-dashboard-designer": CuDashboardDesigner;
    "cu-form-designer": CuFormDesigner;
    "cu-schema-editor": CuSchemaEditor;
    "cu-database-explorer": CuDatabaseExplorer;
    "cu-application-shell": CuApplicationShell;
    "cu-report-builder": CuReportBuilder;
    "cu-automation-designer": CuAutomationDesigner;
    "cu-message-list": CuMessageList;
    "cu-chat-composer": CuChatComposer;
    "cu-window-pane": CuWindowPane;
    "cu-command-surface": CuCommandSurface;
    "cu-task-panel": CuTaskPanel;
    "cu-masonry": CuMasonry;
    "cu-tree-table": CuTreeTable;
    "cu-banner": CuBanner;
    "cu-callout": CuCallout;
    "cu-teaching-tip": CuTeachingTip;
    "cu-flyout": CuFlyout;
    "cu-confirm-dialog": CuConfirmDialog;
    "cu-snackbar": CuSnackbar;
    "cu-tab-view": CuTabView;
    "cu-bottom-navigation": CuBottomNavigation;
    "cu-vertical-tabs": CuVerticalTabs;
    "cu-top-nav": CuTopNav;
    "cu-sidebar": CuSidebar;
    "cu-floating-action-button": CuFloatingActionButton;
    "cu-menu-button": CuMenuButton;
    "cu-hyperlink": CuHyperlink;
    "cu-toggle-button": CuToggleButton;
    "cu-form": CuForm;
    "cu-form-field": CuFormField;
    "cu-file-upload": CuFileUpload;
    "cu-collapsible": CuCollapsible;
    "cu-scroll-view": CuScrollView;
    "cu-image": CuImage;
    "cu-code-block": CuCodeBlock;
    "cu-kbd": CuKbd;
    "cu-description-list": CuDescriptionList;
    "cu-list-item": CuListItem;
    "cu-list": CuList;
    "cu-chart-container": CuChartContainer;
    "cu-rich-text-editor": CuRichTextEditor;
    "cu-page-header": CuPageHeader;
    "cu-surface": CuSurface;
    "cu-flex": CuFlex;
    "cu-grid": CuGrid;
    "cu-stack": CuStack;
    "cu-container": CuContainer;
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

export interface CuLogEntry {id:string;message:string;level?:"debug"|"info"|"warn"|"error";timestamp?:string;source?:string;}
export declare const LOG_LEVELS: readonly ["debug","info","warn","error"];
export declare function normalizeLogEntries(value:unknown):Required<CuLogEntry>[];
export declare function filterLogEntries(items:Required<CuLogEntry>[],query?:string,level?:"all"|CuLogEntry["level"]):Required<CuLogEntry>[];
export declare class CuLogViewer extends HTMLElement {items:CuLogEntry[];query:string;level:"all"|"debug"|"info"|"warn"|"error";readonly visibleItems:Required<CuLogEntry>[];resetFilters():boolean;}

export interface CuJsonNode {path:string;label:string;value:unknown;children:CuJsonNode[];}
export declare function buildJsonTree(value:unknown,options?:{maxNodes?:number;maxDepth?:number}):{root:CuJsonNode|null;truncated:boolean;count:number};
export declare function filterJsonTree(node:CuJsonNode|null,query:string):CuJsonNode|null;
export declare class CuJsonViewer extends HTMLElement {value:string;query:string;}
export declare function diffLines(before:string,after:string,limit?:number):{limited:boolean;rows:{kind:"equal"|"add"|"remove";before:string|null;after:string|null}[];added:number;removed:number};
export declare class CuDiffViewer extends HTMLElement {before:string;after:string;}
export declare function parseMarkdownBlocks(value:string):{kind:string;text:string;level?:number;language?:string}[];
export declare class CuMarkdownEditor extends HTMLElement {value:string;disabled:boolean;focus(options?:FocusOptions):void;}

export declare function normalizeImageTransform(zoom?:number,rotation?:number):{zoom:number;rotation:number};
export declare class CuImageViewer extends HTMLElement {src:string;zoom:number;rotation:number;readonly transform:{zoom:number;rotation:number};}
export interface CuTransferItem {value:string;label?:string;disabled?:boolean;}
export declare function normalizeTransferItems(items:unknown):Required<CuTransferItem>[];
export declare function transferValues(items:CuTransferItem[],values:string[],move:string[],direction:"add"|"remove"):string[];
export declare class CuTransferList extends HTMLElement {items:CuTransferItem[];value:string[];disabled:boolean;move(action:"add"|"remove"|"add-all"|"remove-all"):boolean;}
export declare function formatCurrencyValue(value:string|number,currency?:string,locale?:string):string;
export declare class CuCurrencyInput extends CuNumberField {currency:string;locale:string;readonly formattedValue:string;}
export declare function applyInputMask(value:string,mask:string):{value:string;rawValue:string;complete:boolean};
export declare function inputMaskPattern(mask:string):string;
export declare class CuMaskedInput extends CuTextField {mask:string;readonly rawValue:string;}

export interface CuMentionRange {start:number;end:number;query:string;}
export declare function activeMention(value:string,caret?:number):CuMentionRange|null;
export declare function insertMention(value:string,range:CuMentionRange|null,handle:string):{value:string;caret:number}|null;
export declare class CuMentionInput extends CuAutoComplete {}
export declare function normalizePhoneNumber(value:string):string;
export declare function isInternationalPhone(value:string):boolean;
export declare class CuPhoneInput extends CuTextField {readonly normalizedValue:string;}
export interface CuQueryField {value:string;label?:string;}
export interface CuQueryValue {logic:"and"|"or";conditions:{field:string;operator:string;value:string}[];}
export declare function normalizeQueryFields(fields:unknown):Required<CuQueryField>[];
export declare function filterQueryRows<T extends object>(rows:T[],query:CuQueryValue):T[];
export declare class CuQueryBuilder extends HTMLElement {fields:CuQueryField[];value:CuQueryValue;disabled:boolean;addCondition():boolean;removeCondition(index:number):boolean;}
export interface CuFormulaEvaluation {valid:boolean;result:number|null;error:string;}
export declare function evaluateFormula(value:string,resolveReference?:(address:string)=>number):CuFormulaEvaluation;
export declare class CuFormulaInput extends CuTextField {readonly result:number|null;readonly evaluation:CuFormulaEvaluation;}

export type CuPivotAggregate="count"|"sum"|"average"|"min"|"max";
export interface CuPivotConfig {rowField?:string;columnField?:string;valueField?:string;aggregate?:CuPivotAggregate;}
export interface CuPivotResult {columns:CuTableColumn[];rows:CuTableRecord[];total:number|null;count:number;error:string;}
export declare const PIVOT_AGGREGATES:readonly CuPivotAggregate[];
export declare function buildPivotTable(rows:object[],config?:CuPivotConfig):CuPivotResult;
export declare class CuPivotTable extends HTMLElement {rows:object[];fields:CuQueryField[];query:CuQueryValue;rowField:string;columnField:string;valueField:string;aggregate:CuPivotAggregate;readonly config:Required<CuPivotConfig>;readonly result:CuPivotResult;}
export declare function normalizeSheet(cells:unknown):string[][];
export declare function parseCellAddress(address:string):{row:number;column:number}|null;
export declare function calculateSheet(cells:unknown):(string|number)[][];
export declare class CuSpreadsheet extends CuDataGrid {cells:(string|number)[][];readonly computedCells:(string|number)[][];getCell(address:string):string|null;getComputedCell(address:string):string|number|null;setCell(address:string,value:unknown):boolean;}

export interface CuScheduleEvent {id:string;title:string;date:string;start:string;end:string;description?:string;}
export declare function normalizeScheduleEvents(events:unknown):Required<CuScheduleEvent>[];
export declare function scheduleDayEvents(events:unknown,date:string):Required<CuScheduleEvent>[];
export declare class CuScheduler extends HTMLElement {date:string;readonly:boolean;events:CuScheduleEvent[];readonly visibleEvents:Required<CuScheduleEvent>[];addEvent(event:CuScheduleEvent):boolean;removeEvent(id:string):boolean;}
export interface CuGanttTask {id:string;title:string;start:string;end:string;progress?:number;dependencies?:string[];}
export interface CuGanttRange {start:string;end:string;days:number;truncated:boolean;}
export declare function normalizeGanttTasks(tasks:unknown):Required<CuGanttTask>[];
export declare function ganttRange(tasks:unknown,start?:string,end?:string,fallback?:string):CuGanttRange;
export declare function ganttTaskSpan(task:CuGanttTask,range:CuGanttRange):{offset:number;width:number;clipped:boolean}|null;
export declare class CuGanttChart extends CuDataTable {tasks:CuGanttTask[];rangeStart:string;rangeEnd:string;readonly range:CuGanttRange;}

export interface CuDesktopCommand {value:string;label?:string;icon?:string;disabled?:boolean;}
export interface CuMenuGroup {id:string;label?:string;disabled?:boolean;items:CuDesktopCommand[];}
export declare function normalizeMenuGroups(groups:unknown):CuMenuGroup[];
export declare class CuMenuBar extends HTMLElement {groups:CuMenuGroup[];disabled:boolean;}
export interface CuRibbonTab {id:string;label?:string;disabled?:boolean;groups:{id:string;label?:string;commands:CuDesktopCommand[]}[];}
export declare function normalizeRibbonTabs(tabs:unknown):CuRibbonTab[];
export declare class CuRibbon extends HTMLElement {tabs:CuRibbonTab[];active:string;disabled:boolean;}
export interface CuTerminalLine {text:string;kind?:"command"|"output"|"error";}
export declare function normalizeTerminalLines(lines:unknown,max?:number):Required<CuTerminalLine>[];
export declare class CuTerminal extends HTMLElement {lines:(string|CuTerminalLine)[];disabled:boolean;readonly maxLines:number;readonly prompt:string;append(text:string,kind?:CuTerminalLine["kind"]):void;clear():boolean;submit(command:string):boolean;}
export interface CuManagedWindow {id:string;title?:string;closed?:boolean;}
export declare function resolveWindowId(windows:CuManagedWindow[],requested?:string):string;
export declare class CuWindowManager extends HTMLElement {active:string;readonly windows:CuManagedWindow[];layout:CuDockLayout["layout"];activateWindow(id:string):boolean;closeWindow(id:string):boolean;reopenWindow(id:string):boolean;}

export interface CuPdfDocument {pageCount:number;renderPage(page:number):string|Promise<string>;}
export declare function clampPdfPage(page:number,count:number):number;
export declare class CuPdfViewer extends HTMLElement {pages:string[];document:CuPdfDocument|null;page:number;readonly pageCount:number;goToPage(page:number):boolean;}
export interface CuCalendarResource {id:string;label?:string;}
export interface CuResourceEvent extends CuScheduleEvent {resourceId:string;}
export declare function normalizeResources(resources:unknown):Required<CuCalendarResource>[];
export declare function normalizeResourceEvents(events:unknown):Required<CuResourceEvent>[];
export declare class CuResourceCalendar extends HTMLElement {resources:CuCalendarResource[];events:CuResourceEvent[];date:string;resourceId:string;}
export declare function normalizeTimelineEntries(items:unknown):Required<CuTimelineItem>[];
export declare class CuTimelineEditor extends HTMLElement {items:CuTimelineItem[];readonly:boolean;edit(id:string):boolean;remove(id:string):boolean;}
export interface CuInspectorObject {id:string;label?:string;properties:CuPropertyItem[];}
export declare function normalizeInspectorObjects(objects:unknown):CuInspectorObject[];
export declare function resolveInspectorObject(objects:CuInspectorObject[],selected?:string):string;
export declare class CuPropertyInspector extends HTMLElement {objects:CuInspectorObject[];selected:string;readonly:boolean;selectObject(id:string):boolean;}

export declare class CuCommandConsole extends CuTerminal {commands:{value:string;label?:string;description?:string;group?:string;icon?:string;shortcut?:string;keywords?:string[];disabled?:boolean}[];showCommands():boolean;}
export interface CuShortcutItem {id:string;label?:string;shortcut?:string;disabled?:boolean;}
export declare function normalizeShortcut(value:unknown):string|null;
export declare function shortcutFromEvent(event:KeyboardEvent):string|null;
export declare function normalizeShortcutItems(items:unknown):Required<CuShortcutItem>[];
export declare class CuKeyboardShortcutEditor extends HTMLElement {items:CuShortcutItem[];disabled:boolean;edit(id:string):boolean;setShortcut(id:string,value:string):boolean;}
export interface CuPaletteColor {value:string;label?:string;}
export declare function normalizePaletteColors(colors:unknown):Required<CuPaletteColor>[];
export declare class CuColorPalette extends HTMLElement {colors:(string|CuPaletteColor)[];value:string;disabled:boolean;}
export declare const DEFAULT_FONT_FAMILIES:readonly string[];
export declare function normalizeFontFamilies(fonts:unknown):string[];
export declare class CuFontPicker extends HTMLElement {fonts:string[];value:string;disabled:boolean;}

export interface CuChartConfig {title:string;description:string;type:"bar"|"line";showTable:boolean;}
export declare function normalizeChartConfig(value?:Partial<CuChartConfig>):CuChartConfig;
export declare class CuChartEditor extends HTMLElement {items:CuChartItem[];config:CuChartConfig;readonly:boolean;}
export interface CuNotificationPreferences {enabled:boolean;desktop:boolean;sound:boolean;email:boolean;digest:"off"|"daily"|"weekly";}
export declare const DEFAULT_NOTIFICATION_SETTINGS:Readonly<CuNotificationPreferences>;
export declare function normalizeNotificationSettings(value?:Partial<CuNotificationPreferences>):CuNotificationPreferences;
export declare class CuNotificationSettings extends HTMLElement {value:CuNotificationPreferences;disabled:boolean;}
export declare function normalizeGalleryItems(items:unknown):Required<CuCarouselItem>[];
export declare class CuImageGallery extends HTMLElement {items:CuCarouselItem[];active:number;loop:boolean;goTo(index:number):boolean;}
export declare const FILE_MANAGER_ACTIONS:readonly string[];
export declare function fileManagerCommands(entry?:CuFileEntry|null):CuDesktopCommand[];
export declare class CuFileManager extends CuFileExplorer {readonly selectedEntry:CuFileEntry|null;requestAction(action:string):boolean;}

export interface CuThemeConfig {accent:string;font:string;radius:number;}
export declare const DEFAULT_THEME_CONFIG:Readonly<CuThemeConfig>;
export declare function normalizeThemeConfig(value?:Partial<CuThemeConfig>):CuThemeConfig;
export declare function themeTokenValues(value?:Partial<CuThemeConfig>):Record<string,string>;
export declare class CuThemeEditor extends HTMLElement {value:CuThemeConfig;readonly tokens:Record<string,string>;readonly:boolean;}
export type CuDesignComponentType="button"|"card"|"text-field";
export interface CuDesignComponent {id:string;type:CuDesignComponentType;label?:string;value?:string;disabled?:boolean;variant?:"accent"|"outline"|"subtle";}
export declare const DESIGN_COMPONENT_TYPES:readonly CuDesignComponentType[];
export declare function normalizeDesignComponents(items:unknown):Required<CuDesignComponent>[];
export declare class CuComponentDesigner extends HTMLElement {items:CuDesignComponent[];selected:string;readonly:boolean;addComponent(type:CuDesignComponentType):boolean;removeComponent(id:string):boolean;}
export declare const DEFAULT_WORKFLOW_LANES:readonly CuKanbanLane[];
export declare class CuWorkflowEditor extends HTMLElement {lanes:CuKanbanLane[];items:CuKanbanItem[];readonly:boolean;addTask(title:string,laneId:string):boolean;removeTask(id:string):boolean;}
export interface CuNodeGraph {nodes:{id:string;label?:string}[];edges:{from:string;to:string}[];}
export declare function normalizeNodeGraph(value?:CuNodeGraph):CuNodeGraph;
export declare class CuNodeEditor extends HTMLElement {value:CuNodeGraph;readonly:boolean;addNode():boolean;removeNode(id:string):boolean;connectNodes(from:string,to:string):boolean;disconnectNodes(from:string,to:string):boolean;}

export declare function resetShortcutItems(items:unknown,defaults:unknown):Required<CuShortcutItem>[]|null;
export declare class CuShortcutSettings extends HTMLElement {items:CuShortcutItem[];defaults:CuShortcutItem[];disabled:boolean;resetDefaults():boolean;}
export declare class CuDocumentWorkspace extends HTMLElement {pages:string[];document:CuPdfDocument|null;page:number;notes:string;active:"document"|"notes";readonly:boolean;}
export declare function normalizeInspectorRows(rows:unknown):Record<string,unknown>[];
export declare function inspectorFields(rows:Record<string,unknown>[]):CuQueryField[];
export declare class CuDataInspector extends HTMLElement {rows:Record<string,unknown>[];query:CuQueryValue;readonly visibleRows:Record<string,unknown>[];inspectRecord(id:string):boolean;}
export type CuAPIMethod="GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"HEAD"|"OPTIONS";
export interface CuAPIRequest {method:CuAPIMethod;url:string;body:string;}
export interface CuAPIResponse {status:number;body:string;contentType:string;}
export declare const API_METHODS:readonly CuAPIMethod[];
export declare function normalizeApiRequest(value?:Partial<CuAPIRequest>):CuAPIRequest;
export declare function validateApiRequest(value?:Partial<CuAPIRequest>):{valid:boolean;error:string};
export declare function normalizeApiResponse(value:unknown):CuAPIResponse|null;
export declare class CuAPIExplorer extends HTMLElement {request:CuAPIRequest;response:CuAPIResponse|null;disabled:boolean;loading:boolean;submit():boolean;}

export interface CuMediaEntry extends CuFileEntry {mediaType?:"image"|"audio"|"video"|"";src?:string;poster?:string;}
export declare function normalizeMediaEntries(items:unknown):CuMediaEntry[];
export declare class CuMediaLibrary extends HTMLElement {items:CuMediaEntry[];selected:string;selectMedia(id:string):boolean;}
export interface CuDashboardWidget {id:string;config:CuChartConfig;items:CuChartItem[];}
export declare function normalizeDashboardWidgets(items:unknown):CuDashboardWidget[];
export declare class CuDashboardDesigner extends HTMLElement {widgets:CuDashboardWidget[];selected:string;readonly:boolean;addWidget():boolean;removeWidget(id:string):boolean;}
export type CuFormFieldType="text"|"email"|"number"|"textarea"|"checkbox";
export interface CuDesignFormField {id:string;name:string;type:CuFormFieldType;label?:string;required?:boolean;value?:string|boolean|number;}
export declare const FORM_FIELD_TYPES:readonly CuFormFieldType[];
export declare function normalizeFormFields(items:unknown):Required<CuDesignFormField>[];
export declare class CuFormDesigner extends HTMLElement {fields:CuDesignFormField[];readonly:boolean;addField(type:CuFormFieldType):boolean;removeField(id:string):boolean;}
export type CuSchemaFieldType="string"|"number"|"integer"|"boolean"|"array"|"object"|"null";
export interface CuObjectSchema {type:"object";properties:Record<string,{type:CuSchemaFieldType;description?:string}>;required:string[];}
export declare const SCHEMA_FIELD_TYPES:readonly CuSchemaFieldType[];
export declare function normalizeObjectSchema(value?:Partial<CuObjectSchema>):CuObjectSchema;
export declare class CuSchemaEditor extends HTMLElement {value:CuObjectSchema;readonly:boolean;addProperty(name:string,type:CuSchemaFieldType):boolean;removeProperty(name:string):boolean;}

export interface CuDatabaseTable {id:string;label?:string;schema?:string;rows:Record<string,unknown>[];}
export declare function normalizeDatabaseTables(tables:unknown):Required<CuDatabaseTable>[];
export declare class CuDatabaseExplorer extends HTMLElement {tables:CuDatabaseTable[];selected:string;query:CuQueryValue;selectTable(id:string):boolean;}
export interface CuApplicationSection {id:string;label?:string;disabled?:boolean;}
export declare function normalizeApplicationSections(items:unknown):Required<CuApplicationSection>[];
export declare class CuApplicationShell extends HTMLElement {sections:CuApplicationSection[];groups:CuMenuGroup[];commands:CuPaletteCommand[];active:string;selectSection(id:string):boolean;showCommands():boolean;}
export interface CuReport {config:Required<CuPivotConfig>;query:CuQueryValue;chartType:"bar"|"line";result:CuPivotResult;}
export declare function reportChartItems(result:CuPivotResult):CuChartItem[];
export declare class CuReportBuilder extends HTMLElement {rows:Record<string,unknown>[];query:CuQueryValue;config:CuPivotConfig;chartType:"bar"|"line";readonly result:CuPivotResult;readonly report:CuReport;}
export interface CuAutomationValue {graph:CuNodeGraph;lanes:CuKanbanLane[];tasks:CuKanbanItem[];}
export interface CuAutomationAnalysis {valid:boolean;cyclic:boolean;order:string[];nodeCount:number;edgeCount:number;}
export declare function analyzeAutomationGraph(value:CuNodeGraph):CuAutomationAnalysis;
export declare class CuAutomationDesigner extends HTMLElement {value:CuAutomationValue;readonly analysis:CuAutomationAnalysis;readonly:boolean;requestRun():boolean;}
