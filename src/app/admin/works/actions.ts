'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
import {youtubeId} from '../../../features/media/validation.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function refreshProject(id:string){revalidatePath('/');revalidatePath('/works');revalidatePath('/admin');revalidatePath('/admin/works');revalidatePath(`/admin/works/${id}`);}
export async function saveProject(id:string|null,form:FormData){
 const member=await requireAdmin();const title=String(form.get('title')??'').trim(),slug=String(form.get('slug')??'').trim(),summary=String(form.get('summary')??'').trim(),story=String(form.get('story')??'').trim();
 const category=String(form.get('category')??''),cover=String(form.get('cover')??'');const destination=id&&uuid.test(id)?`/admin/works/${id}`:'/admin/works/new';
 if((id&&!uuid.test(id))||!title||title.length>160||!slug||slug.length>120||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(slug)||summary.length>500||story.length>10000||!uuid.test(category)||(cover&&!uuid.test(cover)))redirect(destination+'?error=validation');
 const client=await database().connect();let savedId:string|undefined,failed=false;
 try{await client.query('BEGIN');if(id){const locked=await client.query("SELECT id FROM projects WHERE id=$1 AND status='draft' FOR UPDATE",[id]);if(!locked.rowCount)throw Error('Draft required');}
 if(cover){const valid=await client.query("SELECT 1 FROM project_media pm JOIN media_assets m ON m.id=pm.asset_id WHERE pm.project_id=$1 AND m.id=$2 AND m.kind='image' AND m.processing_status='ready' AND m.rights_confirmed=true",[id,cover]);if(!valid.rowCount)throw Error('Invalid cover');}
 const body=JSON.stringify({story,demo:form.get('demo')==='on'});
 const result=id?await client.query('UPDATE projects SET title=$1,slug=$2,summary=$3,body=$4,featured=$5,cover_asset_id=$6,updated_at=now() WHERE id=$7 RETURNING id',[title,slug,summary,body,form.get('featured')==='on',cover||null,id]):await client.query('INSERT INTO projects(title,slug,summary,body,featured) VALUES($1,$2,$3,$4,$5) RETURNING id',[title,slug,summary,body,form.get('featured')==='on']);
 savedId=result.rows[0]?.id;if(!savedId)throw Error('Project missing');
 await client.query('DELETE FROM project_categories WHERE project_id=$1',[savedId]);await client.query('INSERT INTO project_categories(project_id,category_id) VALUES($1,$2)',[savedId,category]);
 await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,id?'project.updated':'project.created',savedId]);await client.query('COMMIT');
 }catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect(destination+'?error=save');refreshProject(savedId!);redirect(`/admin/works/${savedId}?saved=1`);
}
export async function changePublication(id:string,form:FormData){
 const member=await requireAdmin();if(!uuid.test(id))throw Error('Invalid project');const status=String(form.get('status'));if(!['draft','published','archived'].includes(status))throw Error('Invalid status');
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');const result=await client.query('SELECT * FROM projects WHERE id=$1 FOR UPDATE',[id]);const project=result.rows[0];if(!project)throw Error('Missing project');
 if(status==='published'){
 const media=await client.query('SELECT m.* FROM project_media pm JOIN media_assets m ON m.id=pm.asset_id WHERE pm.project_id=$1',[id]);
 if(!media.rowCount||media.rows.some(m=>m.processing_status!=='ready'||!m.rights_confirmed||!m.alt_text))throw Error('Media not ready');
 if(media.rows.some(m=>m.kind==='image')&&!media.rows.some(m=>m.id===project.cover_asset_id&&m.kind==='image'))throw Error('Cover required');
 if(!(await client.query('SELECT 1 FROM project_categories WHERE project_id=$1',[id])).rowCount)throw Error('Category required');
 }
 await client.query("UPDATE projects SET status=$2,published_at=CASE WHEN $2='published' THEN coalesce(published_at,now()) ELSE published_at END,updated_at=now() WHERE id=$1",[id,status]);
 await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'project.'+status,id]);await client.query('COMMIT');
 }catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect(`/admin/works/${id}?error=publish`);refreshProject(id);redirect(`/admin/works/${id}?saved=1`);
}
export async function addVideo(id:string,form:FormData){
 const member=await requireAdmin();const videoId=youtubeId(String(form.get('url')??''));const title=String(form.get('title')??'').trim();if(!uuid.test(id)||!videoId||title.length<3||title.length>200||form.get('rights')!=='on')redirect(`/admin/works/${id}?error=video`);
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');if(!(await client.query("SELECT id FROM projects WHERE id=$1 AND status='draft' FOR UPDATE",[id])).rowCount)throw Error('Draft required');
 const asset=await client.query("INSERT INTO media_assets(provider,provider_asset_id,kind,video_id,alt_text,processing_status,rights_confirmed,created_by) VALUES('youtube',$1,'youtube',$1,$2,'ready',true,$3) ON CONFLICT(provider,provider_asset_id) DO UPDATE SET provider_asset_id=EXCLUDED.provider_asset_id RETURNING id",[videoId,title,member.user_id]);
 await client.query('INSERT INTO project_media(project_id,asset_id,sort_order) SELECT $1,$2,coalesce(max(sort_order)+1,0) FROM project_media WHERE project_id=$1 ON CONFLICT(project_id,asset_id) DO NOTHING',[id,asset.rows[0].id]);await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'project.video-added',id]);await client.query('COMMIT');
 }catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 refreshProject(id);redirect(`/admin/works/${id}?${failed?'error=video':'saved=1'}`);
}
export async function editMedia(id:string,assetId:string,form:FormData){
 const member=await requireAdmin();if(!uuid.test(id)||!uuid.test(assetId))throw Error('Invalid media');const action=String(form.get('action'));const alt=String(form.get('alt')??'').trim();
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');if(!(await client.query("SELECT id FROM projects WHERE id=$1 AND status='draft' FOR UPDATE",[id])).rowCount)throw Error('Draft required');const association=await client.query('SELECT sort_order FROM project_media WHERE project_id=$1 AND asset_id=$2',[id,assetId]);if(!association.rowCount)throw Error('Missing media');
 if(action==='remove'){await client.query('UPDATE projects SET cover_asset_id=null WHERE id=$1 AND cover_asset_id=$2',[id,assetId]);await client.query('DELETE FROM project_media WHERE project_id=$1 AND asset_id=$2',[id,assetId]);}
 else if(action==='description'){if(alt.length<5||alt.length>300)throw Error('Invalid description');await client.query('UPDATE media_assets SET alt_text=$2 WHERE id=$1',[assetId,alt]);}
 else if(['up','down'].includes(action)){const current=association.rows[0].sort_order;const other=await client.query(`SELECT asset_id,sort_order FROM project_media WHERE project_id=$1 AND sort_order ${action==='up'?'<':'>'} $2 ORDER BY sort_order ${action==='up'?'DESC':'ASC'} LIMIT 1`,[id,current]);if(other.rowCount){await client.query('UPDATE project_media SET sort_order=-1 WHERE project_id=$1 AND asset_id=$2',[id,assetId]);await client.query('UPDATE project_media SET sort_order=$3 WHERE project_id=$1 AND asset_id=$2',[id,other.rows[0].asset_id,current]);await client.query('UPDATE project_media SET sort_order=$3 WHERE project_id=$1 AND asset_id=$2',[id,assetId,other.rows[0].sort_order]);}}
 else throw Error('Invalid action');
 await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'media.'+action,assetId]);await client.query('COMMIT');
 }catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 refreshProject(id);redirect(`/admin/works/${id}?${failed?'error=media':'saved=1'}`);
}
