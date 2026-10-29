import sharp from 'sharp';
export async function encodePortfolioImage(bytes){
 const metadata=await sharp(bytes,{limitInputPixels:40000000}).metadata();
 if(!['jpeg','png','webp'].includes(metadata.format??'')||(metadata.pages??1)>1||!metadata.width||!metadata.height||metadata.width<128||metadata.height<128)throw new Error('Unsupported image');
 const full=await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
 const thumb=await sharp(full.data).resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();
 return {full,thumb};
}
