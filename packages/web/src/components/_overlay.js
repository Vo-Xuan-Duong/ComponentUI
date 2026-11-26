/** Shared, dependency-free anchored overlay and focus helpers. */
const openOverlays=[];
export function registerOverlay(host){
  unregisterOverlay(host);
  openOverlays.push(host);
}
export function unregisterOverlay(host){
  const index=openOverlays.indexOf(host);
  if(index>=0)openOverlays.splice(index,1);
}
export function isTopOverlay(host){
  return openOverlays.at(-1)===host;
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
  const height=Math.min(maxHeight,placement==="top"?above:below);
  const wanted=align==="end"?anchor.right-width:anchor.left;
  const x=Math.max(left+margin,Math.min(wanted,right-margin-width));
  return {placement,left:x-anchor.left,width,maxHeight:height,gap};
}

/** Keep an absolutely positioned popup inside the visual viewport.
 * Its containing block must be the supplied anchor (or have the same origin).
 * Does not escape clipping ancestors; native top-layer support is future work.
 */
export function placeAnchoredOverlay(anchor,panel,options={}){
  if(!anchor||!panel||panel.hidden)return null;
  const view=anchor.ownerDocument?.defaultView??globalThis.window;
  if(!view)return null;
  const viewport=view.visualViewport;
  const rect=anchor.getBoundingClientRect();
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
  Object.assign(panel.style,{
    left:result.left+"px",right:"auto",
    top:result.placement==="bottom"?"calc(100% + "+result.gap+"px)":"auto",
    bottom:result.placement==="top"?"calc(100% + "+result.gap+"px)":"auto",
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
  view.visualViewport?.addEventListener("resize",callback);
  view.visualViewport?.addEventListener("scroll",callback);
  return ()=>{
    view.removeEventListener("resize",callback);
    view.removeEventListener("scroll",callback,true);
    view.visualViewport?.removeEventListener("resize",callback);
    view.visualViewport?.removeEventListener("scroll",callback);
  };
}
