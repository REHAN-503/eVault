import fs from 'fs/promises';
import path from 'path';
import { dbPool } from './pool.js';

export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
  const fileName = direction === 'up' ? '001_initial_schema.up.sql' : '001_initial_schema.down.sql';
  const filePath = path.resolve(process.cwd(), 'migrations', fileName);

  console.log(`[DB Migrate] Executing migration: ${fileName}...`);
  const sql = await fs.readFile(filePath, 'utf-8');

  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`[DB Migrate] Successfully executed ${fileName}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[DB Migrate] Error running ${fileName}:`, err);
    throw err;
  } finally {
    client.release();
  }
}

// If invoked directly from terminal command (npm run db:migrate)
if (process.argv[1] && process.argv[1].includes('migrate')) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  runMigrations(direction)
    .then(() => {
      console.log('[DB Migrate] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB Migrate] Migration failed:', err.message);
      process.exit(1);
    });
}
