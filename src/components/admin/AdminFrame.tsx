import Link from 'next/link';
import {redirect} from 'next/navigation';
import {adminMember} from '../../server/auth';
import SignOut from '../../app/admin/SignOut';
import AdminBreadcrumbs from './AdminBreadcrumbs';
export async function requireAdmin(){const member=await adminMember();if(!member)redirect('/admin/login');return member;}
export default function AdminFrame({children,role}:{children:React.ReactNode;role:string}){return <div className="studio"><header className="studio-header"><Link href="/admin" className="studio-brand">ANPS <span>Studio</span></Link><span className="studio-environment">Live production · {role}</span><SignOut/></header><div className="studio-grid"><aside><nav aria-label="Studio navigation"><Link href="/admin">Overview</Link><Link href="/admin/works">Projects</Link><Link href="/admin/services">Services</Link>{role==='owner'?<Link href="/admin/settings">Settings</Link>:null}<Link href="/admin/media">Media</Link><Link href="/admin/enquiries">Enquiries</Link><Link href="/" target="_blank">View live website ↗</Link></nav><p>Live production workspace. Saved changes update the connected website after publishing.</p></aside><main><AdminBreadcrumbs/>{children}</main></div></div>}
