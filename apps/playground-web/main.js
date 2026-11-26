import "../../packages/web/src/components/index.js";
import { applyFilterBar } from "../../packages/web/src/components/filter-bar.js";
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
themeControl.addEventListener("cu-change", event => setPreferences({ theme: event.detail.value }));
densityControl.addEventListener("cu-change", event => setPreferences({ density: event.detail.value }));
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

// Visual Quality Lab: event feedback keeps each active control demonstrable.
const qualityResult=document.getElementById("quality-result");
const qualityForm=document.getElementById("quality-form");
const qualityFormResult=document.getElementById("quality-form-result");
qualityForm.addEventListener("submit",event=>{
  event.preventDefault();
  qualityFormResult.textContent="Valid form: "+Array.from(new FormData(qualityForm).keys()).join(", ");
});
qualityForm.addEventListener("invalid",()=>{
  qualityFormResult.textContent="Check the highlighted fields.";
},true);
qualityForm.addEventListener("reset",()=>{
  qualityFormResult.textContent="Form reset.";
});
const qualityTable=document.getElementById("quality-data-table");
qualityTable.columns=[{key:"name",label:"Name"},{key:"state",label:"Status"}];
const qualityRows=[{id:"1",name:"Workspace",state:"Ready"},{id:"2",name:"Design system",state:"Active"}];
function setQualityData(state){
  qualityTable.error=state==="error"?"Could not load records.":"";
  qualityTable.loading=state==="loading";
  qualityTable.rows=state==="empty"?[]:qualityRows;
}
for(const state of ["loading","error","empty","ready"])
  document.getElementById("quality-data-"+state).addEventListener("cu-press",()=>setQualityData(state));
qualityTable.addEventListener("cu-retry",()=>setQualityData("ready"));
setQualityData("ready");

for(const [id,label] of [
  ["quality-primary","Primary action"],
  ["quality-standard","Secondary action"],
  ["quality-outline","Outline action"],
  ["quality-danger","Destructive action"]
]){
  document.getElementById(id).addEventListener("cu-press",()=>{
    qualityResult.textContent=label+" pressed";
  });
}
document.getElementById("quality-select").addEventListener("cu-change",event=>{
  qualityResult.textContent="Framework selected: "+event.detail.value;
});
document.getElementById("quality-field").addEventListener("cu-input",event=>{
  qualityResult.textContent="Workspace name length: "+event.detail.value.length;
});


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
  const mark = document.createElement("cu-icon");
  mark.setAttribute("name", "info");
  mark.setAttribute("size", "18");
  const text = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const desc = document.createElement("p");
  desc.textContent = message;
  text.append(strong, desc);
  const close = document.createElement("button");
  close.type = "button";
  const closeIcon = document.createElement("cu-icon");
  closeIcon.setAttribute("name", "x");
  closeIcon.setAttribute("size", "16");
  close.append(closeIcon);
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
searchInput.addEventListener("cu-input", renderCatalog);
categorySelect.addEventListener("cu-change", renderCatalog);
prioritySelect.addEventListener("cu-change", renderCatalog);

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
    document.getElementById("metric-previews").textContent =
      String(allComponents.filter(item => item.status === "preview").length);
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
  { label:"Search component catalog", description:"Filter all catalog entries", target:"catalog", keywords:["inventory"] },
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

