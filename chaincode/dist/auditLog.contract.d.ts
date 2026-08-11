import { Context, Contract } from 'fabric-contract-api';
export declare class AuditLogContract extends Contract {
    constructor();
    private auditKey;
    logAction(ctx: Context, docId: string, userId: string, action: string): Promise<string>;
    /**
     * Returns the full audit trail for a document, ordered oldest-first.
     */
    getAuditTrail(ctx: Context, docId: string): Promise<string>;
}
