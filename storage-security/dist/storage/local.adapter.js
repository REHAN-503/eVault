"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const aes256_js_1 = require("../crypto/aes256.js");
/**
 * Encrypted Local Directory Vault Storage Adapter (Fallback for IPFS / S3).
 * Simulates off-chain storage by generating deterministic IPFS-like Content Identifiers (CIDs).
 */
class LocalStorageAdapter {
    vaultDir;
    constructor(vaultDir = './storage_vault') {
        this.vaultDir = path_1.default.resolve(vaultDir);
    }
    async ensureVault() {
        await promises_1.default.mkdir(this.vaultDir, { recursive: true });
    }
    /**
     * Generates a mock IPFS CID v0 (Qm...) string based on buffer SHA-256 checksum.
     */
    generateMockCid(hash) {
        const rawHash = hash.replace(/^0x/, '');
        const b58 = crypto_1.default.createHash('sha256').update(rawHash).digest('hex').slice(0, 44);
        return `Qm${b58}`;
    }
    async uploadFile(encryptedBuffer) {
        await this.ensureVault();
        const hash = (0, aes256_js_1.computeFileHash)(encryptedBuffer);
        const cid = this.generateMockCid(hash);
        const filePath = path_1.default.join(this.vaultDir, `${cid}.enc`);
        await promises_1.default.writeFile(filePath, encryptedBuffer);
        return {
            cid,
            hash,
            size: encryptedBuffer.length,
            driver: 'local',
        };
    }
    async retrieveFile(cid) {
        await this.ensureVault();
        const filePath = path_1.default.join(this.vaultDir, `${cid}.enc`);
        try {
            const buffer = await promises_1.default.readFile(filePath);
            return buffer;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                throw new Error(`File not found in storage vault for CID: ${cid}`);
            }
            throw err;
        }
    }
}
exports.LocalStorageAdapter = LocalStorageAdapter;
//# sourceMappingURL=local.adapter.js.map