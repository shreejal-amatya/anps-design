import {notFound} from 'next/navigation';
import {requireAdmin} from '../../../../../components/admin/AdminFrame';
import {database} from '../../../../../server/db';
import {projectMedia} from '../../../../../server/media/projects';
import ProjectDetail from '../../../../../features/works/ProjectDetail';
export const dynamic='force-dynamic';
export default async function Preview({params}:{params:Promise<{id:string}>}){await requireAdmin();const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();const project=(await database().query('SELECT * FROM projects WHERE id=$1',[id])).rows[0];if(!project)notFound();return <ProjectDetail project={project} media={await projectMedia(id)} preview/>}
