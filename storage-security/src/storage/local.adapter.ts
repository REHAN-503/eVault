import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { computeFileHash } from '../crypto/aes256.js';
import { IStorageService, StorageUploadResult } from './storage.interface.js';

/**
 * Encrypted Local Directory Vault Storage Adapter (Fallback for IPFS / S3).
 * Simulates off-chain storage by generating deterministic IPFS-like Content Identifiers (CIDs).
 */
export class LocalStorageAdapter implements IStorageService {
  private vaultDir: string;

  constructor(vaultDir: string = './storage_vault') {
    this.vaultDir = path.resolve(vaultDir);
  }

  private async ensureVault(): Promise<void> {
    await fs.mkdir(this.vaultDir, { recursive: true });
  }

  /**
   * Generates a mock IPFS CID v0 (Qm...) string based on buffer SHA-256 checksum.
   */
  private generateMockCid(hash: string): string {
    const rawHash = hash.replace(/^0x/, '');
    const b58 = crypto.createHash('sha256').update(rawHash).digest('hex').slice(0, 44);
    return `Qm${b58}`;
  }

  async uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult> {
    await this.ensureVault();
    const hash = computeFileHash(encryptedBuffer);
    const cid = this.generateMockCid(hash);
    const filePath = path.join(this.vaultDir, `${cid}.enc`);

    await fs.writeFile(filePath, encryptedBuffer);

    return {
      cid,
      hash,
      size: encryptedBuffer.length,
      driver: 'local',
    };
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    await this.ensureVault();
    const filePath = path.join(this.vaultDir, `${cid}.enc`);

    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        throw new Error(`File not found in storage vault for CID: ${cid}`);
      }
      throw err;
    }
  }
}
