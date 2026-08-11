import { EncryptedPayload } from '../crypto/aes256.js';
import { AccessControlContractStub } from './access-stub.js';
export declare class AccessDeniedError extends Error {
    constructor(docId: string, userId: string);
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
export declare class KeyManagerService {
    private masterKek;
    private keyVault;
    private accessStub;
    constructor(masterKekHex?: string, accessStub?: AccessControlContractStub);
    /**
     * Create a new 256-bit Document Encryption Key (DEK) for a specific document,
     * wrap it with the Master Key (KEK), store the wrapped record, and register ownership.
     *
     * @param docId Unique Document Identifier
     * @param ownerId Owner User ID
     * @returns Raw DEK (hex string) to be used immediately for file encryption
     */
    createDocumentKey(docId: string, ownerId: string): Promise<string>;
    /**
     * Retrieve and unwrap a Document Encryption Key (DEK) after access verification.
     * MUST call checkAccess(docId, userId) before releasing the key.
     *
     * @param docId Document Identifier
     * @param userId Requesting User ID
     * @returns Unwrapped raw DEK (hex string)
     * @throws AccessDeniedError if user is not authorized
     */
    retrieveDocumentKey(docId: string, userId: string): Promise<string>;
    /**
     * Grant access authorization to another user (e.g. lawyer sharing doc with judge/client).
     */
    grantAccess(docId: string, grantorId: string, granteeId: string): Promise<boolean>;
    /**
     * Revoke access authorization from a user.
     */
    revokeAccess(docId: string, grantorId: string, granteeId: string): Promise<boolean>;
}
/** Singleton instance of KeyManagerService */
export declare const keyManagerService: KeyManagerService;
//# sourceMappingURL=key-manager.service.d.ts.map