const keys=['location','email','phone','whatsapp','facebook','instagram','youtube','linkedin','tiktok'];
const domains={facebook:['facebook.com','www.facebook.com'],instagram:['instagram.com','www.instagram.com'],youtube:['youtube.com','www.youtube.com','youtu.be'],linkedin:['linkedin.com','www.linkedin.com'],tiktok:['tiktok.com','www.tiktok.com']};
export function validContact(values){
 if(!values||typeof values!=='object'||!keys.every(key=>typeof values[key]==='string'&&values[key].length<=254))return false;
 if(!values.location.trim()||values.location.length>200)return false;
 if(values.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))return false;
 if(values.phone&&(!/^\+?[0-9 ()-]+$/.test(values.phone)||!/^[0-9]{7,15}$/.test(values.phone.replace(/\D/g,''))))return false;
 if(values.whatsapp&&!/^\+[1-9][0-9]{7,14}$/.test(values.whatsapp.replace(/[ ()-]/g,'')))return false;
 for(const key of Object.keys(domains))if(values[key]){try{const url=new URL(values[key]);if(url.protocol!=='https:'||!domains[key].includes(url.hostname)||url.username||url.password||url.port)return false;}catch{return false;}}
 return true;
}
