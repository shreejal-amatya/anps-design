import 'server-only';
import {cache} from 'react';
import {database} from './db';
export type ContactSettings={location:string;email:string;phone:string;whatsapp:string;facebook:string;instagram:string;youtube:string;linkedin:string;tiktok:string};
export const defaultContact:ContactSettings={location:'Shorakhutte, Kathmandu, Nepal',email:'',phone:'',whatsapp:'',facebook:'https://www.facebook.com/anpsdesign',instagram:'https://www.instagram.com/anpsdesign/',youtube:'',linkedin:'',tiktok:''};
export const contactSettings=cache(async ():Promise<ContactSettings>=>{const result=await database().query("SELECT value FROM site_settings WHERE key='contact'");return {...defaultContact,...result.rows[0]?.value};});
