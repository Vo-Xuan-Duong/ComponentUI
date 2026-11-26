/** Curated names from Lucide. Bundle uses ISC/MIT licenses (packages/icons/LICENSE). */
export type IconName = "eye" | "eye-off" | "upload" | "file" | "minus" | "plus" | "pencil" | "ellipsis" | "check" | "sparkles" | "arrow-up-right" | "palette" | "panel-left" | "settings" | "chevron-right" | "info" | "bell" | "folder" | "search" | "circle-check" | "x" | "menu" | "save" | "trash" | "copy" | "sliders-horizontal" | "chevron-down" | "shield-check" | "folder-open" | "star";
export type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];
export declare const ICON_NODES: Readonly<Record<IconName, readonly IconNode[]>>;
export declare const ICON_NAMES: readonly IconName[];
export declare function getIconNodes(name: string): readonly IconNode[] | null;
