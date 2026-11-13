'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
const labels:Record<string,string>={works:'Projects',services:'Services',media:'Media',enquiries:'Enquiries',settings:'Settings',new:'New project',preview:'Preview',login:'Login'};
export default function AdminBreadcrumbs(){const pathname=usePathname();const parts=pathname.split('/').filter(Boolean);const crumbs=[{href:'/admin',label:'Overview'}];let href='/admin';for(const part of parts.slice(1)){href+=`/${part}`;const isId=/^[0-9a-f-]{36}$/i.test(part);crumbs.push({href,label:isId?'Project details':labels[part]??part.replaceAll('-',' ')})}return <nav className="studio-breadcrumbs" aria-label="Breadcrumb"><Link href="/admin">Studio</Link>{crumbs.slice(1).map((crumb,index)=><span key={crumb.href}><span aria-hidden="true">/</span>{index===crumbs.length-2?<strong>{crumb.label}</strong>:<Link href={crumb.href}>{crumb.label}</Link>}</span>)}</nav>}
