import type { NextConfig } from "next";
const config: NextConfig = {
 async redirects() { return [
 {source:"/index.html",destination:"/",permanent:true},
 ...["services","about","contact"].map(name=>({source:`/${name}.html`,destination:`/${name}`,permanent:true})),
 {source:"/portfolio/:slug.html",destination:"/works/:slug",permanent:true}
 ]; },
 async headers() { return [{source:"/admin/:path*",headers:[{key:"Cache-Control",value:"private, no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]}]; }
}; export default config;
