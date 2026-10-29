export function validContact(values){
 if(!values||typeof values!=='object'||!['location','email','phone','whatsapp','facebook','instagram'].every(key=>typeof values[key]==='string'&&values[key].length<=254))return false;
 if(!values.location.trim()||values.location.length>200)return false;
 if(values.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))return false;
 if(values.phone&&(!/^\+?[0-9 ()-]+$/.test(values.phone)||!/^[0-9]{7,15}$/.test(values.phone.replace(/\D/g,''))))return false;
 if(values.whatsapp&&!/^\+[1-9][0-9]{7,14}$/.test(values.whatsapp.replace(/[ ()-]/g,'')))return false;
 for(const key of ['facebook','instagram'])if(values[key]){try{const url=new URL(values[key]),domain=key==='facebook'?'facebook.com':'instagram.com';if(url.protocol!=='https:'||![domain,'www.'+domain].includes(url.hostname)||url.username||url.password||url.port)return false;}catch{return false;}}
 return true;
}
