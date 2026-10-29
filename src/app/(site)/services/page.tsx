import ServiceCards from '../../../components/ServiceCards';
export const dynamic='force-dynamic';
export const metadata={title:'Services',alternates:{canonical:"/services"}};
export default function Page(){return <><section className="page-hero"><div className="wrap"><div className="breadcrumb"><a href="/">Home</a> / Services</div><h1>Services for<br/><em>stories & ideas.</em></h1><p>Photography, films and visual design from ANPS.</p></div></section><ServiceCards/></>}
