import {moveCalendarDate} from "./calendar.js";
export function validScheduleDate(value){return typeof value==="string"&&Boolean(moveCalendarDate(value,0));}
export function scheduleToday(){
  const d=new Date();
  return String(d.getFullYear()).padStart(4,"0")+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
export function scheduleDayDistance(start,end){
  if(!validScheduleDate(start)||!validScheduleDate(end))return NaN;
  return (Date.parse(end+"T00:00:00Z")-Date.parse(start+"T00:00:00Z"))/86400000;
}
export function validScheduleTime(value){return typeof value==="string"&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);}
