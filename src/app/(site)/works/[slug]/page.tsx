import {notFound} from 'next/navigation';
import {database} from '../../../../server/db';
import {projectMedia,publishedProjects} from '../../../../server/media/projects';
import ProjectDetail from '../../../../features/works/ProjectDetail';
import ProjectGrid from '../../../../features/works/ProjectGrid';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await database().query("SELECT title FROM projects WHERE slug=$1 AND status='published'",[slug])).rows[0];return {title:p?.title??slug.replaceAll('-',' ')};}
export default async function Project({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const project=(await database().query("SELECT * FROM projects WHERE slug=$1 AND status='published'",[slug])).rows[0];if(project)return <ProjectDetail project={project} media={await projectMedia(project.id)}/>;const category=(await database().query('SELECT title FROM categories WHERE slug=$1',[slug])).rows[0];if(!category)notFound();return <section className="wrap page-hero"><h1>{category.title}</h1><ProjectGrid projects={await publishedProjects(slug)}/></section>}
