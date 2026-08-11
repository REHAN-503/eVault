"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const pool_js_1 = require("./pool.js");
async function runMigrations(direction = 'up') {
    const fileName = direction === 'up' ? '001_initial_schema.up.sql' : '001_initial_schema.down.sql';
    const filePath = path_1.default.resolve(process.cwd(), 'migrations', fileName);
    console.log(`[DB Migrate] Executing migration: ${fileName}...`);
    const sql = await promises_1.default.readFile(filePath, 'utf-8');
    const client = await pool_js_1.dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`[DB Migrate] Successfully executed ${fileName}`);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(`[DB Migrate] Error running ${fileName}:`, err);
        throw err;
    }
    finally {
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
//# sourceMappingURL=migrate.js.map