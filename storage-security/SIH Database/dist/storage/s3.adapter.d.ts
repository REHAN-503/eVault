import { IStorageService, StorageUploadResult } from './storage.interface.js';
/**
 * AWS S3 Encrypted Off-Chain Storage Adapter.
 * Supports S3 bucket storage with AES256 server-side / client-side encryption.
 */
export declare class S3StorageAdapter implements IStorageService {
    private bucketName;
    private region;
    private inMemoryMockStore;
    constructor(bucketName?: string, region?: string);
    private generateS3Key;
    uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult>;
    retrieveFile(cid: string): Promise<Buffer>;
}
//# sourceMappingURL=s3.adapter.d.ts.map