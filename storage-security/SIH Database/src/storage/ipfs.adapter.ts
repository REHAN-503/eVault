import { computeFileHash } from '../crypto/aes256.js';
import { IStorageService, StorageUploadResult } from './storage.interface.js';

/**
 * IPFS Storage Adapter utilizing standard IPFS Kubo HTTP RPC API endpoints (/api/v0/add, /api/v0/cat).
 */
export class IpfsStorageAdapter implements IStorageService {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://127.0.0.1:5001') {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  async uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult> {
    const hash = computeFileHash(encryptedBuffer);

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

      const data = (await response.json()) as { Hash: string; Size: string };

      return {
        cid: data.Hash,
        hash,
        size: encryptedBuffer.length,
        driver: 'ipfs',
      };
    } catch (err: any) {
      throw new Error(`IPFS Node Error: ${err.message}. Ensure IPFS daemon is running at ${this.apiUrl}`);
    }
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`IPFS cat failed: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: any) {
      throw new Error(`IPFS Retrieval Error for CID ${cid}: ${err.message}`);
    }
  }
}
