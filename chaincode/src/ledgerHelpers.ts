import { Context } from 'fabric-contract-api';
import { AccessRecord, DocumentRecord, UserRecord } from './types';
import { Permission, Role } from './validation';

/**
 * Shared world-state read/write helpers, used by AccessControlContract,
 * DocumentRegistryContract, and AuditLogContract. All three contracts run
 * inside the same chaincode and share the same underlying ledger/world
 * state, so these helpers just centralize the composite-key conventions
 * rather than duplicating get/put logic in each contract class.
 */

const USER_KEY_TYPE = 'User';
const DOCUMENT_KEY_TYPE = 'Document';
const ACCESS_KEY_TYPE = 'Access';

// ---- Users ----

export async function getUserRecord(
  ctx: Context,
  userId: string
): Promise<UserRecord | undefined> {
  const key = ctx.stub.createCompositeKey(USER_KEY_TYPE, [userId]);
  const bytes = await ctx.stub.getState(key);
  if (!bytes || bytes.length === 0) return undefined;
  return JSON.parse(Buffer.from(bytes).toString('utf8')) as UserRecord;
}

export async function putUserRecord(
  ctx: Context,
  userId: string,
  role: Role
): Promise<void> {
  const key = ctx.stub.createCompositeKey(USER_KEY_TYPE, [userId]);
  const record: UserRecord = { userId, role };
  await ctx.stub.putState(key, Buffer.from(JSON.stringify(record)));
}

// ---- Documents ----

export function documentKey(ctx: Context, docId: string): string {
  return ctx.stub.createCompositeKey(DOCUMENT_KEY_TYPE, [docId]);
}

export async function getDocumentRecord(
  ctx: Context,
  docId: string
): Promise<DocumentRecord | undefined> {
  const bytes = await ctx.stub.getState(documentKey(ctx, docId));
  if (!bytes || bytes.length === 0) return undefined;
  return JSON.parse(Buffer.from(bytes).toString('utf8')) as DocumentRecord;
}

export async function putDocumentRecord(
  ctx: Context,
  record: DocumentRecord
): Promise<void> {
  await ctx.stub.putState(
    documentKey(ctx, record.docId),
    Buffer.from(JSON.stringify(record))
  );
}

// ---- Access grants ----

export function accessKey(ctx: Context, docId: string, userId: string): string {
  return ctx.stub.createCompositeKey(ACCESS_KEY_TYPE, [docId, userId]);
}

export async function getAccessRecord(
  ctx: Context,
  docId: string,
  userId: string
): Promise<AccessRecord | undefined> {
  const bytes = await ctx.stub.getState(accessKey(ctx, docId, userId));
  if (!bytes || bytes.length === 0) return undefined;
  return JSON.parse(Buffer.from(bytes).toString('utf8')) as AccessRecord;
}

export async function putAccessRecord(
  ctx: Context,
  docId: string,
  userId: string,
  permission: Permission
): Promise<void> {
  const record: AccessRecord = { docId, userId, permission };
  await ctx.stub.putState(
    accessKey(ctx, docId, userId),
    Buffer.from(JSON.stringify(record))
  );
}

export async function deleteAccessRecord(
  ctx: Context,
  docId: string,
  userId: string
): Promise<void> {
  await ctx.stub.deleteState(accessKey(ctx, docId, userId));
}

/**
 * Ensures a user is registered on-chain, auto-registering them if not.
 * Used internally by recordDocument() and grantAccess() only — per spec,
 * checkAccess() and revokeAccess() must NOT auto-register.
 */
export async function ensureUserRegistered(
  ctx: Context,
  userId: string,
  role: Role
): Promise<void> {
  const existing = await getUserRecord(ctx, userId);
  if (!existing) {
    await putUserRecord(ctx, userId, role);
  }
}
