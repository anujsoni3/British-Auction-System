import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not configured. Database routes will fail until it is set.');
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
