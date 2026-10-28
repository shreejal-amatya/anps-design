import {Client} from 'pg';
import {createHash} from 'node:crypto';
import {readdir,readFile} from 'node:fs/promises';
if(process.env.APP_ENV !== 'development') throw new Error('Migration runner currently supports development only');
const url=process.env.DATABASE_URL_UNPOOLED;
if(!url || new URL(url).hostname.includes('-pooler.')) throw new Error('Direct migration URL required');
if(new URL(url).pathname!=='/anps_development') throw new Error('Development database mismatch');
const client=new Client({connectionString:url,connectionTimeoutMillis:10000});
try {
 await client.connect();
 await client.query('SELECT pg_advisory_lock(741920)');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
 for(const name of (await readdir('db/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  const sql=await readFile(`db/migrations/${name}`,'utf8');const checksum=createHash('sha256').update(sql).digest('hex');
  const existing=await client.query('SELECT checksum FROM schema_migrations WHERE name=$1',[name]);
  if(existing.rowCount){if(existing.rows[0].checksum!==checksum)throw new Error('Applied migration checksum mismatch');continue;}
  await client.query('BEGIN');
  try {await client.query(sql);await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]);await client.query('COMMIT');console.log(`Applied ${name}`);}catch(e){await client.query('ROLLBACK');throw e;}
 }
} catch (error) { console.error('Migration failed:', error.code || error.name, '; no credentials logged.');process.exitCode=1;} finally {await client.end();}
