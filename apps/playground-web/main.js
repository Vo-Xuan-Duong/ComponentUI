import "../../packages/web/src/components/index.js";
import { applyFilterBar } from "../../packages/web/src/components/filter-bar.js";
import {
  enhanceMenu, enhancePopover, enhanceDialogTrigger,
  enhancePagination
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
  return toastContainer.show({title,message,duration:4500});
}
const wcSnackbar=document.getElementById("wc-snackbar");
document.getElementById("wc-snackbar-show").addEventListener("cu-press",()=>wcSnackbar.show({message:"Workspace updated",tone:"success",action:"Dismiss"}));
const wcConfirmDialog=document.getElementById("wc-confirm-dialog");
document.getElementById("wc-confirm-show").addEventListener("cu-press",()=>wcConfirmDialog.showModal());
wcConfirmDialog.addEventListener("cu-close",event=>{document.getElementById("wc-confirm-result").textContent=event.detail.returnValue==="confirm"?"Confirmed (demo only)":"Cancelled";});
document.getElementById("wc-description-list").items=[{label:"Branch",value:"main"},{label:"Status",value:"Preview"},{label:"Frameworks",value:"React / Vue / Svelte"}];
document.getElementById("wc-list").addEventListener("cu-select",event=>{document.getElementById("wc-list-result").textContent="Selected: "+event.detail.label;});
document.getElementById("wc-code-block").value='import "@componentui/web";\nconst ready = true;';
const wcForm=document.getElementById("wc-form");
wcForm.addEventListener("cu-submit",event=>{document.getElementById("wc-form-result").textContent="Project: "+String(event.detail.formData.get("project")||"")+" (local demo)";});
wcForm.addEventListener("cu-reset",()=>{document.getElementById("wc-form-result").textContent="Form reset.";});
document.getElementById("wc-file-upload").addEventListener("cu-upload",event=>{document.getElementById("wc-form-result").textContent=event.detail.count+" file(s) selected for upload; no network request.";});
const wcRichForm=document.getElementById("wc-rich-form");
wcRichForm.addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-rich-result").textContent=String(new FormData(wcRichForm).get("description")||"");
});
wcRichForm.addEventListener("reset",()=>{document.getElementById("wc-rich-result").textContent="Form reset.";});
const wcChartContainer=document.getElementById("wc-chart-container");
wcChartContainer.items=[{label:"Jan",value:18},{label:"Feb",value:24},{label:"Mar",value:-8},{label:"Apr",value:32},{label:"May",value:28},{label:"Jun",value:42}];
document.getElementById("wc-chart-toggle").addEventListener("cu-press",()=>wcChartContainer.setAttribute("chart-type",wcChartContainer.getAttribute("chart-type")==="line"?"bar":"line"));
const wcDockLayout=document.getElementById("wc-dock-layout");
wcDockLayout.layout={start:23,end:24,bottom:26};
for(const region of ["start","end","bottom"])
  document.getElementById("wc-dock-"+region).addEventListener("cu-press",()=>wcDockLayout.toggleRegion(region));
for(const type of ["cu-resize","cu-change"])
  wcDockLayout.addEventListener(type,event=>{
    if(event.target===wcDockLayout)document.getElementById("wc-dock-result").textContent=JSON.stringify(event.detail.layout);
  });
