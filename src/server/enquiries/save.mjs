import {createHash,createHmac} from 'node:crypto';
export function requestHash(data){const {submissionKey,...payload}=data;return createHash('sha256').update(JSON.stringify(payload)).digest('hex');}
export function rateKey(secret,scope,value){return createHmac('sha256',secret).update(scope+':'+value).digest('hex');}
export async function saveEnquiry(pool,data,{ip,secret}){
 if(!secret)throw new Error('Enquiry limits are not configured');
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[data.submissionKey]);
  const hash=requestHash(data);
  const existing=await client.query('SELECT request_hash FROM enquiries WHERE submission_key=$1',[data.submissionKey]);
  if(existing.rowCount){await client.query('ROLLBACK');return {status:existing.rows[0].request_hash===hash?'duplicate':'conflict'};}
  // One fixed-window counter per keyed IP/contact. No raw network address is stored.
  for(const [scope,value,limit] of [['ip',ip,5],['contact',data.contact.toLowerCase(),3]]){
   const result=await client.query("INSERT INTO enquiry_rate_limits(bucket_hash,window_start,requests) VALUES($1,date_trunc('hour',now()) + floor(extract(minute from now())/15)*interval '15 minutes',1) ON CONFLICT(bucket_hash) DO UPDATE SET window_start=EXCLUDED.window_start,requests=CASE WHEN enquiry_rate_limits.window_start=EXCLUDED.window_start THEN enquiry_rate_limits.requests+1 ELSE 1 END RETURNING requests",[rateKey(secret,scope,value)]);
   if(result.rows[0].requests>limit){await client.query('ROLLBACK');return {status:'limited'};}
  }
  const saved=await client.query('INSERT INTO enquiries(submission_key,request_hash,name,reply_contact,service_label,event_date,event_location,message,budget,consent_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) RETURNING id',[data.submissionKey,hash,data.name,data.contact,data.service,data.date||null,data.location||null,data.message,data.budget||null]);
  await client.query('INSERT INTO notification_outbox(enquiry_id) VALUES($1)',[saved.rows[0].id]);
  await client.query('COMMIT');return {status:'saved'};
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
