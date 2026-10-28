'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
export async function updateEnquiryStatus(id:string,form:FormData){
 const member=await requireAdmin();if(member.role!=='owner'&&!member.enquiry_access)throw new Error('Access denied');
 const status=String(form.get('status')??'');if(!/^[0-9a-f-]{36}$/i.test(id)||!['new','contacted','quoted','won','closed','spam'].includes(status))throw new Error('Invalid enquiry update');
 const client=await database().connect();let failed=false;
 try{await client.query('BEGIN');const result=await client.query('UPDATE enquiries SET status=$1 WHERE id=$2 RETURNING id',[status,id]);if(!result.rowCount)throw new Error('Enquiry missing');await client.query('INSERT INTO audit_log(actor_id,action,entity_id) VALUES($1,$2,$3)',[member.user_id,'enquiry.status.'+status,id]);await client.query('COMMIT');}catch{await client.query('ROLLBACK');failed=true;}finally{client.release();}
 if(failed)redirect('/admin/enquiries?error=save');revalidatePath('/admin');revalidatePath('/admin/enquiries');redirect('/admin/enquiries?saved=1');
}
