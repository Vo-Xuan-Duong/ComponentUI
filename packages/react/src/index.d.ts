import type * as React from "react";
import type { IconName } from "@componentui/icons";

export interface CuEventDetails {
  value?: string | number;
  valueAsNumber?: number;
  checked?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  navigationOpen?: boolean;
  withoutNavigation?: boolean;
  index?: number;
  label?: string;
  type?: string;
  returnValue?: string;
  key?: string;
  direction?: "asc" | "desc";
  page?: number;
  selectedIds?: string[];
  row?: Record<string,unknown>;
  query?: string;
  expanded?: boolean;
  visible?: boolean;
  open?: boolean;
  files?: File[];
  count?: number;
  valid?: boolean;
}
export type CuEvent = CustomEvent<CuEventDetails>;
export type ComponentUIProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  children?: React.ReactNode;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  value?: string | number | null;
  checked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  open?: boolean;
  active?: number;
  max?: number;
  min?: number | string;
  step?: number | string;
  variant?: string;
  size?: string | number;
  tone?: string;
  type?: string;
  iconName?: IconName;
  columns?: {key:string;label?:string;sortable?:boolean}[];
  rows?: Record<string,unknown>[];
  page?: number;
  onCuPress?: (event: CuEvent) => void;
  onCuInput?: (event: CuEvent) => void;
  onCuSearch?: (event: CuEvent) => void;
  onCuVisibilityChange?: (event: CuEvent) => void;
  onCuNavigationToggle?: (event: CuEvent) => void;
  onCuChange?: (event: CuEvent) => void;
  onCuOpen?: (event: CuEvent) => void;
  onCuClose?: (event: CuEvent) => void;
  onCuCancel?: (event: CuEvent) => void;
  onCuSelect?: (event: CuEvent) => void;
  onCuSort?: (event: CuEvent) => void;
  onCuPageChange?: (event: CuEvent) => void;
  onCuSelectionChange?: (event: CuEvent) => void;
  onCuRowActivate?: (event: CuEvent) => void;
  onCuToggle?: (event: CuEvent) => void;
  onCuDismiss?: (event: CuEvent) => void;
};
export type ReactCuComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ComponentUIProps> & React.RefAttributes<HTMLElement>
>;
export declare const REACT_TAGS: Readonly<Record<string, string>>;
export declare const REACT_EVENT_PROPS: Readonly<Record<string, string>>;
export declare function subscribeCuEvents(
  element: EventTarget | null, handlers?: Record<string, ((event: Event) => void) | undefined>
): () => void;
export declare function assignCuProperties(
  element: HTMLElement | null, tagName: string, props?: Record<string, unknown>
): void;
export declare function createReactComponent(
  React: typeof import("react"), tagName: string
): ReactCuComponent;
export declare function createReactComponents(React: typeof import("react")):
  Record<"Button" | "TextField" | "Checkbox" | "Switch" | "Dialog" |
  "TextArea" | "NumberField" | "SearchBox" |
  "PasswordField" | "FilePicker" | "AppShell" | "Select" | "Radio" | "RadioGroup" | "Tab" | "Tabs" | "Tooltip" |
  "Popover" | "DatePicker" | "Slider" | "ProgressBar" | "Badge" |
  "Avatar" | "Menu" | "MenuItem" | "Icon" | "Card" | "Divider" |
  "Skeleton" | "Spinner" | "Alert" | "Breadcrumb" | "BreadcrumbItem" | "DataTable" | "TreeView" | "TreeItem" |
  "ListBox" | "ListOption" | "Combobox" | "ComboOption" | "ContextMenu", ReactCuComponent>;
