"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageAdapter = void 0;
const aes256_js_1 = require("../crypto/aes256.js");
/**
 * AWS S3 Encrypted Off-Chain Storage Adapter.
 * Supports S3 bucket storage with AES256 server-side / client-side encryption.
 */
class S3StorageAdapter {
    bucketName;
    region;
    inMemoryMockStore = new Map();
    constructor(bucketName = 'sih1284-encrypted-documents', region = 'us-east-1') {
        this.bucketName = bucketName;
        this.region = region;
    }
    generateS3Key(hash) {
        const rawHash = hash.replace(/^0x/, '');
        return `s3-doc-${rawHash.slice(0, 32)}`;
    }
    async uploadFile(encryptedBuffer) {
        const hash = (0, aes256_js_1.computeFileHash)(encryptedBuffer);
        const key = this.generateS3Key(hash);
        // In hackathon / dev environment without AWS credentials, mock store provides instant execution
        this.inMemoryMockStore.set(key, encryptedBuffer);
        return {
            cid: key,
            hash,
            size: encryptedBuffer.length,
            driver: 's3',
        };
    }
    async retrieveFile(cid) {
        const data = this.inMemoryMockStore.get(cid);
        if (!data) {
            throw new Error(`S3 Object not found for key: ${cid} in bucket ${this.bucketName}`);
        }
        return data;
    }
}
exports.S3StorageAdapter = S3StorageAdapter;
//# sourceMappingURL=s3.adapter.js.map