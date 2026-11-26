/** Shared normalized progress semantics for linear and circular indicators. */
export function normalizeProgress(value,max=100){
  const limit=Number(max),safeMax=Number.isFinite(limit)&&limit>0?limit:100;
  if(value===null||value===undefined||String(value).trim()==="")
    return {value:null,max:safeMax,percent:null};
  const next=Number(value);
  if(!Number.isFinite(next))return {value:null,max:safeMax,percent:null};
  const bounded=Math.max(0,Math.min(safeMax,next));
  return {value:bounded,max:safeMax,percent:100*bounded/safeMax};
}
