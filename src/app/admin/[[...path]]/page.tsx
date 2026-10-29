import {notFound} from 'next/navigation';
import Link from 'next/link';
import AdminFrame,{requireAdmin} from '../../../components/admin/AdminFrame';
import {database} from '../../../server/db';
export const dynamic='force-dynamic';
export const metadata={title:'Studio overview',robots:{index:false,follow:false}};
export default async function Admin({params}:{params:Promise<{path?:string[]}>}){
 const {path}=await params;if(path?.length)notFound();const member=await requireAdmin();
 const canViewEnquiries=member.role==='owner'||member.enquiry_access;
 const counts=await database().query("SELECT (SELECT count(*) FROM projects) AS projects,(SELECT count(*) FROM projects WHERE status='draft') AS drafts,(SELECT count(*) FROM media_assets WHERE processing_status='ready') AS media");
 const enquiryCount=canViewEnquiries?(await database().query("SELECT count(*) FROM enquiries WHERE status='new'")).rows[0].count:null;
 const recent=await database().query('SELECT id,title,status,updated_at FROM projects ORDER BY updated_at DESC LIMIT 5');
 const c=counts.rows[0];
 return <AdminFrame role={member.role}><div className="studio-heading"><div><p className="studio-kicker">Your creative workspace</p><h1>Studio overview</h1><p>Manage portfolio drafts and keep track of incoming enquiries.</p></div><Link className="btn" href="/admin/works/new">Create project ↗</Link></div><section className="studio-metrics" aria-label="Studio totals">{[['Projects',c.projects],['Drafts',c.drafts],['Ready media',c.media],['New enquiries',enquiryCount??'Restricted']].map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><section className="studio-panel"><div className="studio-heading"><h2>Recent projects</h2><Link href="/admin/works">View all →</Link></div>{recent.rows.length?<ul className="studio-list">{recent.rows.map(p=><li key={p.id}><Link href={`/admin/works/${p.id}`}>{p.title}</Link><span className="studio-badge">{p.status}</span></li>)}</ul>:<div className="studio-empty"><h3>Your portfolio starts here</h3><p>Create a project draft with a title, category description and project story. Add photos or a YouTube film, preview the project and publish it when ready.</p><Link href="/admin/works/new">Create your first draft →</Link></div>}</section><section className="studio-panel"><h2>Setup progress</h2><ul className="studio-list"><li>Owner login and database <span className="studio-badge">Ready</span></li><li>Project drafts and enquiry inbox <span className="studio-badge">Ready</span></li><li>Photo uploads and portfolio publishing <span className="studio-badge">Ready</span></li><li>Website enquiry submission <span className="studio-badge">Ready</span></li><li>Email notifications <span className="studio-badge">Not configured</span></li></ul></section></AdminFrame>;
}