const wcKanbanBoard=document.getElementById("wc-kanban-board");
wcKanbanBoard.lanes=[{id:"todo",label:"Planned"},{id:"doing",label:"In progress"},{id:"done",label:"Implemented"}];
wcKanbanBoard.items=[
  {id:"editor",laneId:"todo",title:"RichTextEditor",description:"Reusable rich text controls",tag:"Inputs"},
  {id:"chart",laneId:"todo",title:"ChartContainer",description:"Responsive data visualization",tag:"Data display"},
  {id:"review",laneId:"doing",title:"Browser acceptance",description:"Validate keyboard and pointer interactions",tag:"Quality"},
  {id:"dock",laneId:"done",title:"DockLayout",tag:"Desktop"},
  {id:"kanban",laneId:"done",title:"KanbanBoard",tag:"Workflow"}
];
wcKanbanBoard.addEventListener("cu-move",event=>{
  document.getElementById("wc-kanban-result").textContent=event.detail.item.title+" → "+event.detail.laneId;
});
const wcTitleBar=document.getElementById("wc-title-bar");
const wcWindowControls=document.getElementById("wc-window-controls");
const wcStatusBar=document.getElementById("wc-status-bar");
const wcDesktopContent=document.getElementById("wc-desktop-content");
const wcDesktopResult=document.getElementById("wc-desktop-result");
function applyDesktopAction(event){
  const action=event.detail.action;
  if(action==="maximize"||action==="restore"){
    const maximized=action==="maximize";
    wcTitleBar.maximized=maximized;wcWindowControls.maximized=maximized;
    wcDesktopContent.style.minHeight=maximized?"240px":"140px";
    wcDesktopContent.hidden=false;
  }else if(action==="minimize"||action==="close"){
    wcDesktopContent.hidden=true;
  }
  wcDesktopResult.textContent="Simulated window action: "+action;
  showToast("Window action",action+" (browser simulation)");
}
wcTitleBar.addEventListener("cu-window-action",applyDesktopAction);
wcWindowControls.addEventListener("cu-window-action",applyDesktopAction);
wcTitleBar.addEventListener("cu-window-drag",()=>{wcDesktopResult.textContent="Drag request (native host required).";});
document.getElementById("wc-desktop-restore").addEventListener("cu-press",()=>{
  wcTitleBar.maximized=false;wcWindowControls.maximized=false;wcDesktopContent.hidden=false;wcDesktopContent.style.minHeight="140px";wcDesktopResult.textContent="Ready";
});
document.getElementById("wc-desktop-settings").addEventListener("cu-press",()=>showToast("Settings","Desktop action (demo only)"));
const desktopStatusItems=[
  {id:"connection",label:"Connected",icon:"circle-check",tone:"success"},
  {id:"branch",label:"Branch",value:"main",icon:"folder"},
  {id:"encoding",label:"UTF-8",align:"end"},
  {id:"language",label:"JavaScript",align:"end",action:"language"}
];
wcStatusBar.items=desktopStatusItems;
wcStatusBar.addEventListener("cu-action",event=>showToast("Status action",event.detail.action));
document.getElementById("wc-desktop-status").addEventListener("cu-press",()=>{
  const connected=wcStatusBar.items.find(x=>x.id==="connection")?.tone==="success";
  wcStatusBar.items=desktopStatusItems.map(x=>x.id==="connection"?{...x,label:connected?"Offline":"Connected",tone:connected?"warning":"success",icon:connected?"info":"circle-check"}:x);
  wcStatusBar.setAttribute("announcement",connected?"Workspace offline":"Workspace connected");
});
const wcFileExplorer=document.getElementById("wc-file-explorer");
wcFileExplorer.items=[
  {id:"src",kind:"folder",name:"src"},
  {id:"docs",kind:"folder",name:"docs"},
  {id:"readme",kind:"file",name:"README.md",size:4096,modified:"2026-11-26"},
  {id:"pkg",kind:"file",name:"package.json",size:2048,modified:"2026-11-26"},
  {id:"components",parentId:"src",kind:"folder",name:"components"},
  {id:"index",parentId:"src",kind:"file",name:"index.js",size:1200},
  {id:"button",parentId:"components",kind:"file",name:"button.js",size:5200},
  {id:"table",parentId:"components",kind:"file",name:"data-table.js",size:28600},
  {id:"guide",parentId:"docs",kind:"file",name:"Guide.md",size:1820}
];
wcFileExplorer.actions=[{value:"rename",label:"Rename"},{value:"copy",label:"Copy"},{value:"delete",label:"Delete"}];
wcFileExplorer.addEventListener("cu-open",event=>{document.getElementById("wc-file-explorer-result").textContent="Open: "+event.detail.entry.name;});
wcFileExplorer.addEventListener("cu-action",event=>{document.getElementById("wc-file-explorer-result").textContent=event.detail.action+": "+event.detail.entry.name+" (demo only)";});
const wcDataGrid=document.getElementById("wc-data-grid");
wcDataGrid.columns=[
  {key:"name",label:"Product",editable:true,required:true},
  {key:"quantity",label:"Quantity",editable:true,type:"number",min:0,step:1},
  {key:"status",label:"Status",editable:true,type:"select",options:[{value:"Active"},{value:"Draft"},{value:"Archived"}]},
  {key:"enabled",label:"Enabled",editable:true,type:"boolean"}
];
wcDataGrid.rows=[
  {id:"p1",name:"Desktop kit",quantity:12,status:"Active",enabled:true},
  {id:"p2",name:"Admin template",quantity:8,status:"Draft",enabled:false},
  {id:"p3",name:"Design tokens",quantity:24,status:"Active",enabled:true},
  {id:"p4",name:"Legacy UI",quantity:0,status:"Archived",enabled:false}
];
wcDataGrid.rowActions=[{value:"details",label:"View details"},{value:"archive",label:"Archive"}];
wcDataGrid.addEventListener("cu-cell-change",event=>{document.getElementById("wc-data-grid-result").textContent=JSON.stringify(event.detail,null,2);});
wcDataGrid.addEventListener("cu-row-action",event=>{if(event.detail.action!=="edit-cell")showToast("Grid action",event.detail.action+" (demo only)");});
const wcCarousel=document.getElementById("wc-carousel");
wcCarousel.items=[
  {id:"layout",title:"Workspace layouts"},
  {id:"forms",title:"Form controls",description:"Native form-associated controls with validation and keyboard support."},
  {id:"data",title:"Data display",description:"DataTable, Timeline and Statistic for information-rich applications."}
];
wcCarousel.addEventListener("cu-change",event=>{
  document.getElementById("wc-carousel-result").textContent="Slide "+(event.detail.index+1)+" of "+wcCarousel.items.length;
});
const wcPropertyGrid=document.getElementById("wc-property-grid");
wcPropertyGrid.items=[
  {key:"name",group:"General",label:"Workspace name",type:"text",value:"ComponentUI",required:true},
  {key:"version",group:"General",label:"Version",type:"text",value:"Preview",readonly:true},
  {key:"theme",group:"Appearance",label:"Theme",type:"select",value:"system",options:[{value:"system",label:"System"},{value:"light",label:"Light"},{value:"dark",label:"Dark"}]},
  {key:"accent",group:"Appearance",label:"Accent color",type:"color",value:"#0067c0"},
  {key:"density",group:"Appearance",label:"Compact density",type:"boolean",value:false},
  {key:"width",group:"Layout",label:"Panel width",description:"Range: 200–600 px",type:"number",value:320,min:200,max:600,step:10}
];
wcPropertyGrid.addEventListener("cu-change",()=>{
  document.getElementById("wc-property-result").textContent=JSON.stringify(wcPropertyGrid.values,null,2);
});
const wcSegmentView=document.getElementById("wc-segment-view");
wcSegmentView.items=[{value:"grid",label:"Grid",icon:"panel-left"},{value:"list",label:"List",icon:"menu"},{value:"details",label:"Details",icon:"info"}];
document.getElementById("wc-segment-density").items=[{value:"compact",label:"Compact"},{value:"comfortable",label:"Comfortable"},{value:"spacious",label:"Spacious",disabled:true}];
const wcSegmentForm=document.getElementById("wc-segment-form");
wcSegmentForm.addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-segment-result").textContent=JSON.stringify(Object.fromEntries(new FormData(wcSegmentForm)),null,2);
});
wcSegmentForm.addEventListener("reset",()=>{document.getElementById("wc-segment-result").textContent="Form reset.";});
const wcTimeline=document.getElementById("wc-timeline");
wcTimeline.items=[
  {id:"created",title:"Release prepared",description:"Release notes and component contracts updated.",time:"09:00",status:"success"},
  {id:"build",title:"Package build",description:"Standalone package exports verified in source.",time:"09:20",status:"success"},
  {id:"review",title:"Local review required",description:"Browser and framework acceptance still pending.",time:"10:00",status:"warning",action:"View details"},
  {id:"release",title:"Release review",description:"Waiting for local verification.",time:"Next step",status:"active"}
];
wcTimeline.addEventListener("cu-action",event=>showToast("Timeline action",event.detail.action+": "+event.detail.item.title));
document.getElementById("wc-timeline-reverse").addEventListener("cu-press",()=>wcTimeline.toggleAttribute("reverse"));
document.getElementById("wc-timeline-orientation").addEventListener("cu-press",()=>wcTimeline.setAttribute("orientation",wcTimeline.getAttribute("orientation")==="horizontal"?"vertical":"horizontal"));
const wcScrollArea=document.getElementById("wc-scroll-area");
const wcScrollRows=document.getElementById("wc-scroll-rows");
for(let i=1;i<=16;i++){
  const row=document.createElement("div");
  row.textContent="Workspace activity "+String(i).padStart(2,"0");
  row.style.padding="10px";row.style.borderBottom="1px solid var(--cu-border)";
  wcScrollRows.append(row);
}
wcScrollArea.addEventListener("cu-scroll",event=>{
  const m=event.detail;
  document.getElementById("wc-scroll-result").textContent="Scroll position: "+Math.round(m.scrollTop)+" / "+Math.round(m.maxScrollTop)+(m.atBottom?" · End reached":"");
});
document.getElementById("wc-scroll-top").addEventListener("cu-press",()=>wcScrollArea.scrollTo({top:0}));
document.getElementById("wc-scroll-bottom").addEventListener("cu-press",()=>wcScrollArea.scrollTo({top:wcScrollArea.metrics.maxScrollTop}));
const wcAvatarGroup=document.getElementById("wc-avatar-group");
const wcAvatarMembers=["Alex Nguyen","Mai Tran","Linh Pham","Sam Wilson","Jordan Lee","Taylor Kim","Minh Vo"].map((name,i)=>({id:String(i+1),name}));
wcAvatarGroup.items=wcAvatarMembers;
document.getElementById("wc-avatar-group-compact").items=wcAvatarMembers.slice(0,5);
wcAvatarGroup.addEventListener("cu-toggle",event=>{
  document.getElementById("wc-avatar-group-result").textContent=event.detail.expanded?"Additional members expanded":"Additional members collapsed";
});
document.getElementById("wc-avatar-limit").addEventListener("cu-press",()=>{wcAvatarGroup.maxVisible=wcAvatarGroup.maxVisible===4?2:4;});
document.getElementById("wc-stat-revenue").series=[31000,36500,34100,40900,43200,48250];
document.getElementById("wc-stat-users").series=[10200,11100,10800,11600,12000,12840];
document.getElementById("wc-stat-latency").series=[181,160,174,150,144,126];
const wcLoadingRegion=document.getElementById("wc-loading-region");
const wcLoadingGlobal=document.getElementById("wc-loading-global");
document.getElementById("wc-loading-toggle").addEventListener("cu-press",()=>{wcLoadingRegion.loading=!wcLoadingRegion.loading;});
document.getElementById("wc-loading-full").addEventListener("cu-press",()=>{
  wcLoadingGlobal.show();
  setTimeout(()=>wcLoadingGlobal.hide(),1500);
});
document.getElementById("wc-loading-content").addEventListener("cu-press",()=>showToast("Workspace action","The region is interactive."));
const wcColorTagsForm=document.getElementById("wc-color-tags-form");
wcColorTagsForm.addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(wcColorTagsForm);
  document.getElementById("wc-color-tags-result").textContent=JSON.stringify({accent:data.get("accent"),tags:data.getAll("tags")},null,2);
});
wcColorTagsForm.addEventListener("reset",()=>{document.getElementById("wc-color-tags-result").textContent="Form reset.";});
const wcRangeOtpForm=document.getElementById("wc-range-otp-form");
wcRangeOtpForm.addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(wcRangeOtpForm);
  document.getElementById("wc-range-otp-result").textContent=
    JSON.stringify({budget:data.getAll("budget"),codeComplete:String(data.get("code")??"").length===6},null,2);
});
wcRangeOtpForm.addEventListener("reset",()=>{document.getElementById("wc-range-otp-result").textContent="Form reset.";});
const wcAutocomplete=document.getElementById("wc-autocomplete");
wcAutocomplete.items=[
  {value:"React",description:"UI library"},
  {value:"Vue",description:"Progressive framework"},
  {value:"Svelte",description:"Compiled UI framework"},
  {value:"Rust",description:"Systems programming"},
  {value:"TypeScript",description:"Typed JavaScript"},
  {value:"Electron",description:"Desktop application runtime"},
  {value:"Tauri",description:"Native desktop shell"}
];
const wcAutocompleteForm=document.getElementById("wc-autocomplete-form");
wcAutocompleteForm.addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-autocomplete-result").textContent=
    JSON.stringify(Object.fromEntries(new FormData(wcAutocompleteForm)),null,2);
});
wcAutocompleteForm.addEventListener("reset",()=>{document.getElementById("wc-autocomplete-result").textContent="Form reset.";});
const wcNotificationCenter=document.getElementById("wc-notification-center");
wcNotificationCenter.items=[
  {id:"build",title:"Build completed",message:"The workspace is ready.",tone:"success"},
  {id:"review",title:"Review requested",message:"A local example requires review.",tone:"info",action:"Review"},
  {id:"storage",title:"Storage warning",message:"Review your workspace usage.",tone:"warning",read:true}
];
let wcNotificationSequence=0;
document.getElementById("wc-notification-add").addEventListener("cu-press",()=>{
  wcNotificationCenter.add({id:"local-"+(++wcNotificationSequence),title:"Workspace updated",message:"A new local notification.",tone:"success"});
});
document.getElementById("wc-notification-clear").addEventListener("cu-press",()=>wcNotificationCenter.clear());
wcNotificationCenter.addEventListener("cu-action",event=>showToast("Notification action",event.detail.action));
const wcMultiForm=document.getElementById("wc-multi-form");
wcMultiForm.addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-multi-result").textContent=
    JSON.stringify(new FormData(wcMultiForm).getAll("framework"),null,2);
});
wcMultiForm.addEventListener("reset",()=>{document.getElementById("wc-multi-result").textContent="Form reset.";});
document.getElementById("wc-toast-queue").addEventListener("cu-press",()=>{
  for(const tone of ["info","success","warning","danger"])
    toastContainer.show({title:tone[0].toUpperCase()+tone.slice(1),message:"Queued notification",tone,duration:5000});
});
document.getElementById("wc-toast-action").addEventListener("cu-press",()=>{
  toastContainer.show({title:"Item archived",message:"This is a local preview.",action:"Undo",duration:0});
});
document.getElementById("wc-toast-clear").addEventListener("cu-press",()=>toastContainer.clear());
toastContainer.addEventListener("cu-action",event=>showToast("Action selected",event.detail.action));
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
const commandPalette = document.getElementById("command-palette");
const paletteActions = paletteCommands.map(command => ({
  ...command,
  value: command.action ? "theme:"+command.action : "navigate:"+command.target,
  group: command.action ? "Appearance" : "Navigation",
  icon: command.action ? "palette" : "arrow-up-right"
}));
commandPalette.commands = paletteActions;
commandPalette.addEventListener("cu-select", event => {
  const command = paletteActions.find(item => item.value === event.detail.value);
  if (!command) return;
  if (command.action) {
    setPreferences({theme:command.action});
    showToast("Theme updated", `Theme: ${command.action}`);
  } else if (command.target) {
    location.hash = "#" + command.target;
    document.getElementById(command.target)?.scrollIntoView({block:"start"});
    syncActiveNavigation();
  }
});
for (const id of ["open-command","open-command-secondary"])
  document.getElementById(id).addEventListener("click",()=>commandPalette.show());
document.getElementById("wc-empty-create").addEventListener("cu-press",()=>showToast("Create workspace","Example action; no workspace is created."));
document.getElementById("wc-empty-reset").addEventListener("cu-press",()=>showToast("Clear filters","Example action; no filters are changed."));


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
  showToast("Form values collected","Date, time, range and slider controls participated in native FormData.");
});
const wcCalendarRatingForm=document.getElementById("wc-calendar-rating-form");
wcCalendarRatingForm.addEventListener("submit",event=>{
  event.preventDefault();
  document.getElementById("wc-calendar-rating-result").textContent=
    JSON.stringify(Object.fromEntries(new FormData(wcCalendarRatingForm).entries()),null,2);
});
wcCalendarRatingForm.addEventListener("reset",()=>{
  document.getElementById("wc-calendar-rating-result").textContent="Form reset.";
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
