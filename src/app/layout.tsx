import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"ANPS Design — Stories, frames & ideas",template:"%s | ANPS Design"},description:"Photography, films and creative design in Shorakhutte, Kathmandu.",metadataBase:new URL('https://anpsdesign.com.np'),openGraph:{type:'website',locale:'en_US',siteName:'ANPS Design',title:'ANPS Design — Stories, frames & ideas',description:'Photography, films and creative design in Shorakhutte, Kathmandu.'},robots:{index:process.env.APP_ENV==='production',follow:process.env.APP_ENV==='production'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
