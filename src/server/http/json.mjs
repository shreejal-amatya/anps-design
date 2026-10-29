export async function limitedJson(request,limit=4096){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new TypeError('JSON required');
 const reader=request.body?.getReader();if(!reader)throw new TypeError('Body required');const chunks=[];let bytes=0;
 while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>limit){await reader.cancel();throw new RangeError('Body too large');}chunks.push(part.value);}
 const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
}
