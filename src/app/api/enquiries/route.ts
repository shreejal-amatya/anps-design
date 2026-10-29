import {database} from '../../../server/db';
import {validateEnquiry} from '../../../features/enquiries/validation.mjs';
import {saveEnquiry} from '../../../server/enquiries/save.mjs';
export const dynamic='force-dynamic';
const respond=(body:object,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!['development','production'].includes(process.env.APP_ENV??''))return respond({error:'Enquiries are unavailable. Nothing has been saved.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return respond({error:'Please submit from this website.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'Unsupported request format.'},415);
 let body:unknown;
 try{
  const reader=request.body?.getReader();if(!reader)return respond({error:'Enter your enquiry details.'},400);
  let bytes=0;const chunks:Uint8Array[]=[];
  while(true){const next=await reader.read();if(next.done)break;bytes+=next.value.byteLength;if(bytes>16384){await reader.cancel();return respond({error:'The enquiry is too large. Shorten your message.'},413);}chunks.push(next.value);}
  const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}body=JSON.parse(new TextDecoder().decode(buffer));
 }catch{return respond({error:'Please check the enquiry details.'},400);}
 const validated=validateEnquiry(body);if(!validated.data)return respond({error:validated.error},400);
 try{
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const result=await saveEnquiry(database(),validated.data,{ip,secret:process.env.ENQUIRY_RATE_LIMIT_SECRET});
  if(result.status==='limited')return respond({error:'Too many enquiries. Please wait 15 minutes before trying again.'},429);
  if(result.status==='conflict')return respond({error:'This submission was already used. Start a new enquiry to change its details.'},409);
  return respond({saved:true,message:process.env.APP_ENV==='development'?'Your test enquiry was saved in development.':'Thank you. Your enquiry has been saved.'},result.status==='saved'?201:200);
 }catch{return respond({error:'We could not confirm that your enquiry was saved. Please retry the same submission.'},503);}
}
