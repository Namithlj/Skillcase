const { Pool } = require('pg');
require('dotenv').config();

let pool;
const conn = process.env.DATABASE_URL;
if (!conn) {
  console.warn('DATABASE_URL not set — DB features will be disabled.');
  // Dummy pool to avoid null checks elsewhere
  pool = {
    query: () => { throw new Error('DATABASE_URL not configured'); },
    connect: () => { throw new Error('DATABASE_URL not configured'); }
  };
} else {
  try {
    const url = new URL(conn);
    const config = {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      user: url.username,
      password: typeof url.password === 'undefined' ? undefined : String(url.password),
      database: url.pathname ? url.pathname.slice(1) : undefined,
    };
    // If using a hosted DB (render, supabase, etc) enable ssl by default
    if (url.hostname && /render|supabase|neon|db\.cloud|postgres/.test(url.hostname)) {
      config.ssl = { rejectUnauthorized: false };
    }
    pool = new Pool(config);
    pool.on('error', (err) => {
      console.error('Postgres pool error:', err);
    });
  } catch (err) {
    console.error('Failed to initialize Postgres pool:', err.message || err);
    pool = {
      query: () => { throw new Error('Postgres pool initialization failed'); },
      connect: () => { throw new Error('Postgres pool initialization failed'); }
    };
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
