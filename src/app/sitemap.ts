import type {MetadataRoute} from 'next';
import {database} from '../server/db';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(process.env.APP_ENV!=='production')return [];const base='https://anpsdesign.com.np';const projects=await database().query("SELECT slug,updated_at FROM projects WHERE status='published' ORDER BY slug");return [...['','/works','/services','/about','/contact','/privacy'].map(path=>({url:base+path})),...projects.rows.map(p=>({url:base+'/works/'+p.slug,lastModified:p.updated_at}))];}
