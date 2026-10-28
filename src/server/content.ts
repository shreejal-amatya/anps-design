import fs from "node:fs";
import path from "node:path";
import parse from "html-react-parser";
// Trusted, versioned design markup only. Never parse user-submitted HTML here.
export function designContent(slug:string){return parse(fs.readFileSync(path.join(process.cwd(),"src/content",`${slug}.html`),"utf8"));}
