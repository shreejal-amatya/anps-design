import AdminFrame,{requireAdmin} from '../../../../components/admin/AdminFrame';
import ProjectForm from '../../../../components/admin/ProjectForm';
import {database} from '../../../../server/db';
export const dynamic='force-dynamic';
export default async function NewProject({searchParams}:{searchParams:Promise<{error?:string}>}){const member=await requireAdmin();const query=await searchParams;const categories=(await database().query('SELECT id,title FROM categories ORDER BY title')).rows;return <AdminFrame role={member.role}><h1>Create a project</h1><p>Save the details first, then add photos or a YouTube link.</p><section className="studio-panel"><ProjectForm categories={categories} error={query.error}/></section></AdminFrame>}
