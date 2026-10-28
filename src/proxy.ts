import {NextRequest,NextResponse} from 'next/server';
import {authentication} from './server/auth';
export default async function proxy(request:NextRequest){
 if(request.nextUrl.pathname==='/admin/login')return NextResponse.next();
 try{return await authentication().middleware({loginUrl:'/admin/login'})(request);}catch{return new NextResponse('Admin unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}
export const config={matcher:['/admin/:path*']};
