'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
import {validContact} from '../../../features/settings/validation.mjs';
export async function saveSettings(form:FormData){
 const member=await requireAdmin();if(member.role!=='owner')throw Error('Owner access required');
 const values=Object.fromEntries(['location','email','phone','whatsapp','facebook','instagram'].map(key=>[key,String(form.get(key)??'').trim()]));
 if(!validContact(values))redirect('/admin/settings?error=validation');
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');await client.query("INSERT INTO site_settings(key,value) VALUES('contact',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()",[JSON.stringify(values)]);await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'settings.updated','contact']);await client.query('COMMIT');}catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect('/admin/settings?error=save');revalidatePath('/','layout');redirect('/admin/settings?saved=1');
}
