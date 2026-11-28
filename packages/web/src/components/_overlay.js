/** Shared, dependency-free anchored overlay and focus helpers. */
const documentStacks=new WeakMap(),registeredStacks=new WeakMap(),fallbackStack=[];
function stackFor(host){
  const doc=host?.ownerDocument;
  if(!doc)return fallbackStack;
  let stack=documentStacks.get(doc);
  if(!stack){stack=[];documentStacks.set(doc,stack);}
  return stack;
}
export function registerOverlay(host){
  unregisterOverlay(host);
  const stack=stackFor(host);stack.push(host);registeredStacks.set(host,stack);
}
export function unregisterOverlay(host){
  const stack=registeredStacks.get(host);if(!stack)return;
  const index=stack.indexOf(host);if(index>=0)stack.splice(index,1);
  registeredStacks.delete(host);
}
export function isTopOverlay(host){
  return stackFor(host).at(-1)===host;
}
/** Close descendant overlays before their containing modal leaves the top layer. */
export function dismissDescendantOverlays(host){
  const stack=registeredStacks.get(host)??stackFor(host);
  for(const child of [...stack].reverse()){
    if(child===host)continue;
    let ancestor=child;
    while(ancestor&&ancestor!==host)ancestor=ancestor.assignedSlot??ancestor.parentNode??ancestor.host??null;
    if(ancestor!==host)continue;
    if(typeof child.hide==="function")child.hide(false);
    else if(typeof child._hideFilterPanel==="function")child._hideFilterPanel(false);
    else if(typeof child.close==="function")child.close();
    unregisterOverlay(child);
  }
}
/** Follow focus into nested open Shadow DOM roots. */
export function deepActiveElement(root=globalThis.document){
  let node=root?.activeElement??null;
  while(node?.shadowRoot?.activeElement)node=node.shadowRoot.activeElement;
  return node;
}
export function restoreOverlayFocus(node){
  if(node?.isConnected===false||node?.disabled||typeof node?.focus!=="function")return false;
  node.focus({preventScroll:true});
  return true;
}

/** Physical viewport geometry; results are relative to the supplied anchor. */
export function overlayGeometry(anchor,size,viewport,{
  gap=6,margin=8,maxHeight=320,align="start",matchWidth=false
}={}){
  const left=viewport.left??0,top=viewport.top??0;
  const right=left+Math.max(0,viewport.width),bottom=top+Math.max(0,viewport.height);
  const availableWidth=Math.max(0,right-left-2*margin);
  const width=Math.min(availableWidth,Math.max(0,matchWidth?anchor.width:size.width));
  const below=Math.max(0,bottom-margin-anchor.bottom-gap);
  const above=Math.max(0,anchor.top-top-margin-gap);
  const desired=Math.min(maxHeight,Math.max(0,size.height));
  const placement=below<desired&&above>below?"top":"bottom";
  const height=Math.min(desired,placement==="top"?above:below);
  const wanted=align==="end"?anchor.right-width:anchor.left;
  const x=Math.max(left+margin,Math.min(wanted,right-margin-width));
  return {placement,left:x-anchor.left,width,maxHeight:height,gap};
}

/** Opt-in native top layer, without reparenting Shadow DOM or losing tokens.
 * Older webviews fall back to the existing anchored placement.
 */
export function openOverlayTopLayer(panel){
  if(!panel?.isConnected||typeof panel.showPopover!=="function"||typeof panel.hidePopover!=="function")return false;
  if(panel.dataset.cuTopLayer==="true"&&panel.matches?.(":popover-open")!==false)return true;
  panel.setAttribute("popover","manual");
  // Override UA popover centering; preserve the component's own styles.
  panel.dataset.cuTopLayer="true";
  try{panel.showPopover();return true;}
  catch{delete panel.dataset.cuTopLayer;panel.removeAttribute("popover");return false;}
}
export function closeOverlayTopLayer(panel){
  if(panel?.dataset?.cuTopLayer!=="true")return;
  try{panel.hidePopover();}catch{/* The host may already be disconnected. */}
  delete panel.dataset.cuTopLayer;
  panel.removeAttribute("popover");
  for(const key of ["position","margin","inset","left","right","top","bottom","width","minWidth","maxHeight"])panel.style[key]="";
}
export function overlayViewportPosition(anchor,result){
  return {left:anchor.left+result.left,top:result.placement==="top"?anchor.top-result.gap-result.maxHeight:anchor.bottom+result.gap};
}

