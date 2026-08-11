"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsStorageAdapter = void 0;
const aes256_js_1 = require("../crypto/aes256.js");
/**
 * IPFS Storage Adapter utilizing standard IPFS Kubo HTTP RPC API endpoints (/api/v0/add, /api/v0/cat).
 */
class IpfsStorageAdapter {
    apiUrl;
    constructor(apiUrl = 'http://127.0.0.1:5001') {
        this.apiUrl = apiUrl.replace(/\/$/, '');
    }
    async uploadFile(encryptedBuffer) {
        const hash = (0, aes256_js_1.computeFileHash)(encryptedBuffer);
        try {
            const formData = new FormData();
            const blob = new Blob([Uint8Array.from(encryptedBuffer)]);
            formData.append('file', blob);
            const response = await fetch(`${this.apiUrl}/api/v0/add?pin=true`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
            }
            const data = (await response.json());
            return {
                cid: data.Hash,
                hash,
                size: encryptedBuffer.length,
                driver: 'ipfs',
            };
        }
        catch (err) {
            throw new Error(`IPFS Node Error: ${err.message}. Ensure IPFS daemon is running at ${this.apiUrl}`);
        }
    }
    async retrieveFile(cid) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`IPFS cat failed: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
        catch (err) {
            throw new Error(`IPFS Retrieval Error for CID ${cid}: ${err.message}`);
        }
    }
}
exports.IpfsStorageAdapter = IpfsStorageAdapter;
//# sourceMappingURL=ipfs.adapter.js.map