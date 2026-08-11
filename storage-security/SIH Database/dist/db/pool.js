"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
const pg_1 = __importDefault(require("pg"));
const config_js_1 = require("../config.js");
const { Pool } = pg_1.default;
exports.dbPool = new Pool({
    host: config_js_1.CONFIG.PG.host,
    port: config_js_1.CONFIG.PG.port,
    user: config_js_1.CONFIG.PG.user,
    password: config_js_1.CONFIG.PG.password,
    database: config_js_1.CONFIG.PG.database,
    ssl: config_js_1.CONFIG.PG.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
//# sourceMappingURL=pool.js.map