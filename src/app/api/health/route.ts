import {validateEnvironment} from '../../../server/config.mjs';
import {database} from '../../../server/db';
export const dynamic='force-dynamic';
export async function GET(){try{
 validateEnvironment(process.env);
 const result=await database().query("SELECT name FROM schema_migrations WHERE name IN ('0001_content.sql','0002_enquiry_delivery.sql')");
 if(result.rowCount!==2 || !process.env.ENQUIRY_RATE_LIMIT_SECRET)throw new Error('Schema unavailable');
 return Response.json({status:'database-ready',schema:'0002',enquiries:'storage-ready',notifications:'not-configured',admin:'invite-only'},{headers:{'Cache-Control':'no-store'}});
}catch{return Response.json({status:'dependency-unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})}}
