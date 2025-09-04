import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// T doit étendre QueryResultRow pour être compatible avec pg
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;
