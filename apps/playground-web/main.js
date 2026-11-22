import "../../packages/web/src/components/index.js";
import {
  enhanceMenu, enhancePopover, enhanceDialogTrigger,
  enhancePagination, enhanceCommandPalette
} from "../../packages/web/src/interactions.js";

import {
  applyPreferences, readPreferences,
  THEME_OPTIONS, DENSITY_OPTIONS, ACCENT_OPTIONS
} from "../../packages/theme/src/theme.js";

const root = document.documentElement;
const prefsKey = "componentui.playground.preferences.v1";
const themeControl = document.getElementById("theme-select");
const densityControl = document.getElementById("density-select");
const swatches = [...document.querySelectorAll(".accent-swatch")];

function loadPreferences() {
  try {
    const value = JSON.parse(localStorage.getItem(prefsKey) || "null");
    if (!value || typeof value !== "object") return {};
    return {
      theme: THEME_OPTIONS.includes(value.theme) ? value.theme : "system",
      density: DENSITY_OPTIONS.includes(value.density) ? value.density : "comfortable",
      accent: ACCENT_OPTIONS.includes(value.accent) ? value.accent : "blue"
    };
  } catch {
    return {};
  }
}

function setPreferences(next) {
  const state = applyPreferences(root, { ...readPreferences(root), ...next });
  themeControl.value = state.theme;
  densityControl.value = state.density;
  swatches.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.accent === state.accent)));
  const heights = { compact: 32, comfortable: 40, touch: 48 };
  document.getElementById("density-readout").textContent =
    `${state.density[0].toUpperCase() + state.density.slice(1)} · ${heights[state.density]}px controls`;
  try { localStorage.setItem(prefsKey, JSON.stringify(state)); } catch { /* Storage can be blocked. */ }
}

setPreferences(loadPreferences());
themeControl.addEventListener("change", () => setPreferences({ theme: themeControl.value }));
densityControl.addEventListener("change", () => setPreferences({ density: densityControl.value }));
swatches.forEach(button => {
  button.addEventListener("click", () => setPreferences({ accent: button.dataset.accent }));
});

