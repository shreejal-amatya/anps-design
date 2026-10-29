export const services=['Photography & Films','Wedding coverage','Pre / Post Wedding','Rice Feeding / Pasni','Graphic & Banner Design','Motion & Video','Something else'];
export function validateEnquiry(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {error:'Please check the enquiry details.'};
 const text=(key)=>typeof value[key]==='string'?value[key].trim():'';
 const name=text('name'),contact=text('contact'),service=text('service'),date=text('date'),location=text('location'),message=text('message'),budget=text('budget'),key=text('submissionKey');
 if(text('website'))return {error:'Unable to submit this enquiry.'};
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))return {error:'Please refresh the page and try again.'};
 if(!name||name.length>120||/[\x00-\x1f]/.test(name))return {error:'Enter your name (up to 120 characters).'};
 const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
 const phone=/^[+()\d\s.-]+$/.test(contact)&&contact.replace(/\D/g,'').length>=7&&contact.replace(/\D/g,'').length<=15;
 if(contact.length>254||(!email&&!phone)||/[\x00-\x1f]/.test(contact))return {error:'Enter a valid phone number or email address.'};
 if(!services.includes(service))return {error:'Choose a service.'};
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))return {error:'Enter a valid event date.'};
 if(location.length>200||budget.length>120)return {error:'Shorten the event location or budget.'};
 if(message.length<10||message.length>5000)return {error:'Enter a message between 10 and 5,000 characters.'};
 if(value.consent!==true)return {error:'Please agree to ANPS using these details to respond.'};
 return {data:{name,contact,service,date,location,message,budget,submissionKey:key}};
}