// IconButton, ToggleButtonGroup, Toolbar and CommandBar previews.
const iconResult=document.getElementById("wc-icon-result");
document.getElementById("wc-icon-action").addEventListener("cu-press",()=>{
  iconResult.textContent="Save icon action activated";
});
document.getElementById("wc-icon-toggle").addEventListener("cu-change",event=>{
  iconResult.textContent="Preview "+(event.detail.pressed?"enabled":"disabled");
});
const alignGroup=document.getElementById("wc-toggle-group");
alignGroup.items=[
  {value:"left",label:"Left",icon:"menu"},
  {value:"center",label:"Center",icon:"check"},
  {value:"right",label:"Right",icon:"arrow-up-right"},
  {value:"justify",label:"Justify",disabled:true}
];
alignGroup.value="left";
alignGroup.addEventListener("cu-change",event=>{
  document.getElementById("wc-toggle-result").textContent="Text alignment: "+event.detail.value;
});
const multiGroup=document.getElementById("wc-toggle-multiple");
multiGroup.items=[
  {value:"draft",label:"Draft"},
  {value:"review",label:"Review"},
  {value:"published",label:"Published"}
];
multiGroup.value=["draft","review"];
multiGroup.addEventListener("cu-change",event=>{
  document.getElementById("wc-toggle-result").textContent=
    "Filters: "+event.detail.values.join(", ");
});
for(const name of ["save","edit","add"]){
  document.getElementById("wc-toolbar-"+name).addEventListener("cu-press",()=>{
    document.getElementById("wc-toolbar-result").textContent=
      "Toolbar action: "+name;
  });
}
const wcCommands=document.getElementById("wc-command-bar");
wcCommands.commands=[
  {value:"save",label:"Save",icon:"save"},
  {value:"new",label:"New item",icon:"plus"},
  {value:"edit",label:"Edit",icon:"pencil"},
  {value:"search",label:"Search",icon:"search"},
  {value:"disabled",label:"Unavailable",disabled:true}
];
wcCommands.addEventListener("cu-action",event=>{
  document.getElementById("wc-command-result").textContent=
    "Command: "+event.detail.label;
});
document.getElementById("wc-command-compact").addEventListener("cu-press",()=>{
  wcCommands.maxVisible=1;
});
document.getElementById("wc-command-expanded").addEventListener("cu-press",()=>{
  wcCommands.maxVisible=4;
});

