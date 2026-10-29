import {limitedJson} from '../../../../server/http/json.mjs';
import {NextRequest} from 'next/server';
import {authentication} from '../../../../server/auth';
import {database} from '../../../../server/db';
export const dynamic='force-dynamic';
// Invite-only studio admin: no public registration, identity changes or provider admin APIs.
const allowed=new Set(['get-session','sign-in/email-otp','email-otp/send-verification-otp','sign-out']);
async function handle(request:NextRequest, context:{params:Promise<{path:string[]}>}){
 const path=new URL(request.url).pathname.replace('/api/auth/','');
 if(!allowed.has(path))return Response.json({error:'Not found'},{status:404});
 if(request.method==='POST' && request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 if(request.method!==(path==='get-session'?'GET':'POST'))return Response.json({error:'Method not allowed'},{status:405});
 let body:any;
 if(request.method==='POST'&&path!=='sign-out'){try{body=await limitedJson(request.clone());}catch(error){return Response.json({error:'Invalid request'},{status:error instanceof RangeError?413:400});}}
 try {
  if(path==='sign-in/email-otp'||path==='email-otp/send-verification-otp'){
   if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
   if(!body||typeof body!=='object'||typeof body.email!=='string'||body.email.length>254)return Response.json({error:'Invalid request'},{status:400});
   const member=await database().query('SELECT 1 FROM admin_members m JOIN neon_auth."user" u ON u.id::text=m.user_id WHERE m.active=true AND lower(u.email)=lower($1)',[body.email.trim()]);
   if(!member.rowCount)return path==='email-otp/send-verification-otp'?Response.json({success:true}):Response.json({error:'Unable to sign in'},{status:403});
   if(path==='email-otp/send-verification-otp' && body.type!=='sign-in')return Response.json({error:'Invalid request'},{status:400});
  }
  const handlers=authentication().handler();return request.method==='GET'?handlers.GET(request,context):handlers.POST(request,context);}catch{return Response.json({error:'Authentication unavailable'},{status:503});}
}
export const GET=handle;
export const POST=handle;
