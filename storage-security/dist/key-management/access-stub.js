"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessControlContractStub = exports.AccessControlContractStub = void 0;
/**
 * Mock Smart Contract Access Control Stub.
 * Simulates Hyperledger Fabric AccessControlContract.checkAccess(docId, userId).
 */
class AccessControlContractStub {
    // In-memory mock access permissions mapping: docId -> Set<userId>
    permissions = new Map();
    // Document owner mapping: docId -> ownerUserId
    documentOwners = new Map();
    /**
     * Set document ownership during initial creation.
     */
    registerDocument(docId, ownerId) {
        this.documentOwners.set(docId, ownerId);
        if (!this.permissions.has(docId)) {
            this.permissions.set(docId, new Set());
        }
        this.permissions.get(docId).add(ownerId);
    }
    /**
     * Grant access permission for a document to a user.
     */
    grantAccess(docId, grantorId, granteeId) {
        const owner = this.documentOwners.get(docId);
        const docPerms = this.permissions.get(docId);
        // Only document owner or currently authorized users can grant access
        if (owner !== grantorId && (!docPerms || !docPerms.has(grantorId))) {
            return false;
        }
        if (!docPerms) {
            const newSet = new Set([granteeId]);
            this.permissions.set(docId, newSet);
        }
        else {
            docPerms.add(granteeId);
        }
        return true;
    }
    /**
     * Revoke access permission for a document from a user.
     */
    revokeAccess(docId, grantorId, granteeId) {
        const owner = this.documentOwners.get(docId);
        if (owner !== grantorId) {
            return false; // Only owner can revoke
        }
        const docPerms = this.permissions.get(docId);
        if (docPerms) {
            docPerms.delete(granteeId);
        }
        return true;
    }
    /**
     * Mock implementation of AccessControlContract.checkAccess(docId, userId)
     * Evaluates on-chain / mock permission rules.
     *
     * @param docId Document ID
     * @param userId User requesting decryption key
     * @returns true if user has authorization, false otherwise
     */
    async checkAccess(docId, userId) {
        // Admin override for testing/auditing if needed
        if (userId === 'admin' || userId === 'system-court-vault') {
            return true;
        }
        const docPerms = this.permissions.get(docId);
        if (!docPerms) {
            return false;
        }
        return docPerms.has(userId);
    }
}
exports.AccessControlContractStub = AccessControlContractStub;
/** Singleton instance for mock smart contract access stub */
exports.accessControlContractStub = new AccessControlContractStub();
//# sourceMappingURL=access-stub.js.map