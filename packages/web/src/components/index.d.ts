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

declare global {
  interface HTMLElementTagNameMap {
    "cu-button": CuButton;
    "cu-text-field": CuTextField;
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
  }
}

export declare class CuIcon extends HTMLElement {
  name: IconName;
}
