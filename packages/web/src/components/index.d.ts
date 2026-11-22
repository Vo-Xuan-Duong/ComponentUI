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


export interface CuTableColumn { key:string;label?:string;sortable?:boolean; }
export type CuTableRecord = {id?:string|number;[key:string]:unknown};
export declare class CuDataTable extends HTMLElement {
  rows:CuTableRecord[];
  columns:CuTableColumn[];
  page:number;
  readonly sortKey:string;
  readonly sortDirection:"asc"|"desc";
  readonly selectedIds:string[];
  clearSelection():void;
}
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
  showAt(x:number,y:number):void;
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
