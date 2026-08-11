/**
 * Mock Smart Contract Access Control Stub.
 * Simulates Hyperledger Fabric AccessControlContract.checkAccess(docId, userId).
 */
export declare class AccessControlContractStub {
    private permissions;
    private documentOwners;
    /**
     * Set document ownership during initial creation.
     */
    registerDocument(docId: string, ownerId: string): void;
    /**
     * Grant access permission for a document to a user.
     */
    grantAccess(docId: string, grantorId: string, granteeId: string): boolean;
    /**
     * Revoke access permission for a document from a user.
     */
    revokeAccess(docId: string, grantorId: string, granteeId: string): boolean;
    /**
     * Mock implementation of AccessControlContract.checkAccess(docId, userId)
     * Evaluates on-chain / mock permission rules.
     *
     * @param docId Document ID
     * @param userId User requesting decryption key
     * @returns true if user has authorization, false otherwise
     */
    checkAccess(docId: string, userId: string): Promise<boolean>;
}
/** Singleton instance for mock smart contract access stub */
export declare const accessControlContractStub: AccessControlContractStub;
//# sourceMappingURL=access-stub.d.ts.map