import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const alt='ANPS Design — Photography, films and creative design in Kathmandu';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image(){const logo=await readFile(path.join(process.cwd(),'public/assets/anps-logo.svg'),'utf8');const source=logo.match(/href="(data:image\/png;base64,[^"]+)/)?.[1];return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',gap:64,padding:80,background:'#fff',color:'#151515',borderBottom:'18px solid #EB242B'}}>{source?<img src={source} width={220} height={220} alt=""/>:null}<div style={{display:'flex',flexDirection:'column',gap:20}}><div style={{fontSize:64,fontWeight:700,letterSpacing:-3}}>Stories, frames & ideas.</div><div style={{fontSize:30,color:'#555'}}>Photography · Films · Creative design</div><div style={{fontSize:24,color:'#555'}}>Shorakhutte, Kathmandu, Nepal</div></div></div>,size);}
