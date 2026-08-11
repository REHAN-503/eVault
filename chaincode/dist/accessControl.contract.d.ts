import { Context, Contract } from 'fabric-contract-api';
export declare class AccessControlContract extends Contract {
    constructor();
    registerUser(ctx: Context, id: string, role: string): Promise<string>;
    grantAccess(ctx: Context, docId: string, userId: string, permission: string): Promise<string>;
    revokeAccess(ctx: Context, docId: string, userId: string): Promise<string>;
    checkAccess(ctx: Context, docId: string, userId: string): Promise<boolean>;
}
