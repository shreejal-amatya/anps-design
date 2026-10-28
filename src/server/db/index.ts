import 'server-only';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
const globalDb = globalThis as unknown as {anpsPool?: Pool};
export function database() {
 if(!process.env.DATABASE_URL) throw new Error('Database not configured');
 if(!globalDb.anpsPool){globalDb.anpsPool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:10000});attachDatabasePool(globalDb.anpsPool);}
 return globalDb.anpsPool;
}
