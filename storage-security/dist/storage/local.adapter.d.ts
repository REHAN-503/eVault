import { IStorageService, StorageUploadResult } from './storage.interface.js';
/**
 * Encrypted Local Directory Vault Storage Adapter (Fallback for IPFS / S3).
 * Simulates off-chain storage by generating deterministic IPFS-like Content Identifiers (CIDs).
 */
export declare class LocalStorageAdapter implements IStorageService {
    private vaultDir;
    constructor(vaultDir?: string);
    private ensureVault;
    /**
     * Generates a mock IPFS CID v0 (Qm...) string based on buffer SHA-256 checksum.
     */
    private generateMockCid;
    uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult>;
    retrieveFile(cid: string): Promise<Buffer>;
}
//# sourceMappingURL=local.adapter.d.ts.map