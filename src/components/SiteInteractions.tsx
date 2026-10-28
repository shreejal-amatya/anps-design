"use client";
import {useEffect} from "react";
export default function SiteInteractions(){useEffect(()=>{
 const controller=new AbortController();const options={signal:controller.signal};
 const menu=document.querySelector<HTMLButtonElement>(".menu-toggle");const nav=document.querySelector(".navlinks");
 menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close navigation":"Open navigation");nav?.classList.toggle("is-open",open)},options);
 document.querySelectorAll<HTMLButtonElement>(".filter").forEach(button=>button.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
 document.querySelectorAll<HTMLElement>(".work-card").forEach(card=>{card.hidden=button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter});
 },options));
 document.querySelector<HTMLFormElement>("#quote-form")?.addEventListener("submit",event=>{event.preventDefault();const status=document.querySelector("#form-status");if(status)status.textContent="Enquiries are not connected yet. Your details have not been sent or saved."},options);
 return()=>controller.abort();
 },[]);return null;}
