import {notFound,redirect} from 'next/navigation';
import {adminMember} from '../../../server/auth';
import SignOut from '../SignOut';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
export default async function Admin({params}:{params:Promise<{path?:string[]}>}){
 const {path}=await params;if(path?.length)notFound();
 const member=await adminMember();if(!member)redirect('/admin/login');
 return <main style={{maxWidth:900,margin:'80px auto',padding:24}}><h1>ANPS studio</h1><p>Signed in with {member.role} access.</p><p>Content management is being prepared. Publishing and uploads are not enabled yet.</p><SignOut/></main>;
}
