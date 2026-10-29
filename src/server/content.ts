import ContactDetails from '../components/ContactDetails';
import fs from "node:fs";
import path from "node:path";
import parse,{Element} from "html-react-parser";
import {createElement,type ReactNode} from "react";
import EnquiryForm from "../features/enquiries/EnquiryForm";
// Trusted, versioned design markup only. Never parse user-submitted HTML here.
export function designContent(slug:string,replacements?:{work?:ReactNode;hero?:ReactNode;services?:ReactNode;contact?:ReactNode}){return parse(fs.readFileSync(path.join(process.cwd(),"src/content",`${slug}.html`),"utf8"),{replace(node){if(node instanceof Element && node.attribs.id==="services" && replacements?.services)return createElement("div",null,replacements.services);if(node instanceof Element && node.attribs.class?.split(" ").includes("contact-detail"))return createElement("div",null,replacements?.contact??createElement(ContactDetails));if(node instanceof Element && node.attribs.id==="work" && replacements?.work)return createElement("div",null,replacements.work);if(node instanceof Element && node.attribs.class?.split(" ").includes("hero-visual") && replacements?.hero)return createElement("div",{className:"hero-visual"},replacements.hero);if(node instanceof Element && node.name==="form" && node.attribs.id==="quote-form")return createElement(EnquiryForm,{development:process.env.APP_ENV!=="production"});}});}
