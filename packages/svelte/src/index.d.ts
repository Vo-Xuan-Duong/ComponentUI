import type { Action } from "svelte/action";

export type CuModelProperty = "value" | "checked" | "active";
export type CuModelEvent = "cu-input" | "cu-change" | "cu-select";
export interface CuModelConfig<T = unknown> {
  value: T;
  property?: CuModelProperty;
  event?: CuModelEvent;
  onUpdate?: (value: T, event: CustomEvent) => void;
}
export declare function normalizeCuBinding<T>(config: CuModelConfig<T>):
  Required<Pick<CuModelConfig<T>, "property" | "event">> & CuModelConfig<T>;
export declare const cuModel: Action<HTMLElement, CuModelConfig>;
export declare const cuEvents: Action<HTMLElement,
  Record<string, ((event: CustomEvent) => void) | undefined>>;