// SplitButton combines primary action and secondary menu without an Actions column.
const wcSplit=document.getElementById("wc-split-button");
const splitResult=document.getElementById("wc-split-result");
wcSplit.actions=[
  {value:"save-copy",label:"Save a copy"},
  {value:"export",label:"Export project"},
  {value:"archive",label:"Archive (unavailable)",disabled:true}
];
wcSplit.addEventListener("cu-press",()=>{
  splitResult.textContent="Primary action: Save project";
  showToast("Project saved","The primary SplitButton action was activated.");
});
wcSplit.addEventListener("cu-action",event=>{
  splitResult.textContent="Secondary action: "+event.detail.label;
  showToast("SplitButton action",event.detail.label);
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

const wcRing=document.getElementById("wc-ring");
const ringResult=document.getElementById("wc-ring-result");
function updateRing(value){
  wcRing.value=value;
  ringResult.textContent="Ring progress: "+Math.round(value)+"%";
}
document.getElementById("wc-ring-step").addEventListener("cu-press",()=>{
  updateRing(Math.min(100,(wcRing.value??0)+15));
});
document.getElementById("wc-ring-reset").addEventListener("cu-press",()=>updateRing(0));

const chipSelect=document.getElementById("wc-chip-select");
const chipRemovable=document.getElementById("wc-chip-removable");
const chipResult=document.getElementById("wc-chip-result");
chipSelect.addEventListener("cu-change",event=>{
  chipResult.textContent=event.detail.value+" selected: "+event.detail.selected;
});
chipRemovable.addEventListener("cu-remove",event=>{
  chipResult.textContent="Removed chip: "+event.detail.value;
  showToast("Chip removed",event.detail.value);
});
document.getElementById("wc-chip-restore").addEventListener("cu-press",()=>{
  chipRemovable.hidden=false;
  chipResult.textContent="Removable chip restored";
});

document.getElementById("wc-menu").addEventListener("cu-select",event => {
  document.getElementById("wc-menu-result").textContent =
    "Action: "+event.detail.label+" ("+event.detail.value+")";
  showToast("Menu selection",event.detail.label);
});


// Fourth native Web Component batch: Card, Divider, Skeleton, Spinner,
// Alert and Breadcrumb. All interactions remain local to the gallery.
document.getElementById("wc-card-action").addEventListener("cu-press",() => {
  showToast("Card action","Cards can compose standard ComponentUI controls.");
});
const loading = document.getElementById("wc-loading-preview");
const loaded = document.getElementById("wc-loaded-preview");
const loadingButton = document.getElementById("wc-toggle-loading");
loadingButton.addEventListener("cu-press",() => {
  const showContent = loaded.hidden;
  loaded.hidden = !showContent;
  loading.hidden = showContent;
  loading.setAttribute("aria-busy",String(!showContent));
  loadingButton.textContent = showContent ? "Show skeleton again" : "Show loaded content";
});
const dismissibleAlert = document.getElementById("wc-alert-dismissible");
dismissibleAlert.addEventListener("cu-dismiss",event => {
  showToast("Alert dismissed","The "+event.detail.tone+" alert was dismissed.");
});
document.getElementById("wc-alert-restore").addEventListener("cu-press",() => {
  dismissibleAlert.show();
});

// InfoBar: persistent feedback, inline action and dismiss/restore.
const wcInfo=document.getElementById("wc-info-bar");
const infoResult=document.getElementById("wc-info-result");
wcInfo.addEventListener("cu-dismiss",()=>{
  infoResult.textContent="InfoBar dismissed";
});
document.getElementById("wc-info-action").addEventListener("cu-press",()=>{
  infoResult.textContent="Opened synchronization details";
  showToast("Synchronization","Local workspace changes are saved.");
});
document.getElementById("wc-info-success").addEventListener("cu-press",()=>{
  wcInfo.setAttribute("tone","success");
  wcInfo.setAttribute("title","Synchronization completed");
  wcInfo.setAttribute("message","Everything is up to date.");
  wcInfo.show();
  infoResult.textContent="Success InfoBar visible";
});
document.getElementById("wc-info-restore").addEventListener("cu-press",()=>{
  wcInfo.setAttribute("tone","info");
  wcInfo.setAttribute("title","Workspace synchronization");
  wcInfo.setAttribute("message","Your changes are saved locally.");
  wcInfo.show();
  infoResult.textContent="InfoBar restored";
});

const breadcrumbs = document.getElementById("wc-breadcrumb");
document.getElementById("wc-breadcrumb-toggle").addEventListener("cu-press",() => {
  const last = breadcrumbs.querySelector("cu-breadcrumb-item:last-child");
  last.textContent = last.textContent.trim() === "Feedback" ? "Navigation" : "Feedback";
});


// Accordion, Disclosure, Pagination and native Drawer previews.
const nativeAccordion=document.getElementById("wc-accordion");
const accordionResult=document.getElementById("wc-accordion-result");
nativeAccordion.addEventListener("cu-change",event=>{
  accordionResult.textContent="Open sections: "+
    (event.detail.values.join(", ")||"none");
});
document.getElementById("wc-accordion-multi").addEventListener("cu-press",()=>{
  nativeAccordion.multiple=!nativeAccordion.multiple;
  document.getElementById("wc-accordion-multi").textContent=
    nativeAccordion.multiple?"Use single-open mode":"Enable multiple sections";
  accordionResult.textContent="Mode: "+(nativeAccordion.multiple?"multiple":"single")+
    "; open sections: "+(nativeAccordion.values.join(", ")||"none");
});
document.getElementById("wc-accordion-reset").addEventListener("cu-press",()=>{
  nativeAccordion.multiple=false;
  nativeAccordion.value="installation";
  document.getElementById("wc-accordion-multi").textContent="Enable multiple sections";
  accordionResult.textContent="Open section: installation";
});
const nativePager=document.getElementById("wc-pagination");
const pagerResult=document.getElementById("wc-pagination-result");
nativePager.addEventListener("cu-page-change",event=>{
  const {start,end,total}=event.detail;
  pagerResult.textContent="Showing "+start+"–"+end+" of "+total;
});
document.getElementById("wc-pagination-prev").addEventListener("cu-press",()=>{
  nativePager.previous();
});
document.getElementById("wc-pagination-next").addEventListener("cu-press",()=>{
  nativePager.next();
});
document.getElementById("wc-pagination-empty").addEventListener("cu-press",()=>{
  nativePager.total=nativePager.total?0:125;
  nativePager.page=1;
  pagerResult.textContent=nativePager.total?"Showing 1–10 of 125":"Showing 0–0 of 0";
});
const nativeDrawer=document.getElementById("wc-native-drawer");
const drawerResult=document.getElementById("wc-drawer-result");
document.getElementById("wc-drawer-open").addEventListener("cu-press",()=>{
  nativeDrawer.setAttribute("placement","right");
  nativeDrawer.show();
});
document.getElementById("wc-drawer-left").addEventListener("cu-press",()=>{
  nativeDrawer.setAttribute("placement","left");
  nativeDrawer.show();
});
document.getElementById("wc-drawer-done").addEventListener("cu-press",()=>{
  nativeDrawer.close("saved");
});
nativeDrawer.addEventListener("cu-open",()=>{
  drawerResult.textContent="Drawer opened";
});
nativeDrawer.addEventListener("cu-close",event=>{
  drawerResult.textContent=event.detail.returnValue==="saved"?
    "Project preferences saved":"Drawer closed";
});

// Stepper: programmatic workflow steps with linear guard and accessible transitions.
const wcStepper=document.getElementById("wc-stepper");
const stepperResult=document.getElementById("wc-stepper-result");
wcStepper.steps=[
  {value:"draft",label:"Draft",description:"Prepare content"},
  {value:"review",label:"Review",description:"Check changes"},
  {value:"approval",label:"Approval",description:"Confirm details",optional:true},
  {value:"published",label:"Published",description:"Publish project"}
];
wcStepper.value="draft";
wcStepper.addEventListener("cu-change",event=>{
  const step=wcStepper.steps[event.detail.index];
  stepperResult.textContent="Current step: "+step.label;
});
document.getElementById("wc-stepper-prev").addEventListener("cu-press",()=>wcStepper.previous());
document.getElementById("wc-stepper-next").addEventListener("cu-press",()=>wcStepper.next());

// Fifth native Web Components wave — data-intensive interactions.
const wcTable=document.getElementById("wc-data-table");
wcTable.columns=[
  {key:"name",label:"Project"},
  {key:"owner",label:"Owner"},
  {key:"status",label:"Status"},
  {key:"updated",label:"Last updated"}
];
wcTable.rows=[
  {id:"nova",name:"NovaBrowser",owner:"Dương",status:"Active",updated:"2026-11-21"},
  {id:"ui",name:"ComponentUI",owner:"Dương",status:"Active",updated:"2026-11-22"},
  {id:"sync",name:"Sync Engine",owner:"Team",status:"Review",updated:"2026-11-15"},
  {id:"store",name:"Object Storage",owner:"Ops",status:"Planned",updated:"2026-11-05"},
  {id:"api",name:"API Gateway",owner:"Team",status:"Active",updated:"2026-11-12"},
  {id:"docs",name:"Documentation",owner:"Dương",status:"Draft",updated:"2026-11-19"}
];
wcTable.rowActions=[
  {value:"open",label:"Open"},
  {value:"rename",label:"Rename"},
  {value:"archive",label:"Archive",disabled:row=>row.status==="Planned"}
];
wcTable.headerActions=[
  {value:"inspect-column",label:"Inspect column"}
];
// SplitView composes native Splitter, ResizablePanel and sidebar collapse.
const workspaceSplitView=document.getElementById("wc-split-view");
const splitViewResult=document.getElementById("wc-split-view-result");
function syncSplitViewStatus(){
  splitViewResult.textContent="Sidebar: "+Math.round(workspaceSplitView.position)+"% ("+
    (workspaceSplitView.collapsed?"collapsed":"expanded")+")";
}
workspaceSplitView.addEventListener("cu-toggle",syncSplitViewStatus);
workspaceSplitView.addEventListener("cu-change",syncSplitViewStatus);
document.getElementById("wc-split-view-toggle").addEventListener("cu-press",()=>{
  workspaceSplitView.toggle();
});
document.getElementById("wc-split-view-vertical").addEventListener("cu-press",()=>{
  const vertical=workspaceSplitView.getAttribute("orientation")==="vertical";
  if(vertical)workspaceSplitView.removeAttribute("orientation");
  else workspaceSplitView.setAttribute("orientation","vertical");
});

// VirtualList renders a small window over 10k items.
const largeList=document.getElementById("wc-virtual-list");
const virtualResult=document.getElementById("wc-virtual-result");
largeList.items=Array.from({length:10000},(_,index)=>({
  id:"project-"+(index+1),
  label:"Project record "+String(index+1).padStart(5,"0")
}));
largeList.addEventListener("cu-change",event=>{
  virtualResult.textContent="Selected "+event.detail.value+
    " (index "+event.detail.index+")";
});
document.getElementById("wc-virtual-jump").addEventListener("cu-press",()=>{
  largeList.select(7999);
  largeList.focus();
});
document.getElementById("wc-virtual-reset").addEventListener("cu-press",()=>{
  largeList.select(0);
  largeList.focus();
});

// Splitter and standalone ResizablePanel: pointer, keyboard and ResizeObserver.
const workspaceSplitter=document.getElementById("wc-splitter");
const splitterResult=document.getElementById("wc-splitter-result");
function setSplitterStatus(){
  splitterResult.textContent="Panel split: "+Math.round(workspaceSplitter.position)+"%";
}
workspaceSplitter.addEventListener("cu-input",setSplitterStatus);
workspaceSplitter.addEventListener("cu-change",setSplitterStatus);
document.getElementById("wc-splitter-orientation").addEventListener("cu-press",()=>{
  const vertical=workspaceSplitter.getAttribute("orientation")==="vertical";
  if(vertical)workspaceSplitter.removeAttribute("orientation");
  else workspaceSplitter.setAttribute("orientation","vertical");
  document.getElementById("wc-splitter-orientation").textContent=vertical?
    "Stack panels vertically":"Arrange panels horizontally";
});
document.getElementById("wc-splitter-reset").addEventListener("cu-press",()=>{
  workspaceSplitter.position=50;
  setSplitterStatus();
});
document.getElementById("wc-resizable-standalone").addEventListener("cu-resize",event=>{
  const {width,height}=event.detail;
  document.getElementById("wc-panel-result").textContent=
    "Panel size: "+Math.round(width)+" × "+Math.round(height)+" px";
});

// FilterBar and DataFilter share DataTable filtering operators.
const projectFilters=document.getElementById("wc-filter-bar");
// DataTable retains its own column filters; FilterBar adds search/field criteria.
wcTable.bindFilterBar(projectFilters,{searchKeys:["name","owner"]});
const filterResult=document.getElementById("wc-filter-result");
const filterList=document.getElementById("wc-filter-list");
const previewProjects=wcTable.rows;
function renderProjectFilters(){
  const matching=applyFilterBar(previewProjects,projectFilters.query,
    projectFilters.conditions,["name","owner"]);
  filterList.replaceChildren();
  for(const record of matching){
    const item=document.createElement("li");
    item.textContent=record.name+" — "+record.owner+" ("+record.status+")";
    filterList.append(item);
  }
  filterResult.textContent=matching.length+" matching projects; "+
    projectFilters.activeCount+" active filters";
}
projectFilters.addEventListener("cu-filter-change",renderProjectFilters);
document.getElementById("wc-filter-active").addEventListener("cu-press",()=>{
  const status=projectFilters.querySelector('cu-data-filter[field="status"]');
  status.operator="equals";
  status.value="Active";
  projectFilters.refresh();
  renderProjectFilters();
});
document.getElementById("wc-filter-reset").addEventListener("cu-press",()=>{
  projectFilters.clear();
  renderProjectFilters();
});
renderProjectFilters();

const tableResult=document.getElementById("wc-data-table-result");
wcTable.addEventListener("cu-sort",e=>{
  tableResult.textContent="Sorted "+e.detail.key+" ("+e.detail.direction+")";
});
wcTable.addEventListener("cu-selection-change",e=>{
  tableResult.textContent=e.detail.selectedIds.length+" selected: "+e.detail.selectedIds.join(", ");
});
wcTable.addEventListener("cu-row-action",e=>{
  tableResult.textContent=e.detail.label+" project: "+e.detail.row.name;
  showToast("Table action",e.detail.label+" "+e.detail.row.name);
});
wcTable.addEventListener("cu-header-action",e=>{
  tableResult.textContent=e.detail.label+" ("+(e.detail.key??"all columns")+")";
});
wcTable.addEventListener("cu-column-visibility-change",e=>{
  tableResult.textContent="Visible columns: "+e.detail.visibleKeys.join(", ");
});
wcTable.addEventListener("cu-filter-change",e=>{
  const active=Object.keys(e.detail.filters);
  tableResult.textContent=e.detail.filteredCount+" of "+e.detail.totalCount+
    " records"+(active.length?" (filtered: "+active.join(", ")+")":"");
});
// TreeList: virtualized hierarchy, 200 folders and 2,000 leaf records.
const largeTree=document.getElementById("wc-tree-list");
const treeListResult=document.getElementById("wc-tree-list-result");
largeTree.items=Array.from({length:200},(_,folder)=>({
  value:"folder-"+folder,label:"Folder "+String(folder+1).padStart(3,"0"),
  expanded:folder===0,
  children:Array.from({length:10},(_,file)=>({
    value:"file-"+folder+"-"+file,
    label:"module-"+String(file+1).padStart(2,"0")+".tsx"
  }))
}));
largeTree.addEventListener("cu-change",event=>{
  treeListResult.textContent="Selected: "+event.detail.value;
});
largeTree.addEventListener("cu-toggle",event=>{
  treeListResult.textContent=(event.detail.expanded?"Expanded: ":"Collapsed: ")+event.detail.value+
    " — "+largeTree.visibleCount+" visible nodes";
});
document.getElementById("wc-tree-list-expand").addEventListener("cu-press",()=>{
  largeTree.expand("folder-0");largeTree.focus();
});
document.getElementById("wc-tree-list-collapse").addEventListener("cu-press",()=>{
  largeTree.collapse("folder-0");largeTree.focus();
});

// InfiniteScroll: the application owns fetching and signals completion.
const incrementalFeed=document.getElementById("wc-infinite-scroll");
const feedContainer=document.getElementById("wc-infinite-items");
const feedStatus=document.getElementById("wc-infinite-result");
const FEED_TOTAL=120,FEED_BATCH=20;
let loadedFeedItems=0;
function appendFeedItems(size){
  const fragment=document.createDocumentFragment();
  for(let i=0;i<size;i++){
    const item=document.createElement("li");
    item.textContent="Incremental record #"+String(loadedFeedItems+i+1).padStart(3,"0");
    item.style.padding="6px 0";
    fragment.append(item);
  }
  loadedFeedItems+=size;
  feedContainer.append(fragment);
  feedStatus.textContent=loadedFeedItems+" of "+FEED_TOTAL+" records loaded";
}
incrementalFeed.addEventListener("cu-load-more",()=>{
  const size=Math.min(FEED_BATCH,FEED_TOTAL-loadedFeedItems);
  if(size>0)appendFeedItems(size);
  incrementalFeed.complete({hasMore:loadedFeedItems<FEED_TOTAL});
});
document.getElementById("wc-infinite-next").addEventListener("cu-press",()=>{
  incrementalFeed.requestMore("manual");
});
document.getElementById("wc-infinite-reset").addEventListener("cu-press",()=>{
  feedContainer.replaceChildren();
  loadedFeedItems=0;
  incrementalFeed.reset();
  incrementalFeed.hasMore=true;
  appendFeedItems(FEED_BATCH);
});
appendFeedItems(FEED_BATCH);

// DataTable performance example: cached filtered/sorted views over 5k records.
const originalTableRows=wcTable.rows;
document.getElementById("wc-table-large").addEventListener("cu-press",()=>{
  wcTable.rows=Array.from({length:5000},(_,index)=>({
    id:"perf-"+index,
    name:"Project "+String(index+1).padStart(5,"0"),
    owner:["Dương","Team","Ops"][index%3],
    status:["Active","Review","Planned"][index%3],
    updated:"2026-11-25"
  }));
  tableResult.textContent="Loaded 5,000 records; pagination uses cached filter and sort results";
});
document.getElementById("wc-table-small").addEventListener("cu-press",()=>{
  wcTable.rows=originalTableRows;
  tableResult.textContent="Restored 6 sample projects";
});

const tree=document.getElementById("wc-tree-view");
tree.addEventListener("cu-change",e=>{
  document.getElementById("wc-tree-view-result").textContent="Selected "+e.detail.label;
});
tree.addEventListener("cu-toggle",e=>{
  document.getElementById("wc-tree-view-result").textContent=
    (e.detail.expanded?"Expanded ":"Collapsed ")+e.detail.value;
});
document.getElementById("wc-listbox-form").addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-listbox-result").textContent=
    JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries()));
});
document.getElementById("wc-combobox-form").addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-combobox-result").textContent=
    JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries()));
});
const context=document.getElementById("wc-context-menu");
context.addEventListener("cu-select",event=>{
  document.getElementById("wc-context-menu-result").textContent=
    event.detail.label+" ("+event.detail.value+")";
});
document.getElementById("wc-open-context").addEventListener("cu-press",()=>{
  const target=context.querySelector('[slot="target"]');
  const rect=target.getBoundingClientRect();
  context.showAt(rect.left,rect.bottom);
});


