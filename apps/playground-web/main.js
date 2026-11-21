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
navLinks.forEach(link => link.addEventListener("click", () => {
  navLinks.forEach(other => { other.classList.remove("is-active"); other.removeAttribute("aria-current"); });
  link.classList.add("is-active");
  link.setAttribute("aria-current", "location");
}));

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
  badge.dataset.tone = "warning";
  badge.textContent = component.priority + " · Planned";
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
  document.getElementById("catalog-status").textContent = `${matches.length} of ${allComponents.length} planned`;
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
    searchInput.placeholder = `Search ${allComponents.length} planned components…`;
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
