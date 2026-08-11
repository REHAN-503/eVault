"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.CONFIG = {
    MASTER_KEK_HEX: process.env.MASTER_KEK_HEX ||
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    STORAGE_DRIVER: (process.env.STORAGE_DRIVER || 'local'),
    IPFS_API_URL: process.env.IPFS_API_URL || 'http://127.0.0.1:5001',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'sih1284-encrypted-documents',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    LOCAL_STORAGE_DIR: path_1.default.resolve(process.env.LOCAL_STORAGE_DIR || './storage_vault'),
    PG: {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'sih1284_evault',
        ssl: process.env.PGSSL === 'true',
    },
    STORAGE_SERVICE_PORT: parseInt(process.env.STORAGE_SERVICE_PORT || '4001', 10),
};
//# sourceMappingURL=config.js.map