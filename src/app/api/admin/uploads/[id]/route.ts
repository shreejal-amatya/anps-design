import {adminMember} from '../../../../../server/auth';
import {database} from '../../../../../server/db';
import {processUpload,removeIncoming} from '../../../../../server/media/storage';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});const member=await adminMember();if(!member)return Response.json({error:'Unauthorized'},{status:401});
 const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return Response.json({error:'Not found'},{status:404});
 const result=await database().query("SELECT * FROM media_assets WHERE id=$1 AND provider='neon'",[id]);const asset=result.rows[0];if(!asset||(member.role!=='owner'&&asset.created_by!==member.user_id))return Response.json({error:'Not found'},{status:404});
 if(asset.processing_status==='ready')return Response.json({ready:true});
 try{const image=await processUpload(id);await database().query("UPDATE media_assets SET processing_status='ready',mime_type='image/webp',bytes=$2,width=$3,height=$4 WHERE id=$1 AND processing_status='pending'",[id,image.bytes,image.width,image.height]);await removeIncoming(id).catch(()=>{});return Response.json({ready:true});}
 catch{return Response.json({error:'The image could not be processed. Use a valid JPEG, PNG or WebP, then retry or remove the pending photo.'},{status:400});}
}
