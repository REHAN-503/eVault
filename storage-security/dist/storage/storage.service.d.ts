import { IStorageService, StorageUploadResult } from './storage.interface.js';
/**
 * Unified Storage Service Provider.
 * Automatically delegates uploadFile and retrieveFile requests to the configured storage driver
 * (IPFS, AWS S3, or Local Vault Fallback).
 */
export declare class StorageService implements IStorageService {
    private activeAdapter;
    constructor(driver?: 'ipfs' | 's3' | 'local');
    /**
     * Upload encrypted file buffer to configured off-chain storage engine.
     * @param encryptedBuffer Encrypted binary data
     * @returns StorageUploadResult containing CID, SHA-256 hash, and size
     */
    uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult>;
    /**
     * Retrieve encrypted document buffer by CID / key from configured off-chain storage engine.
     * @param cid Storage Content Identifier
     * @returns Raw encrypted Buffer
     */
    retrieveFile(cid: string): Promise<Buffer>;
    /**
     * Backend-contract-compatible alias for uploadFile.
     * Matches docs/CONTRACTS.md: upload(encryptedBuffer, metadata) -> { cid }
     * @param encryptedBuffer Encrypted binary data
     * @param metadata Optional file metadata (filename, mimetype) — accepted for
     *   contract compatibility; not currently used by the underlying adapters.
     */
    upload(encryptedBuffer: Buffer, metadata?: {
        filename?: string;
        mimetype?: string;
    }): Promise<{
        cid: string;
    }>;
    /**
     * Backend-contract-compatible alias for retrieveFile.
     * Matches docs/CONTRACTS.md: download(cid) -> Buffer
     */
    download(cid: string): Promise<Buffer>;
}
/** Default singleton instance for quick import */
export declare const storageService: StorageService;
//# sourceMappingURL=storage.service.d.ts.map