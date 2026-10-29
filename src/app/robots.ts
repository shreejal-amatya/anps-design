import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return process.env.APP_ENV==='production'?{rules:[{userAgent:'*',allow:'/',disallow:['/admin','/api','/media']}],sitemap:'https://anpsdesign.com.np/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};}
