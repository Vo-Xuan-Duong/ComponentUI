import {performance} from "node:perf_hooks";
import {virtualListRange} from "../packages/web/src/components/virtual-list.js";
import {flattenTreeList} from "../packages/web/src/components/tree-list.js";
import {reconcileVirtualWindow} from "../packages/web/src/components/_shared.js";
import {sortTableRows} from "../packages/web/src/components/data-table.js";
import {filterTableRows,uniqueTableFilterValues} from "../packages/web/src/components/filter-utils.js";
const count=100000;
const rows=Array.from({length:count},(_,i)=>({id:i,name:"Record "+(count-i),status:i%3===0?"Active":"Draft",rank:count-i}));
const tree=Array.from({length:1000},(_,i)=>({id:"f"+i,children:Array.from({length:99},(_,j)=>({id:i+"-"+j}))}));
const expanded=new Set(tree.map(x=>x.id));
function measure(label,fn){
 fn();const samples=[];let result;
 for(let i=0;i<5;i++){const start=performance.now();result=fn();samples.push(performance.now()-start);}
 samples.sort((a,b)=>a-b);return {operation:label,medianMs:Number(samples[2].toFixed(3)),result};
}
const output=[
 measure("100k rows: filter",()=>filterTableRows(rows,{status:["Active"]}).length),
 measure("100k rows: text sort",()=>sortTableRows(rows,"name").length),
 measure("100k rows: distinct names",()=>uniqueTableFilterValues(rows,"name").length),
 measure("100k tree nodes: flatten",()=>flattenTreeList(tree,expanded).length),
 measure("1k one-row scroll steps",()=>{let state=null,created=0,maxWindow=0;for(let i=0;i<1000;i++){const range=virtualListRange(i*40,400,count,40,5);state=reconcileVirtualWindow(state,range.start,range.end,0,index=>{created++;return {index};});maxWindow=Math.max(maxWindow,state.nodes.size);}return "created "+created+"; max window "+maxWindow;})
];
console.table(output);
console.log("Node.js helper benchmark only; does not measure DOM, FPS or browser heap.");
