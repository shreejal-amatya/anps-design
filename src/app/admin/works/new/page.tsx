import AdminFrame,{requireAdmin} from '../../../../components/admin/AdminFrame';
import ProjectForm from '../../../../components/admin/ProjectForm';
import {database} from '../../../../server/db';
export const dynamic='force-dynamic';
export default async function NewProject({searchParams}:{searchParams:Promise<{error?:string}>}){const member=await requireAdmin();const query=await searchParams;const [categories,services]=await Promise.all([database().query('SELECT id,title FROM categories ORDER BY title'),database().query("SELECT id,slug,title FROM services WHERE status<>'archived' ORDER BY sort_order,title")]);return <AdminFrame role={member.role}><h1>Create a project</h1><p>Use a project for a portfolio story such as a wedding, portrait or Pasni shoot. The public path is generated from the title; you do not need an external URL.</p><section className="studio-panel"><ProjectForm categories={categories.rows} services={services.rows} error={query.error}/></section></AdminFrame>}
