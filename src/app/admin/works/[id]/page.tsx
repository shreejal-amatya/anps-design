import {notFound} from 'next/navigation';
import AdminFrame,{requireAdmin} from '../../../../components/admin/AdminFrame';
import ProjectForm from '../../../../components/admin/ProjectForm';
import {database} from '../../../../server/db';
export const dynamic='force-dynamic';
export default async function EditProject({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;saved?:string}>}){const member=await requireAdmin();const {id}=await params;const query=await searchParams;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const result=await database().query('SELECT id,title,slug,summary,body,status FROM projects WHERE id=$1',[id]);const project=result.rows[0];if(!project)notFound();return <AdminFrame role={member.role}><h1>Edit project</h1><section className="studio-panel">{project.status==='published'?<p>Published project editing is not enabled yet.</p>:<ProjectForm project={project} error={query.error} saved={query.saved==='1'}/>}</section></AdminFrame>}
