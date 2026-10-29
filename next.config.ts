import type { NextConfig } from "next";
const config: NextConfig = {
 async redirects() { return [
 {source:"/index.html",destination:"/",permanent:true},
 ...["services","about","contact"].map(name=>({source:`/${name}.html`,destination:`/${name}`,permanent:true})),
 {source:"/portfolio/:slug.html",destination:"/works/:slug",permanent:true}
 ]; },
 async headers() { return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Frame-Options",value:"DENY"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},{key:"Content-Security-Policy",value:"object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"}]},{source:"/admin/:path*",headers:[{key:"Cache-Control",value:"private, no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]}]; }
}; export default config;
