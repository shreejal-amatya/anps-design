"use client";
import {useEffect} from "react";
import {usePathname} from 'next/navigation';
export default function SiteInteractions(){const pathname=usePathname();useEffect(()=>{
 const controller=new AbortController();const options={signal:controller.signal};
 const menu=document.querySelector<HTMLButtonElement>(".menu-toggle");const nav=document.querySelector(".navlinks");
 function close(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');nav?.classList.remove('is-open');}
 close();menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close navigation":"Open navigation");nav?.classList.toggle("is-open",open)},options);
 nav?.addEventListener('click',event=>{if((event.target as Element).closest('a'))close();},options);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){close();menu.focus();}},options);
 return()=>controller.abort();
 },[pathname]);return null;}
