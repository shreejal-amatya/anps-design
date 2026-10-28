'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function saveProject(id:string|null,form:FormData){
 const member=await requireAdmin();
 const title=String(form.get('title')??'').trim();const slug=String(form.get('slug')??'').trim();const summary=String(form.get('summary')??'').trim();
 const story=String(form.get('story')??'').trim();const status=String(form.get('status')??'draft');
 const destination=id&&uuid.test(id)?`/admin/works/${id}`:'/admin/works/new';
 if((id&&!uuid.test(id))||!title||title.length>160||!slug||slug.length>120||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(slug)||summary.length>500||story.length>10000||!['draft','archived'].includes(status))redirect(destination+'?error=validation');
 const client=await database().connect();let savedId:string|undefined;let failed=false;
 try{await client.query('BEGIN');
 const result=id?await client.query("UPDATE projects SET title=$1,slug=$2,summary=$3,body=$4,status=$5,updated_at=now() WHERE id=$6 AND status<>'published' RETURNING id",[title,slug,summary,JSON.stringify({story}),status,id]):await client.query('INSERT INTO projects(title,slug,summary,body,status) VALUES($1,$2,$3,$4,$5) RETURNING id',[title,slug,summary,JSON.stringify({story}),status]);
 savedId=result.rows[0]?.id;if(!savedId)throw new Error('Project not editable');
 await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,id?'project.updated':'project.created',savedId]);await client.query('COMMIT');
 }catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect(destination+'?error=save');
 revalidatePath('/admin');revalidatePath('/admin/works');redirect(`/admin/works/${savedId}?saved=1`);
}
