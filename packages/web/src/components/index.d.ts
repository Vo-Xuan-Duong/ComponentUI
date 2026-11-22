
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

declare global {
  interface HTMLElementTagNameMap {
    "cu-button": CuButton;
    "cu-text-field": CuTextField;
    "cu-checkbox": CuCheckbox;
    "cu-switch": CuSwitch;
    "cu-dialog": CuDialog;
  }
}
