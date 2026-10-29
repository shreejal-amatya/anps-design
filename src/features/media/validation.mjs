export const imageTypes=['image/jpeg','image/png','image/webp'];
export const maxUploadBytes=12*1024*1024;
export function youtubeId(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 let id=null;if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)){if(u.pathname==='/watch')id=u.searchParams.get('v');else if(/^\/(embed|shorts)\//.test(u.pathname))id=u.pathname.split('/')[2];}
 return /^[a-zA-Z0-9_-]{11}$/.test(id??'')?id:null;
 }catch{return null;}
}
export function validUpload(input){return !!input&&imageTypes.includes(input.type)&&Number.isInteger(input.size)&&input.size>0&&input.size<=maxUploadBytes&&typeof input.alt==='string'&&input.alt.trim().length>=5&&input.alt.length<=300&&input.rights===true&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.projectId??'');}
