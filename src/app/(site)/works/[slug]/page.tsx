import {notFound} from "next/navigation";
import {designContent} from "../../../../server/content";
const slugs=["weddings","pre-post-wedding","pasni","graphic-banner","motion-video"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:slug.replaceAll("-"," ")}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return designContent(slug)}
