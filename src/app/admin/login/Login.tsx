'use client';
import {useState} from 'react';
import {createAuthClient} from '@neondatabase/auth/next';
const client=createAuthClient();
export default function Login(){
 const [email,setEmail]=useState('');
 const [sent,setSent]=useState(false);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState('');
 return <form className="quote-form" onSubmit={async event=>{
  event.preventDefault();setPending(true);setError('');
  const form=new FormData(event.currentTarget);
  try {
   if(!sent){
    const result=await client.emailOtp.sendVerificationOtp({email:email.trim(),type:'sign-in'});
    if(result.error)setError('Unable to send a code. Please try again or contact the studio owner.');else setSent(true);
   }else{
    const result=await client.signIn.emailOtp({email:email.trim(),otp:String(form.get('otp')).trim()});
    if(result.error)setError('The code could not be verified. Check it or request a new code.');else window.location.assign('/admin');
   }
  }catch{setError('Sign-in is unavailable. Please try again.');}finally{setPending(false);}
 }}>
 <label className="field field--wide">Email<input name="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} disabled={sent||pending} required/></label>
 {sent?<><p className="field--wide" role="status">Check your inbox for a sign-in code.</p><label className="field field--wide">Sign-in code<input name="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required autoFocus/></label></>:null}
 <button className="btn" disabled={pending}>{pending?'Please wait…':sent?'Verify and sign in':'Email me a sign-in code'}</button>
 {sent?<button type="button" disabled={pending} onClick={()=>{setSent(false);setError('');}}>Change email or request a new code</button>:null}
 <p className="field--wide" role="alert">{error}</p>
 </form>;
}
