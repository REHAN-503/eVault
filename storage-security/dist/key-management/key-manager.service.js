"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyManagerService = exports.KeyManagerService = exports.AccessDeniedError = void 0;
const config_js_1 = require("../config.js");
const aes256_js_1 = require("../crypto/aes256.js");
const access_stub_js_1 = require("./access-stub.js");
class AccessDeniedError extends Error {
    constructor(docId, userId) {
        super(`Access Denied: User '${userId}' is not authorized to retrieve key for Document '${docId}'`);
        this.name = 'AccessDeniedError';
    }
}
exports.AccessDeniedError = AccessDeniedError;
/**
 * Key Management Module (Envelope Encryption & Access-Gated Release)
 */
class KeyManagerService {
    masterKek;
    keyVault = new Map();
    accessStub;
    constructor(masterKekHex, accessStub) {
        this.masterKek = masterKekHex || config_js_1.CONFIG.MASTER_KEK_HEX;
        this.accessStub = accessStub || access_stub_js_1.accessControlContractStub;
    }
    /**
     * Create a new 256-bit Document Encryption Key (DEK) for a specific document,
     * wrap it with the Master Key (KEK), store the wrapped record, and register ownership.
     *
     * @param docId Unique Document Identifier
     * @param ownerId Owner User ID
     * @returns Raw DEK (hex string) to be used immediately for file encryption
     */
    async createDocumentKey(docId, ownerId) {
        if (this.keyVault.has(docId)) {
            throw new Error(`Key record already exists for Document ID: ${docId}`);
        }
        // 1. Generate unique per-document key (DEK)
        const dek = (0, aes256_js_1.generateKey)();
        // 2. Wrap (encrypt) DEK with Master KEK using AES-256-GCM
        const wrappedDek = await (0, aes256_js_1.encryptFile)(Buffer.from(dek, 'hex'), this.masterKek);
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
    async retrieveDocumentKey(docId, userId) {
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
        const unwrappedBuffer = await (0, aes256_js_1.decryptFile)(wrappedRecord.wrappedDek, this.masterKek);
        return unwrappedBuffer.toString('hex');
    }
    /**
     * Grant access authorization to another user (e.g. lawyer sharing doc with judge/client).
     */
    async grantAccess(docId, grantorId, granteeId) {
        return this.accessStub.grantAccess(docId, grantorId, granteeId);
    }
    /**
     * Revoke access authorization from a user.
     */
    async revokeAccess(docId, grantorId, granteeId) {
        return this.accessStub.revokeAccess(docId, grantorId, granteeId);
    }
}
exports.KeyManagerService = KeyManagerService;
/** Singleton instance of KeyManagerService */
exports.keyManagerService = new KeyManagerService();
//# sourceMappingURL=key-manager.service.js.map