import 'server-only';
import {database} from './db';
export const serviceDefaults=[{slug:'photography-films',title:'Photography & Films',description:'Wedding, pre-wedding, post-wedding and Pasni coverage—through photographs and video.',status:'published'},{slug:'design-motion',title:'Design & Motion',description:'Graphic design, banner design and motion work for the message you want to share.',status:'published'}];
export async function studioServices(){const result=await database().query('SELECT slug,title,description,status FROM services ORDER BY sort_order,slug');return serviceDefaults.map(service=>({...service,...result.rows.find(row=>row.slug===service.slug)}));}
