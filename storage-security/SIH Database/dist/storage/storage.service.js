"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const config_js_1 = require("../config.js");
const ipfs_adapter_js_1 = require("./ipfs.adapter.js");
const local_adapter_js_1 = require("./local.adapter.js");
const s3_adapter_js_1 = require("./s3.adapter.js");
/**
 * Unified Storage Service Provider.
 * Automatically delegates uploadFile and retrieveFile requests to the configured storage driver
 * (IPFS, AWS S3, or Local Vault Fallback).
 */
class StorageService {
    activeAdapter;
    constructor(driver) {
        const selectedDriver = driver || config_js_1.CONFIG.STORAGE_DRIVER;
        switch (selectedDriver) {
            case 'ipfs':
                this.activeAdapter = new ipfs_adapter_js_1.IpfsStorageAdapter(config_js_1.CONFIG.IPFS_API_URL);
                break;
            case 's3':
                this.activeAdapter = new s3_adapter_js_1.S3StorageAdapter(config_js_1.CONFIG.S3_BUCKET_NAME, config_js_1.CONFIG.AWS_REGION);
                break;
            case 'local':
            default:
                this.activeAdapter = new local_adapter_js_1.LocalStorageAdapter(config_js_1.CONFIG.LOCAL_STORAGE_DIR);
                break;
        }
    }
    /**
     * Upload encrypted file buffer to configured off-chain storage engine.
     * @param encryptedBuffer Encrypted binary data
     * @returns StorageUploadResult containing CID, SHA-256 hash, and size
     */
    async uploadFile(encryptedBuffer) {
        return this.activeAdapter.uploadFile(encryptedBuffer);
    }
    /**
     * Retrieve encrypted document buffer by CID / key from configured off-chain storage engine.
     * @param cid Storage Content Identifier
     * @returns Raw encrypted Buffer
     */
    async retrieveFile(cid) {
        return this.activeAdapter.retrieveFile(cid);
    }
    // ─────────────────────────────────────────────────────────────
    // Backend integration aliases — match docs/CONTRACTS.md exactly
    // so evault-backend's storage.service.js can call these directly.
    // ─────────────────────────────────────────────────────────────
    /**
     * Backend-contract-compatible alias for uploadFile.
     * Matches docs/CONTRACTS.md: upload(encryptedBuffer, metadata) -> { cid }
     * @param encryptedBuffer Encrypted binary data
     * @param metadata Optional file metadata (filename, mimetype) — accepted for
     *   contract compatibility; not currently used by the underlying adapters.
     */
    async upload(encryptedBuffer, metadata) {
        const result = await this.uploadFile(encryptedBuffer);
        return { cid: result.cid };
    }
    /**
     * Backend-contract-compatible alias for retrieveFile.
     * Matches docs/CONTRACTS.md: download(cid) -> Buffer
     */
    async download(cid) {
        return this.retrieveFile(cid);
    }
}
exports.StorageService = StorageService;
/** Default singleton instance for quick import */
exports.storageService = new StorageService();
//# sourceMappingURL=storage.service.js.map