/** Keep a popup in the visual viewport; opt-in top layer avoids ancestor clipping. */
export function placeAnchoredOverlay(anchor,panel,options={}){
  if(!anchor||!panel||panel.hidden)return null;
  const view=anchor.ownerDocument?.defaultView??globalThis.window;
  if(!view)return null;
  const viewport=view.visualViewport;
  const rect=anchor.getBoundingClientRect();
  const topLayer=options.topLayer===true&&openOverlayTopLayer(panel);
  if(topLayer)Object.assign(panel.style,{position:"fixed",margin:"0",inset:"auto",left:"0px",top:"0px",right:"auto",bottom:"auto"});
  // Measure the natural width again so a popup can grow after viewport expansion.
  panel.style.width="";panel.style.minWidth="";
  const bounds=panel.getBoundingClientRect();
  const computed=view.getComputedStyle?.(panel);
  const borders=(parseFloat(computed?.borderTopWidth)||0)+(parseFloat(computed?.borderBottomWidth)||0);
  // scrollHeight remains useful after the previous placement constrained height.
  const size={width:options.matchWidth?rect.width:bounds.width,
    height:Math.max(bounds.height,(panel.scrollHeight||0)+borders)};
  const result=overlayGeometry(rect,size,{
    left:viewport?.offsetLeft??0,top:viewport?.offsetTop??0,
    width:viewport?.width??view.innerWidth,height:viewport?.height??view.innerHeight
  },options);
  const absolute=overlayViewportPosition(rect,result);
  Object.assign(panel.style,{
    left:(topLayer?absolute.left:result.left)+"px",right:"auto",
    top:topLayer?absolute.top+"px":result.placement==="bottom"?"calc(100% + "+result.gap+"px)":"auto",
    bottom:topLayer?"auto":result.placement==="top"?"calc(100% + "+result.gap+"px)":"auto",
    minWidth:"0",width:result.width+"px",maxHeight:result.maxHeight+"px"
  });
  if(options.allowOverflow)panel.style.overflow=size.height<=result.maxHeight?"visible":"auto";
  panel.dataset.placement=result.placement;
  return result;
}

/** Attach geometry refresh only while a component is connected. */
export function watchOverlayViewport(host,callback){
  const view=host.ownerDocument?.defaultView??globalThis.window;
  if(!view)return ()=>{};
  view.addEventListener("resize",callback);
  view.addEventListener("scroll",callback,true);
  // Scroll events do not cross shadow boundaries; follow composed ancestry.
  const roots=new Set();
  for(let node=host;node;){
    const root=node.getRootNode?.();if(root?.host)roots.add(root);
    node=node.assignedSlot??node.parentNode??(node.host||null);
  }
  for(const root of roots)root.addEventListener("scroll",callback,true);
  view.visualViewport?.addEventListener("resize",callback);
  view.visualViewport?.addEventListener("scroll",callback);
  // Layout changes can resize an anchor without a window resize (e.g. a split panel).
  const Observer=view.ResizeObserver;
  let active=true;const observer=typeof Observer==="function"?new Observer((...args)=>{if(active&&host.isConnected!==false)callback(...args);}):null;
  observer?.observe(host);
  return ()=>{
    if(!active)return;active=false;
    observer?.disconnect();
    view.removeEventListener("resize",callback);
    view.removeEventListener("scroll",callback,true);
    for(const root of roots)root.removeEventListener("scroll",callback,true);
    view.visualViewport?.removeEventListener("resize",callback);
    view.visualViewport?.removeEventListener("scroll",callback);
  };
}
