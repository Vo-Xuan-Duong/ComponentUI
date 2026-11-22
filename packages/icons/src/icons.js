/**
 * Curated Lucide icon nodes (official SVG sources).
 * Source: https://github.com/lucide-icons/lucide/tree/main/icons
 * Copyright Lucide contributors; Feather-derived icons have additional MIT terms.
 * Complete upstream license: ../LICENSE.
 *
 * Works in vanilla JS and framework renderers without a runtime network request.
 * Render with createElementNS (no unsanitized string interpolation).
 */
import { ACTION_ICONS } from "./data/actions.js";
import { NAVIGATION_ICONS } from "./data/navigation.js";
import { UTILITY_ICONS } from "./data/utility.js";
import { WORKFLOW_ICONS } from "./data/workflow.js";

export const ICON_NODES = Object.freeze({
  ...ACTION_ICONS, ...NAVIGATION_ICONS, ...UTILITY_ICONS, ...WORKFLOW_ICONS
});
export const ICON_NAMES = Object.freeze(Object.keys(ICON_NODES));
export function getIconNodes(name) {
  return typeof name === "string" && Object.hasOwn(ICON_NODES, name) ? ICON_NODES[name] : null;
}
