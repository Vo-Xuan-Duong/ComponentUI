import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * First interaction-quality source gate.
 * This is not a visual regression, browser or screen-reader test.
 */
export const QUALITY_CHECKS = Object.freeze([
  {
    path:"packages/web/src/components/_shared.js",
    markers:["--cu-state-hover","--cu-state-pressed","--cu-state-selected",
      "button:hover:not(:disabled)","button:active:not(:disabled)",
      "button:focus-visible","input:hover:not(:disabled)","input:disabled",
      "input[aria-invalid=true]","prefers-reduced-motion:reduce","forced-colors:active"]
  },
  {
    path:"packages/web/src/components/select.js",
    markers:['role="combobox"','role="listbox"',
      ".control:hover:not([aria-disabled=true])",
      ".option:hover:not([aria-disabled=true])",
      ".option[data-active=true]:not([aria-disabled=true])",
      ".option[data-selected=true]:not([aria-disabled=true])",
      "data-selected=true]:not([data-active=true])","aria-activedescendant",
      "aria-disabled","cu-select-enter",
      "prefers-reduced-motion:reduce","forced-colors:active"]
  },
  {
    path:"packages/web/src/components/button.js",
    markers:["this._control.disabled","this._spinner.hidden","aria-busy","cu-press"]
  },
  {
    path:"packages/web/src/components/text-field.js",
    markers:["aria-invalid","setValidity","formResetCallback","cu-input","cu-change"]
  },
  {
    path:"packages/theme/src/components.css",
    markers:["--cu-state-hover","--cu-state-pressed","--cu-state-selected",
      ".cu-btn:hover:not(:disabled)",".cu-btn:focus-visible",
      ".cu-btn:active:not(:disabled)",".cu-input:hover:not(:disabled)",
      ".cu-tab:hover:not(:disabled)",
      "prefers-reduced-motion: reduce","forced-colors: active"]
  },
  {
    path:"packages/theme/src/tokens.css",
    markers:["--cu-control-sm","--cu-control-md","--cu-control-lg",
      "--cu-control-xl","--cu-accent","--cu-focus",
      'data-cu-theme="dark"','data-cu-theme="light"',
      "prefers-reduced-motion: reduce"]
  },
  {
    path:"apps/playground-web/index.html",
    markers:['<header class="sidebar"','id="quality-lab"','id="quality-result"',
      'href="#quality-lab"','id="quality-primary"','id="quality-loading"',
      'id="quality-disabled"','id="quality-invalid"','id="quality-select"',
      'id="quality-field"']
  },
  {
    path:"apps/playground-web/styles.css",
    markers:[".app-layout > .sidebar",".quality-lab-grid",
      ".app-layout .sidebar .side-link.is-active","@media(max-width: 700px)",
      "@media(prefers-reduced-motion:reduce)","@media(forced-colors:active)"]
  },
  {
    path:"apps/playground-web/main.js",
    markers:['getElementById("quality-result")','getElementById("quality-select")',
      'getElementById("quality-field")','addEventListener("cu-press"']
  }
]);

export async function checkQuality(read=readFile){
  const missing=[];
  for(const {path,markers} of QUALITY_CHECKS){
    const target=fileURLToPath(new URL("../"+path,import.meta.url));
    const source=await read(target,"utf8");
    for(const marker of markers)
      if(!source.includes(marker))missing.push({path,marker});
  }
  return {
    checkedFiles:QUALITY_CHECKS.length,
    checkedMarkers:QUALITY_CHECKS.reduce((sum,x)=>sum+x.markers.length,0),
    missing
  };
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  const result=await checkQuality();
  if(result.missing.length){
    for(const item of result.missing)
      console.error("Missing quality source contract:",item.path,"→",item.marker);
    process.exitCode=1;
  }else{
    console.log("Source quality checks passed: "+result.checkedMarkers+
      " markers across "+result.checkedFiles+" files.");
    console.log("Browser, visual and screen-reader acceptance still required.");
  }
}
