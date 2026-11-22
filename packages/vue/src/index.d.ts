import type { App, Directive } from "vue";
export type CuModelProperty = "value" | "checked" | "active" | "open";
export type CuModelEvent = "cu-input" | "cu-change" | "cu-open" | "cu-close";
export interface CuModelSpec<T = unknown> {
  value: T;
  property?: CuModelProperty;
  event?: CuModelEvent;
  onUpdate?: (value: T, event: Event) => void;
}
export declare function isComponentUIElement(tag: string): boolean;
export declare function extractCuValue(event: Event, property?: CuModelProperty): unknown;
export declare function normalizeCuModel(binding: CuModelSpec | {value: CuModelSpec}): CuModelSpec;
export declare function updateCuModel(element: HTMLElement, binding: CuModelSpec | {value: CuModelSpec}): void;
export declare function unbindCuModel(element: HTMLElement): void;
export declare const vCuModel: Directive<HTMLElement, CuModelSpec>;
export declare const ComponentUIVuePlugin: {install(app: App): void};
