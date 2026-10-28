import {validateEnvironment} from "../../../server/config.mjs";
export const dynamic="force-dynamic";
export async function GET(){try{validateEnvironment(process.env);return Response.json({status:"foundation-ready",enquiries:"not-configured",admin:"not-configured"},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({status:"configuration-error"},{status:503,headers:{"Cache-Control":"no-store"}})}}
