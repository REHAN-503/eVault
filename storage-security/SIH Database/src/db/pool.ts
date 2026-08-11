import pg from 'pg';
import { CONFIG } from '../config.js';

const { Pool } = pg;

export const dbPool = new Pool({
  host: CONFIG.PG.host,
  port: CONFIG.PG.port,
  user: CONFIG.PG.user,
  password: CONFIG.PG.password,
  database: CONFIG.PG.database,
  ssl: CONFIG.PG.ssl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
