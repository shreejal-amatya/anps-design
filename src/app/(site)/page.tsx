import ServiceCards from '../../components/ServiceCards';
import Link from 'next/link';
import {designContent} from '../../server/content';
import {publishedProjects} from '../../server/media/projects';
import ProjectGrid from '../../features/works/ProjectGrid';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'/'}};
export default async function Home(){const projects=(await publishedProjects(null,true)).slice(0,6);const hero=projects.find(p=>p.category_slug==='weddings'&&p.cover_asset_id)??projects.find(p=>p.cover_asset_id);return designContent('home',{services:<ServiceCards/>,work:<section className="featured-real" id="work"><div className="wrap"><div className="section-head"><div><div className="eyebrow">Photography, films &amp; design</div><h2>Selected work</h2></div><Link className="btn btn--outline" href="/works">Explore all work ↗</Link></div><ProjectGrid projects={projects}/>{!projects.length?<p>Our portfolio is being prepared.</p>:null}</div></section>,hero:hero?<><img className="hero-real" src={`/media/${hero.cover_asset_id}`} alt={hero.alt_text||hero.title}/>{hero.body?.demo?<span className="sample-flag">ANPS demo portfolio</span>:null}<div className="hero-caption"><b>{hero.title}</b><span>ANPS Design</span></div></>:undefined});}
