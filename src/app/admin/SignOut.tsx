'use client';
import {useState} from 'react';
import {createAuthClient} from '@neondatabase/auth/next';
const client=createAuthClient();
export default function SignOut(){const [pending,setPending]=useState(false);const [error,setError]=useState('');return <><button className="btn" disabled={pending} onClick={async()=>{setPending(true);setError('');try{const result=await client.signOut();if(result.error)setError('Unable to sign out. Please try again.');else window.location.assign('/admin/login');}catch{setError('Unable to sign out. Please try again.');}finally{setPending(false);}}}>{pending?'Signing out…':'Sign out'}</button><p role="alert">{error}</p></>}
