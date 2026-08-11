/**
 * Mock Smart Contract Access Control Stub.
 * Simulates Hyperledger Fabric AccessControlContract.checkAccess(docId, userId).
 */
export class AccessControlContractStub {
  // In-memory mock access permissions mapping: docId -> Set<userId>
  private permissions: Map<string, Set<string>> = new Map();
  // Document owner mapping: docId -> ownerUserId
  private documentOwners: Map<string, string> = new Map();

  /**
   * Set document ownership during initial creation.
   */
  public registerDocument(docId: string, ownerId: string): void {
    this.documentOwners.set(docId, ownerId);
    if (!this.permissions.has(docId)) {
      this.permissions.set(docId, new Set());
    }
    this.permissions.get(docId)!.add(ownerId);
  }

  /**
   * Grant access permission for a document to a user.
   */
  public grantAccess(docId: string, grantorId: string, granteeId: string): boolean {
    const owner = this.documentOwners.get(docId);
    const docPerms = this.permissions.get(docId);

    // Only document owner or currently authorized users can grant access
    if (owner !== grantorId && (!docPerms || !docPerms.has(grantorId))) {
      return false;
    }

    if (!docPerms) {
      const newSet = new Set<string>([granteeId]);
      this.permissions.set(docId, newSet);
    } else {
      docPerms.add(granteeId);
    }

    return true;
  }

  /**
   * Revoke access permission for a document from a user.
   */
  public revokeAccess(docId: string, grantorId: string, granteeId: string): boolean {
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
  public async checkAccess(docId: string, userId: string): Promise<boolean> {
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

/** Singleton instance for mock smart contract access stub */
export const accessControlContractStub = new AccessControlContractStub();
