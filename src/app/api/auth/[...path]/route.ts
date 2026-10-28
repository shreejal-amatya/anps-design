import {NextRequest} from 'next/server';
import {authentication} from '../../../../server/auth';
export const dynamic='force-dynamic';
// Invite-only studio admin: no public registration, identity changes or provider admin APIs.
const allowed=new Set(['get-session','sign-in/email','sign-out']);
async function handle(request:NextRequest, context:{params:Promise<{path:string[]}>}){
 const path=new URL(request.url).pathname.replace('/api/auth/','');
 if(!allowed.has(path))return Response.json({error:'Not found'},{status:404});
 if(request.method==='POST' && request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 try {const handlers=authentication().handler();return request.method==='GET'?handlers.GET(request,context):handlers.POST(request,context);}catch{return Response.json({error:'Authentication unavailable'},{status:503});}
}
export const GET=handle;
export const POST=handle;
