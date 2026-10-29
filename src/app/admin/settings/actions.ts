'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
export async function saveSettings(form:FormData){
 const member=await requireAdmin();if(member.role!=='owner')throw Error('Owner access required');
 const values=Object.fromEntries(['location','email','phone','whatsapp','facebook','instagram'].map(key=>[key,String(form.get(key)??'').trim()]));
 let valid=values.location.length>0&&values.location.length<=200&&Object.values(values).every(v=>v.length<=254);
 if(values.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))valid=false;
 for(const key of ['phone','whatsapp'])if(values[key]&&!/^\+?[1-9][0-9 ()-]{6,24}$/.test(values[key]))valid=false;
 for(const key of ['facebook','instagram'])if(values[key]){try{const url=new URL(values[key]);const domain=key==='facebook'?'facebook.com':'instagram.com';if(url.protocol!=='https:'||![domain,'www.'+domain].includes(url.hostname)||url.username||url.password||url.port)valid=false;}catch{valid=false;}}
 if(!valid)redirect('/admin/settings?error=validation');
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');await client.query("INSERT INTO site_settings(key,value) VALUES('contact',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()",[JSON.stringify(values)]);await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'settings.updated','contact']);await client.query('COMMIT');}catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect('/admin/settings?error=save');revalidatePath('/','layout');redirect('/admin/settings?saved=1');
}
