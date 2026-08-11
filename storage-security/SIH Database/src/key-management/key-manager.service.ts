import { CONFIG } from '../config.js';
import { encryptFile, decryptFile, generateKey, EncryptedPayload } from '../crypto/aes256.js';
import { accessControlContractStub, AccessControlContractStub } from './access-stub.js';

export class AccessDeniedError extends Error {
  constructor(docId: string, userId: string) {
    super(`Access Denied: User '${userId}' is not authorized to retrieve key for Document '${docId}'`);
    this.name = 'AccessDeniedError';
  }
}

export interface WrappedKeyRecord {
  docId: string;
  ownerId: string;
  wrappedDek: EncryptedPayload;
  createdAt: Date;
}

/**
 * Key Management Module (Envelope Encryption & Access-Gated Release)
 */
export class KeyManagerService {
  private masterKek: string;
  private keyVault: Map<string, WrappedKeyRecord> = new Map();
  private accessStub: AccessControlContractStub;

  constructor(masterKekHex?: string, accessStub?: AccessControlContractStub) {
    this.masterKek = masterKekHex || CONFIG.MASTER_KEK_HEX;
    this.accessStub = accessStub || accessControlContractStub;
  }

  /**
   * Create a new 256-bit Document Encryption Key (DEK) for a specific document,
   * wrap it with the Master Key (KEK), store the wrapped record, and register ownership.
   * 
   * @param docId Unique Document Identifier
   * @param ownerId Owner User ID
   * @returns Raw DEK (hex string) to be used immediately for file encryption
   */
  async createDocumentKey(docId: string, ownerId: string): Promise<string> {
    if (this.keyVault.has(docId)) {
      throw new Error(`Key record already exists for Document ID: ${docId}`);
    }

    // 1. Generate unique per-document key (DEK)
    const dek = generateKey();

    // 2. Wrap (encrypt) DEK with Master KEK using AES-256-GCM
    const wrappedDek = await encryptFile(Buffer.from(dek, 'hex'), this.masterKek);

    // 3. Save wrapped record in key vault
    this.keyVault.set(docId, {
      docId,
      ownerId,
      wrappedDek,
      createdAt: new Date(),
    });

    // 4. Register document ownership in mock access contract
    this.accessStub.registerDocument(docId, ownerId);

    return dek;
  }

  /**
   * Retrieve and unwrap a Document Encryption Key (DEK) after access verification.
   * MUST call checkAccess(docId, userId) before releasing the key.
   * 
   * @param docId Document Identifier
   * @param userId Requesting User ID
   * @returns Unwrapped raw DEK (hex string)
   * @throws AccessDeniedError if user is not authorized
   */
  async retrieveDocumentKey(docId: string, userId: string): Promise<string> {
    const wrappedRecord = this.keyVault.get(docId);
    if (!wrappedRecord) {
      throw new Error(`No key record found for Document ID: ${docId}`);
    }

    // MANDATORY ACCESS CHECK STEP (gated by mock smart contract stub)
    const isAuthorized = await this.accessStub.checkAccess(docId, userId);
    if (!isAuthorized) {
      throw new AccessDeniedError(docId, userId);
    }

    // Unwrap DEK using Master KEK
    const unwrappedBuffer = await decryptFile(wrappedRecord.wrappedDek, this.masterKek);
    return unwrappedBuffer.toString('hex');
  }

  /**
   * Grant access authorization to another user (e.g. lawyer sharing doc with judge/client).
   */
  async grantAccess(docId: string, grantorId: string, granteeId: string): Promise<boolean> {
    return this.accessStub.grantAccess(docId, grantorId, granteeId);
  }

  /**
   * Revoke access authorization from a user.
   */
  async revokeAccess(docId: string, grantorId: string, granteeId: string): Promise<boolean> {
    return this.accessStub.revokeAccess(docId, grantorId, granteeId);
  }
}

/** Singleton instance of KeyManagerService */
export const keyManagerService = new KeyManagerService();