const navLinks = [...document.querySelectorAll(".side-link")];
function syncActiveNavigation() {
  const hash = location.hash || "#overview";
  navLinks.forEach(link => {
    const active = link.getAttribute("href") === hash;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange", syncActiveNavigation);
syncActiveNavigation();

const dialog = document.getElementById("sample-dialog");
document.getElementById("open-dialog").addEventListener("click", () => dialog.showModal());
dialog.addEventListener("close", () => {
  if (dialog.returnValue === "confirm") showToast("Confirmed", "The native dialog action was confirmed.");
});

const toastContainer = document.getElementById("toast-container");
function showToast(title, message = "ComponentUI interaction preview.") {
  const toast = document.createElement("div");
  toast.className = "cu-toast";
  toast.setAttribute("role", "status");
  const mark = document.createElement("span");
  mark.textContent = "●";
  mark.setAttribute("aria-hidden", "true");
  mark.style.color = "var(--cu-accent)";
  const text = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const desc = document.createElement("p");
  desc.textContent = message;
  text.append(strong, desc);
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  close.setAttribute("aria-label", "Dismiss notification");
  close.addEventListener("click", () => toast.remove());
  toast.append(mark, text, close);
  toastContainer.append(toast);
  const timeout = setTimeout(() => toast.remove(), 4500);
  toast.addEventListener("click", event => {
    if (event.target === close) clearTimeout(timeout);
  });
}
document.getElementById("show-toast").addEventListener("click", () => showToast("Notification delivered", "The toast can be dismissed."));
document.querySelectorAll("[data-toast]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});
document.getElementById("sample-form").addEventListener("submit", event => {
  event.preventDefault();
  showToast("Example saved", "Form validation passed; no data was sent to a server.");
});
const range = document.getElementById("volume-range");
range.addEventListener("input", () => {
  document.getElementById("volume-value").value = range.value + "%";
});

const tabs = [...document.querySelectorAll('#demo-tabs [role="tab"]')];
function selectTab(tab, moveFocus = false) {
  tabs.forEach(button => {
    const active = button === tab;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    document.getElementById(button.getAttribute("aria-controls")).hidden = !active;
  });
  if (moveFocus) tab.focus();
}
tabs.forEach(tab => tab.addEventListener("click", () => selectTab(tab)));
document.getElementById("demo-tabs").addEventListener("keydown", event => {
  const index = tabs.indexOf(document.activeElement);
  if (index === -1) return;
  let next = -1;
  if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
  if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = tabs.length - 1;
  if (next !== -1) { event.preventDefault(); selectTab(tabs[next], true); }
});

const catalogContainer = document.getElementById("catalog-results");
const searchInput = document.getElementById("catalog-query");
const categorySelect = document.getElementById("catalog-category");
const prioritySelect = document.getElementById("catalog-priority");
let allComponents = [];

function createCatalogEntry(component) {
  const entry = document.createElement("div");
  entry.className = "catalog-entry";
  const body = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = component.name;
  const meta = document.createElement("small");
  meta.textContent = component.category;
  body.append(name, meta);
  const badge = document.createElement("span");
  badge.className = "cu-badge";
  badge.dataset.tone = component.status === "preview" ? "accent" : component.status === "ready" ? "success" : "warning";
  const statusLabel = component.status.charAt(0).toUpperCase() + component.status.slice(1);
  badge.textContent = component.priority + " · " + statusLabel;
  entry.append(body, badge);
  return entry;
}
function renderCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const matches = allComponents.filter(c =>
    (!query || c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)) &&
    (!category || c.category === category) &&
    (!priority || c.priority === priority)
  );
  const fragment = document.createDocumentFragment();
  matches.forEach(c => fragment.append(createCatalogEntry(c)));
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = "No components match these filters.";
    fragment.append(empty);
  }
  catalogContainer.replaceChildren(fragment);
  document.getElementById("catalog-status").textContent = `${matches.length} of ${allComponents.length} catalog entries`;
}
[searchInput, categorySelect, prioritySelect].forEach(control => control.addEventListener("input", renderCatalog));

async function loadCatalog() {
  try {
    const response = await fetch("../../design-system/components/catalog.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    allComponents = catalog.groups.flatMap(group =>
      group.components.map(component => ({ ...component, category: group.category }))
    );
    catalog.groups.forEach(group => {
      const option = document.createElement("option");
      option.value = group.category;
      option.textContent = group.category;
      categorySelect.append(option);
    });
    document.getElementById("metric-components").textContent = String(allComponents.length);
    document.getElementById("metric-categories").textContent = String(catalog.groups.length);
    searchInput.placeholder = `Search ${allComponents.length} catalog entries…`;
    renderCatalog();
  } catch {
    catalogContainer.replaceChildren();
    const error = document.createElement("p");
    error.className = "catalog-empty";
    error.textContent = "Catalog unavailable. Run the included local preview server instead of opening index.html directly.";
    catalogContainer.append(error);
    document.getElementById("catalog-status").textContent = "Catalog unavailable";
  }
}
loadCatalog();


// Fluent Calm — reference components. These controllers can be imported
// separately by other DOM-based apps; no framework is required.
enhanceMenu(document.querySelector("[data-cu-menu]"), {
  onSelect: action => showToast(action, `${action} selected in the menu preview.`)
});
enhancePopover(document.querySelector("[data-cu-popover]"));

const drawer = document.getElementById("sample-drawer");
enhanceDialogTrigger(document.getElementById("open-drawer"), drawer);
document.getElementById("drawer-save").addEventListener("click", () => {
  drawer.close("saved");
  showToast("Drawer updated", "Example settings were not sent to a server.");
});

const paginationItems = [
  { name:"Button", category:"Actions" },
  { name:"TextField", category:"Inputs" },
  { name:"Checkbox", category:"Inputs" },
  { name:"Accordion", category:"Layouts" },
  { name:"Popover", category:"Overlays" },
  { name:"Pagination", category:"Navigation" },
  { name:"Dialog", category:"Overlays" },
  { name:"Tooltip", category:"Overlays" },
  { name:"Drawer", category:"Overlays" },
  { name:"Menu", category:"Navigation" },
  { name:"CommandPalette", category:"Navigation" },
  { name:"EmptyState", category:"Data display" }
];
enhancePagination(document.getElementById("demo-pagination"), {
  items: paginationItems,
  pageSize: 4,
  renderItem(item) {
    const row = document.createElement("div");
    row.className = "cu-page-entry";
    const title = document.createElement("strong");
    title.textContent = item.name;
    const category = document.createElement("small");
    category.textContent = item.category;
    row.append(title, category);
    return row;
  }
});

const paletteCommands = [
  { label:"Open overview", description:"Project introduction and metrics", target:"overview", keywords:["home", "dashboard"] },
  { label:"Browse actions", description:"Buttons, variants and sizes", target:"controls", keywords:["button"] },
  { label:"Browse forms", description:"Inputs, checkboxes and switches", target:"forms", keywords:["input", "field"] },
  { label:"Browse navigation", description:"Tabs and settings", target:"navigation", keywords:["tabs"] },
  { label:"Browse data", description:"Tables, badges and progress", target:"data", keywords:["table"] },
  { label:"Browse feedback", description:"Dialog, alerts and toast", target:"feedback", keywords:["notification"] },
  { label:"Browse more components", description:"Accordion, Menu, Drawer and Pagination", target:"patterns", keywords:["popover", "command"] },
  { label:"Search component catalog", description:"Filter 128 planned components", target:"catalog", keywords:["inventory"] },
  { label:"Switch to Light Mode", description:"Change the gallery theme", action:"light", keywords:["theme", "appearance"] },
  { label:"Switch to Dark Mode", description:"Change the gallery theme", action:"dark", keywords:["theme", "appearance"] },
  { label:"Follow System Theme", description:"Use operating system theme", action:"system", keywords:["theme", "appearance"] }
];
const commandPalette = enhanceCommandPalette(document.getElementById("command-palette"), {
  trigger: document.getElementById("open-command"),
  commands: paletteCommands,
  onSelect(command) {
    if (command.action) {
      setPreferences({ theme: command.action });
      showToast("Theme updated", `Theme: ${command.action}`);
    } else if (command.target) {
      location.hash = "#" + command.target;
      document.getElementById(command.target)?.scrollIntoView({ block:"start" });
      syncActiveNavigation();
    }
  }
});
document.getElementById("open-command-secondary").addEventListener("click", commandPalette.open);


// First reusable Custom Elements. All form values are collected by native
// FormData through ElementInternals, not copied from Shadow DOM manually.
const wcForm = document.getElementById("wc-form");
const wcResult = document.getElementById("wc-result");
wcForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(wcForm).entries());
  wcResult.textContent = JSON.stringify(data, null, 2);
  showToast("Web Component form submitted", "FormData was collected without a backend request.");
});
wcForm.addEventListener("reset", () => {
  wcResult.textContent = "Form reset to its initial values.";
});
document.getElementById("wc-action").addEventListener("cu-press", () => {
  showToast("Custom Element button", "cu-press was dispatched from <cu-button>.");
});
const wcDialog = document.getElementById("wc-dialog");
document.getElementById("wc-open-dialog").addEventListener("cu-press", () => wcDialog.showModal());
document.getElementById("wc-close-dialog").addEventListener("cu-press", () => wcDialog.close("confirmed"));
wcDialog.addEventListener("cu-close", event => {
  if (event.detail.returnValue === "confirmed") {
    showToast("Custom Dialog closed", "cu-close reported the confirmed return value.");
  }
});


