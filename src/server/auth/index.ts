import 'server-only';
import {createNeonAuth} from '@neondatabase/auth/next/server';
import {database} from '../db';
export function authentication(){
 if(!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET)throw new Error('Admin authentication not configured');
 return createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL,cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET}});
}
export async function adminMember(){
 const {data:session}=await authentication().getSession();
 if(!session?.user)return null;
 const result=await database().query('SELECT user_id, role, enquiry_access FROM admin_members WHERE user_id=$1 AND active=true',[session.user.id]);
 return result.rows[0]??null;
}
