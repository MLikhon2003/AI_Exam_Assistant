import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      }
);

export function query(text, params) {
  return pool.query(text, params);
}

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
});
