import { Context } from 'fabric-contract-api';
import { AccessRecord, DocumentRecord, UserRecord } from './types';
import { Permission, Role } from './validation';
export declare function getUserRecord(ctx: Context, userId: string): Promise<UserRecord | undefined>;
export declare function putUserRecord(ctx: Context, userId: string, role: Role): Promise<void>;
export declare function documentKey(ctx: Context, docId: string): string;
export declare function getDocumentRecord(ctx: Context, docId: string): Promise<DocumentRecord | undefined>;
export declare function putDocumentRecord(ctx: Context, record: DocumentRecord): Promise<void>;
export declare function accessKey(ctx: Context, docId: string, userId: string): string;
export declare function getAccessRecord(ctx: Context, docId: string, userId: string): Promise<AccessRecord | undefined>;
export declare function putAccessRecord(ctx: Context, docId: string, userId: string, permission: Permission): Promise<void>;
export declare function deleteAccessRecord(ctx: Context, docId: string, userId: string): Promise<void>;
/**
 * Ensures a user is registered on-chain, auto-registering them if not.
 * Used internally by recordDocument() and grantAccess() only — per spec,
 * checkAccess() and revokeAccess() must NOT auto-register.
 */
export declare function ensureUserRegistered(ctx: Context, userId: string, role: Role): Promise<void>;
