import type * as React from "react";
import type { IconName } from "@componentui/icons";

export interface CuEventDetails {
  value?: string | number;
  valueAsNumber?: number;
  checked?: boolean;
  selected?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  navigationOpen?: boolean;
  withoutNavigation?: boolean;
  index?: number;
  label?: string;
  action?: string;
  type?: string;
  returnValue?: string;
  key?: string;
  direction?: "asc" | "desc";
  page?: number;
  selectedIds?: string[];
  row?: Record<string,unknown>;
  column?: {key:string;label?:string;sortable?:boolean;filterable?:boolean}|null;
  filters?: Record<string,unknown[]|{operator:string;value?:string|number;value2?:string|number}>;
  filteredCount?: number;
  totalCount?: number;
  hiddenKeys?: string[];
  visibleKeys?: string[];
  query?: string;
  keywords?: string;
  searchable?: boolean;
  expanded?: boolean;
  visible?: boolean;
  open?: boolean;
  files?: File[];
  count?: number;
  total?: number;
  groups?: number;
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
  selected?: boolean;
  selectable?: boolean;
  removable?: boolean;
  columns?: {key:string;label?:string;sortable?:boolean;filterable?:boolean}[];
  rows?: Record<string,unknown>[];
  rowActions?: {value:string;label?:string;
    disabled?:boolean|((row:Record<string,unknown>)=>boolean)}[];
  headerActions?: {value:string;label?:string;
    disabled?:boolean|((column:{key:string;label?:string;sortable?:boolean;filterable?:boolean}|null)=>boolean)}[];
  columnFilters?: Record<string,unknown[]|{operator:"contains"|"not-contains"|"starts-with"|"ends-with"|"equals"|"not-equals"|"greater-than"|"greater-or-equal"|"less-than"|"less-or-equal"|"between"|"is-blank"|"is-not-blank";value?:string|number;value2?:string|number}>;
  page?: number;
  onCuPress?: (event: CuEvent) => void;
  onCuInput?: (event: CuEvent) => void;
  onCuSearch?: (event: CuEvent) => void;
  onCuVisibilityChange?: (event: CuEvent) => void;
  onCuNavigationToggle?: (event: CuEvent) => void;
  onCuFilter?: (event: CuEvent) => void;
  onCuChange?: (event: CuEvent) => void;
  onCuOpen?: (event: CuEvent) => void;
  onCuClose?: (event: CuEvent) => void;
  onCuCancel?: (event: CuEvent) => void;
  onCuSelect?: (event: CuEvent) => void;
  onCuSort?: (event: CuEvent) => void;
  onCuPageChange?: (event: CuEvent) => void;
  onCuSelectionChange?: (event: CuEvent) => void;
  onCuRowActivate?: (event: CuEvent) => void;
  onCuRowAction?: (event: CuEvent) => void;
  onCuHeaderAction?: (event: CuEvent) => void;
  onCuColumnVisibilityChange?: (event: CuEvent) => void;
  onCuFilterChange?: (event: CuEvent) => void;
  onCuToggle?: (event: CuEvent) => void;
  onCuDismiss?: (event: CuEvent) => void;
  onCuRemove?: (event: CuEvent) => void;
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
  "PasswordField" | "FilePicker" | "AppShell" |
  "NavigationView" | "SettingsPage" | "SettingsGroup" | "SettingsItem" | "Select" | "Radio" | "RadioGroup" | "Tab" | "Tabs" | "Tooltip" |
  "Popover" | "DatePicker" | "Slider" | "ProgressBar" | "Badge" | "Chip" | "Tag" | "ProgressRing" |
  "Avatar" | "Menu" | "MenuItem" | "Icon" | "Card" | "Divider" |
  "Skeleton" | "Spinner" | "Alert" | "Breadcrumb" | "BreadcrumbItem" | "DataTable" | "TreeView" | "TreeItem" |
  "ListBox" | "ListOption" | "Combobox" | "ComboOption" | "ContextMenu", ReactCuComponent>;
