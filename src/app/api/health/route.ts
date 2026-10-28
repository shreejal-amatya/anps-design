import {validateEnvironment} from '../../../server/config.mjs';
import {database} from '../../../server/db';
export const dynamic='force-dynamic';
export async function GET(){try{
 validateEnvironment(process.env);
 const result=await database().query("SELECT name FROM schema_migrations WHERE name='0001_content.sql'");
 if(!result.rowCount)throw new Error('Schema unavailable');
 return Response.json({status:'database-ready',schema:'0001',enquiries:'not-configured',admin:'invite-only'},{headers:{'Cache-Control':'no-store'}});
}catch{return Response.json({status:'dependency-unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})}}
