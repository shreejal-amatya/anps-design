import 'server-only';
import {S3Client,GetObjectCommand,PutObjectCommand,HeadObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
let client:S3Client|undefined;
function storage(){if(!process.env.AWS_ACCESS_KEY_ID||!process.env.AWS_SECRET_ACCESS_KEY||!process.env.AWS_ENDPOINT_URL_S3)throw new Error('Media storage unavailable');return client??=new S3Client({region:process.env.AWS_REGION,endpoint:process.env.AWS_ENDPOINT_URL_S3,credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID,secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY},forcePathStyle:true,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});}
function bucket(){if(!process.env.MEDIA_BUCKET)throw new Error('Media bucket unavailable');return process.env.MEDIA_BUCKET;}
export async function uploadUrl(id:string,type:string,size:number){return getSignedUrl(storage(),new PutObjectCommand({Bucket:bucket(),Key:`incoming/${id}`,ContentType:type,ContentLength:size}),{expiresIn:300});}
export async function mediaUrl(key:string,thumbnail=false){const chosen=thumbnail?key.replace('/image.webp','/thumb.webp'):key;return getSignedUrl(storage(),new GetObjectCommand({Bucket:bucket(),Key:chosen,ResponseContentType:'image/webp',ResponseCacheControl:'private, max-age=60'}),{expiresIn:60});}
export async function processUpload(id:string){
 const rawKey=`incoming/${id}`;const head=await storage().send(new HeadObjectCommand({Bucket:bucket(),Key:rawKey}));
 if(!head.ContentLength||head.ContentLength>12*1024*1024)throw new Error('Image too large');
 const raw=await storage().send(new GetObjectCommand({Bucket:bucket(),Key:rawKey}));if(!raw.Body)throw new Error('Image missing');
 const reader=raw.Body.transformToWebStream().getReader();const chunks:Uint8Array[]=[];let total=0;
 while(true){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>12*1024*1024){await reader.cancel();throw new Error('Image too large');}chunks.push(part.value);}
 const bytes=Buffer.concat(chunks);

 const metadata=await sharp(bytes,{limitInputPixels:40000000}).metadata();if(!['jpeg','png','webp'].includes(metadata.format??'')||(metadata.pages??1)>1||!metadata.width||!metadata.height||metadata.width<128||metadata.height<128)throw new Error('Unsupported image');
 // Fresh encoding strips EXIF/GPS. Rotate applies orientation without cropping watermarks.
 const full=await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
 const thumb=await sharp(full.data).resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();
 const key=`media/${id}/image.webp`;
 for(const [Key,Body] of [[key,full.data],[`media/${id}/thumb.webp`,thumb]] as const)await storage().send(new PutObjectCommand({Bucket:bucket(),Key,Body,ContentType:'image/webp',CacheControl:'private, max-age=60'}));
 return {key,bytes:full.data.length+thumb.length,width:full.info.width,height:full.info.height};
}
export async function removeIncoming(id:string){await storage().send(new DeleteObjectCommand({Bucket:bucket(),Key:`incoming/${id}`}));}