// v0.10.0 — functional form and search preview controls.
const compositionForm = document.getElementById("wc-composition-form");
compositionForm.addEventListener("submit", event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(compositionForm).entries());
  document.getElementById("wc-composition-result").textContent =
    JSON.stringify(payload, null, 2);
  showToast("Example saved", "The native Web Component form values were collected.");
});
compositionForm.addEventListener("reset", () => {
  document.getElementById("wc-composition-result").textContent =
    "Form reset to initial values.";
});
const exampleSearch = document.getElementById("wc-search-box");
const exampleItems = [...document.querySelectorAll("#wc-search-examples > span")];
const exampleStatus = document.getElementById("wc-search-result");
function filterExampleComponents() {
  const query = exampleSearch.value.trim().toLocaleLowerCase();
  let count = 0;
  exampleItems.forEach(item => {
    item.hidden = !item.textContent.toLocaleLowerCase().includes(query);
    if (!item.hidden) count++;
  });
  exampleStatus.textContent = count + " matching component" + (count === 1 ? "" : "s");
}
exampleSearch.addEventListener("cu-input", filterExampleComponents);
exampleSearch.addEventListener("cu-search", filterExampleComponents);


// v0.11.0 — advanced forms & application shell demos.
const advancedForm=document.getElementById("wc-advanced-form");
const advancedResult=document.getElementById("wc-advanced-result");
advancedForm.addEventListener("submit",event=>{
  event.preventDefault();
  // Deliberately omit password value and file bytes from the visible preview.
  const form=new FormData(advancedForm);
  const selected=form.getAll("attachments").filter(value=>value instanceof File && value.name);
  advancedResult.textContent=JSON.stringify({
    passwordProvided:Boolean(form.get("password")),
    fileCount:selected.length,
    filenames:selected.map(file=>file.name)
  },null,2);
  showToast("Form validated","No password or files were sent to a server.");
});
advancedForm.addEventListener("reset",()=>{
  advancedResult.textContent="Form reset. No data was sent.";
});
const appShell=document.getElementById("wc-app-shell");
appShell.addEventListener("cu-navigation-toggle",event=>{
  document.getElementById("wc-app-shell-result").textContent=
    "Navigation panel "+(event.detail.open?"opened":"closed")+".";
});
const workspaceNavigation=document.getElementById("wc-navigation-view");
workspaceNavigation.addEventListener("cu-change",event=>{
  const label=event.detail.label;
  document.getElementById("wc-app-view").textContent=label;
  appShell.closeNavigation(false);
});

// SettingsPage filters metadata only; no control values are read by search.
const settingsPage=document.getElementById("wc-settings-page");
const settingsResult=document.getElementById("wc-settings-result");
settingsPage.addEventListener("cu-filter",event=>{
  settingsResult.textContent=event.detail.visible+" of "+event.detail.total+
    " settings match "+(event.detail.query||"your query")+".";
});
for(const id of ["wc-settings-theme","wc-settings-density","wc-settings-notify",
  "wc-settings-name","wc-settings-remember"]){
  const control=document.getElementById(id);
  control.addEventListener("cu-change",event=>{
    // Never read or log unrelated input fields.
    settingsResult.textContent=(control.getAttribute("aria-label")||id)+" updated.";
  });
}
