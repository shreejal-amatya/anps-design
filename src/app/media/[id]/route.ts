import {adminMember} from '../../../server/auth';
import {database} from '../../../server/db';
import {mediaUrl} from '../../../server/media/storage';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return new Response('Not found',{status:404});
 const result=await database().query("SELECT m.provider_asset_id,EXISTS(SELECT 1 FROM project_media pm JOIN projects p ON p.id=pm.project_id WHERE pm.asset_id=m.id AND p.status='published') AS published FROM media_assets m WHERE m.id=$1 AND m.provider='neon' AND m.processing_status='ready' AND m.rights_confirmed=true",[id]);
 const asset=result.rows[0];if(!asset)return new Response('Not found',{status:404});if(!asset.published&&!await adminMember())return new Response('Not found',{status:404,headers:{'Cache-Control':'private, no-store'}});
 try{return new Response(null,{status:307,headers:{Location:await mediaUrl(asset.provider_asset_id,new URL(request.url).searchParams.get('size')==='thumb'),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Media unavailable',{status:503});}
}
