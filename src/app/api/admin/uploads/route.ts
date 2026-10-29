import {limitedJson} from '../../../../server/http/json.mjs';
import {randomUUID} from 'node:crypto';
import {adminMember} from '../../../../server/auth';
import {database} from '../../../../server/db';
import {uploadUrl} from '../../../../server/media/storage';
import {validUpload} from '../../../../features/media/validation.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 const member=await adminMember();if(!member)return Response.json({error:'Unauthorized'},{status:401});
 let input;try{input=await limitedJson(request);}catch{return Response.json({error:'Invalid upload'},{status:400});}
 if(!validUpload(input))return Response.json({error:'Choose a JPEG, PNG or WebP up to 12 MB, add a description and confirm permission.'},{status:400});
 const client=await database().connect();const id=randomUUID();
 try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(51922)');const project=await client.query("SELECT id FROM projects WHERE id=$1 AND status='draft' FOR UPDATE",[input.projectId]);if(!project.rowCount)throw Error('Draft project required');
 const quota=await client.query("SELECT count(*) AS today FROM media_assets WHERE created_by=$1 AND created_at>now()-interval '1 day'",[member.user_id]);if(Number(quota.rows[0].today)>=100)throw Error('Daily upload allowance reached');
 const total=await client.query('SELECT coalesce(sum(bytes),0) AS bytes FROM media_assets');if(Number(total.rows[0].bytes)+input.size>500*1024*1024)throw Error('Development media allowance reached');
 await client.query("INSERT INTO media_assets(id,provider,provider_asset_id,kind,mime_type,bytes,alt_text,rights_confirmed,created_by) VALUES($1,'neon',$2,'image',$3,$4,$5,true,$6)",[id,`media/${id}/image.webp`,input.type,input.size,input.alt.trim(),member.user_id]);
 await client.query("INSERT INTO project_media(project_id,asset_id,sort_order) SELECT $1,$2,coalesce(max(sort_order)+1,0) FROM project_media WHERE project_id=$1",[input.projectId,id]);
 const url=await uploadUrl(id,input.type,input.size);await client.query('COMMIT');return Response.json({id,url},{headers:{'Cache-Control':'no-store'}});
 }catch{await client.query('ROLLBACK');return Response.json({error:'Could not start upload. Use a draft project and check the media allowance.'},{status:400});}finally{client.release();}
}
