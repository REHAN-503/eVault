export declare function registerUser(id: string, role: string): Promise<{
    userId: string;
    role: string;
    txId: string;
}>;
export declare function grantAccess(docId: string, userId: string, permission: string): Promise<{
    docId: string;
    userId: string;
    permission: string;
    txId: string;
}>;
export declare function revokeAccess(docId: string, userId: string): Promise<{
    docId: string;
    userId: string;
    txId: string;
}>;
export declare function checkAccess(docId: string, userId: string): Promise<boolean>;
export declare function recordDocument(docId: string, hash: string, metadata: Record<string, unknown>, ownerId: string, ownerRole: string): Promise<{
    docId: string;
    hash: string;
    txId: string;
}>;
export declare function updateDocument(docId: string, newHash: string, metadata: Record<string, unknown>): Promise<{
    docId: string;
    hash: string;
    txId: string;
}>;
export declare function getDocument(docId: string): Promise<{
    hash: string;
    metadata: Record<string, unknown>;
}>;
export declare function getVersionHistory(docId: string): Promise<Array<{
    hash: string;
    metadata: Record<string, unknown>;
    timestamp: string;
}>>;
export declare function logAction(docId: string, userId: string, action: string): Promise<{
    docId: string;
    userId: string;
    action: string;
    txId: string;
}>;
export declare function getAuditTrail(docId: string): Promise<Array<{
    docId: string;
    userId: string;
    action: string;
    timestamp: string;
}>>;
export { closeConnection } from './connection';
