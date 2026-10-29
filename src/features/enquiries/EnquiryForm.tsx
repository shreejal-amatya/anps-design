'use client';
import Link from 'next/link';
import {useId,useRef,useState} from 'react';
import {services} from './validation.mjs';
export default function EnquiryForm({development=false}:{development?:boolean}){
 const prefix=useId();const key=useRef<string|null>(null);const formRef=useRef<HTMLFormElement>(null);
 const [pending,setPending]=useState(false);const [saved,setSaved]=useState(false);const [message,setMessage]=useState('');
 const id=(field:string)=>`${prefix}-${field}`;
 return <form ref={formRef} className="quote-form" onSubmit={async event=>{
  event.preventDefault();if(pending||saved)return;const form=new FormData(event.currentTarget);key.current??=crypto.randomUUID();setPending(true);setMessage('');
  try{const payload=Object.fromEntries(form.entries());const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,consent:form.get('consent')==='on',submissionKey:key.current})});const result=await response.json();if(response.ok&&result.saved===true){setSaved(true);setMessage(result.message);}else setMessage(result.error||'Unable to save your enquiry. Please retry.');}catch{setMessage('We could not confirm your enquiry was saved. Retry without changing your details.');}finally{setPending(false);}
 }}>
 <div className="field"><label htmlFor={id('name')}>Your name *</label><input id={id('name')} name="name" autoComplete="name" maxLength={120} required disabled={pending||saved}/></div>
 <div className="field"><label htmlFor={id('contact')}>Phone or email *</label><input id={id('contact')} name="contact" autoComplete="email" maxLength={254} required disabled={pending||saved}/></div>
 <div className="field field--wide"><label htmlFor={id('service')}>What can we help with? *</label><select id={id('service')} name="service" required defaultValue="" disabled={pending||saved}><option value="" disabled>Select a service</option>{services.map(service=><option key={service}>{service}</option>)}</select></div>
 <div className="field"><label htmlFor={id('date')}>Event date (optional)</label><input id={id('date')} name="date" type="date" disabled={pending||saved}/></div>
 <div className="field"><label htmlFor={id('location')}>Event location (optional)</label><input id={id('location')} name="location" maxLength={200} disabled={pending||saved}/></div>
 <div className="field field--wide"><label htmlFor={id('message')}>A little about your plans *</label><textarea id={id('message')} name="message" minLength={10} maxLength={5000} required disabled={pending||saved}/></div>
 <div className="field field--wide"><label htmlFor={id('budget')}>Optional budget range</label><input id={id('budget')} name="budget" maxLength={120} disabled={pending||saved}/></div>
 <div className="enquiry-trap" aria-hidden="true"><label htmlFor={id('website')}>Leave this empty<input id={id('website')} name="website" tabIndex={-1} autoComplete="off"/></label></div>
 <label className="enquiry-consent field--wide"><input type="checkbox" name="consent" required disabled={pending||saved}/> <span>I agree to ANPS using these details to respond to my enquiry. <Link href="/privacy">Privacy notice</Link></span></label>
 {development?<p className="form-note">Development test form: enquiries stay in the test workspace. Email notifications are not enabled.</p>:null}
 <div className="form-actions"><button className="btn" type="submit" disabled={pending||saved}>{pending?'Sending…':saved?'Enquiry saved':'Send enquiry'} <span aria-hidden="true">↗</span></button>{saved||message?<button type="button" disabled={pending} onClick={()=>{formRef.current?.reset();key.current=null;setSaved(false);setMessage('');}}>{saved?'Start another enquiry':'Clear and start again'}</button>:null}<span role="status" aria-live="polite" className="form-status">{message}</span></div>
 </form>;
}
