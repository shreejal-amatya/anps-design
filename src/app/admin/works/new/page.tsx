import AdminFrame,{requireAdmin} from '../../../../components/admin/AdminFrame';
import ProjectForm from '../../../../components/admin/ProjectForm';
export const dynamic='force-dynamic';
export default async function NewProject({searchParams}:{searchParams:Promise<{error?:string}>}){const member=await requireAdmin();const query=await searchParams;return <AdminFrame role={member.role}><h1>Create a project</h1><p>Add the project details. You can return and edit them later.</p><section className="studio-panel"><ProjectForm error={query.error}/></section></AdminFrame>}
