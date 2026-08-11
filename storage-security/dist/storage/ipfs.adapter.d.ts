import { IStorageService, StorageUploadResult } from './storage.interface.js';
/**
 * IPFS Storage Adapter utilizing standard IPFS Kubo HTTP RPC API endpoints (/api/v0/add, /api/v0/cat).
 */
export declare class IpfsStorageAdapter implements IStorageService {
    private apiUrl;
    constructor(apiUrl?: string);
    uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult>;
    retrieveFile(cid: string): Promise<Buffer>;
}
//# sourceMappingURL=ipfs.adapter.d.ts.map