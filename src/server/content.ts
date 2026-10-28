import fs from "node:fs";
import path from "node:path";
import parse,{Element} from "html-react-parser";
import {createElement} from "react";
import EnquiryForm from "../features/enquiries/EnquiryForm";
// Trusted, versioned design markup only. Never parse user-submitted HTML here.
export function designContent(slug:string){return parse(fs.readFileSync(path.join(process.cwd(),"src/content",`${slug}.html`),"utf8"),{replace(node){if(node instanceof Element && node.name==="form" && node.attribs.id==="quote-form")return createElement(EnquiryForm,{development:process.env.APP_ENV!=="production"});}});}