// Second native Web Component batch: native option/radio FormData,
// slotted accessible tabs, hover/focus tooltip, non-modal popover.
const wcChoiceForm = document.getElementById("wc-choice-form");
const wcChoiceResult = document.getElementById("wc-choice-result");
wcChoiceForm.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(wcChoiceForm);
  wcChoiceResult.textContent = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);
  showToast("Choices captured", "Select and RadioGroup contributed values through ElementInternals.");
});
const wcTabs = document.getElementById("wc-tabs");
wcTabs.addEventListener("cu-change", event => {
  document.getElementById("wc-tabs-result").textContent =
    "Selected tab: " + event.detail.label;
});
const wcPopover = document.getElementById("wc-popover");
wcPopover.addEventListener("cu-open", () => {
  document.getElementById("wc-popover-result").textContent = "Popover opened";
});
wcPopover.addEventListener("cu-close", () => {
  document.getElementById("wc-popover-result").textContent = "Popover closed";
});
document.getElementById("wc-popover-close").addEventListener("click", () => wcPopover.hide());


// Third Web Components wave: DatePicker, Slider, ProgressBar, Badge, Avatar, Menu.
const wcUtilityForm = document.getElementById("wc-utility-form");
wcUtilityForm.addEventListener("submit",event => {
  event.preventDefault();
  document.getElementById("wc-utility-result").textContent =
    JSON.stringify(Object.fromEntries(new FormData(wcUtilityForm).entries()),null,2);
  showToast("Form values collected","DatePicker and Slider participated in native FormData.");
});
const wcProgress = document.getElementById("wc-progress");
document.getElementById("wc-progress-step").addEventListener("cu-press",() => {
  wcProgress.value = Math.min(100,(wcProgress.value ?? 0)+15);
});
document.getElementById("wc-progress-reset").addEventListener("cu-press",() => {
  wcProgress.value = 0;
});
document.getElementById("wc-menu").addEventListener("cu-select",event => {
  document.getElementById("wc-menu-result").textContent =
    "Action: "+event.detail.label+" ("+event.detail.value+")";
  showToast("Menu selection",event.detail.label);
});
