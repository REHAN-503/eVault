import { Context, Contract } from 'fabric-contract-api';
export declare class DocumentRegistryContract extends Contract {
    constructor();
    /**
     * Records a new document.
     *
     * NOTE on ownerRole: chaincode cannot reach an external database (e.g. the
     * backend's Postgres users table), so unlike a typical mock implementation
     * that might look up the owner's role itself, this contract requires the
     * caller (the gateway wrapper) to pass ownerRole explicitly so it can
     * auto-register the owner if they aren't already known on-chain. This
     * mirrors ensureUserRegistered()'s spec, just resolved one layer up.
     */
    recordDocument(ctx: Context, docId: string, hash: string, metadataJSON: string, ownerId: string, ownerRole: string): Promise<string>;
    updateDocument(ctx: Context, docId: string, newHash: string, metadataJSON: string): Promise<string>;
    getDocument(ctx: Context, docId: string): Promise<string>;
    /**
     * Returns the full, real version history for a document by reading the
     * ledger's own transaction history for its key — NOT a manually
     * maintained array. Every putState() call against this key (from
     * recordDocument and each updateDocument) is a separate immutable ledger
     * entry, so this reflects the true on-chain history.
     */
    getVersionHistory(ctx: Context, docId: string): Promise<string>;
}
