/** Progressive-enhancement DOM controllers (experimental). */
export interface PageResult<T> {
  items:T[];page:number;pageSize:number;totalItems:number;
  totalPages:number;start:number;end:number;
}
export declare function paginate<T>(items:T[],pageSize:number,page?:number):PageResult<T>;
export interface Command {
  label:string;description?:string;keywords?:string[];[key:string]:unknown;
}
export declare function filterCommands<T extends Command>(commands:T[],query?:string):T[];
export declare function nextRovingIndex(index:number,length:number,key:string):number;
export declare function enhanceMenu(root:HTMLElement,options?:{
  onSelect?:(value:string,item:HTMLElement)=>void
}):()=>void;
export declare function enhancePopover(root:HTMLElement):()=>void;
export declare function enhanceDialogTrigger(
  trigger:HTMLElement,dialog:HTMLDialogElement
):()=>void;
export declare function enhancePagination<T>(root:HTMLElement,options:{
  items:T[];renderItem:(item:T,index:number)=>Node;pageSize?:number;
}):{
  readonly page:number;goTo(page:number):PageResult<T>;refresh():PageResult<T>;
};
export declare function enhanceCommandPalette(
  dialog:HTMLDialogElement,
  options?:{trigger?:HTMLElement;commands?:Command[];onSelect?:(command:Command)=>void}
):unknown;
