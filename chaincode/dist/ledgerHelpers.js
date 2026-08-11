"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRecord = getUserRecord;
exports.putUserRecord = putUserRecord;
exports.documentKey = documentKey;
exports.getDocumentRecord = getDocumentRecord;
exports.putDocumentRecord = putDocumentRecord;
exports.accessKey = accessKey;
exports.getAccessRecord = getAccessRecord;
exports.putAccessRecord = putAccessRecord;
exports.deleteAccessRecord = deleteAccessRecord;
exports.ensureUserRegistered = ensureUserRegistered;
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
async function getUserRecord(ctx, userId) {
    const key = ctx.stub.createCompositeKey(USER_KEY_TYPE, [userId]);
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0)
        return undefined;
    return JSON.parse(Buffer.from(bytes).toString('utf8'));
}
async function putUserRecord(ctx, userId, role) {
    const key = ctx.stub.createCompositeKey(USER_KEY_TYPE, [userId]);
    const record = { userId, role };
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(record)));
}
// ---- Documents ----
function documentKey(ctx, docId) {
    return ctx.stub.createCompositeKey(DOCUMENT_KEY_TYPE, [docId]);
}
async function getDocumentRecord(ctx, docId) {
    const bytes = await ctx.stub.getState(documentKey(ctx, docId));
    if (!bytes || bytes.length === 0)
        return undefined;
    return JSON.parse(Buffer.from(bytes).toString('utf8'));
}
async function putDocumentRecord(ctx, record) {
    await ctx.stub.putState(documentKey(ctx, record.docId), Buffer.from(JSON.stringify(record)));
}
// ---- Access grants ----
function accessKey(ctx, docId, userId) {
    return ctx.stub.createCompositeKey(ACCESS_KEY_TYPE, [docId, userId]);
}
async function getAccessRecord(ctx, docId, userId) {
    const bytes = await ctx.stub.getState(accessKey(ctx, docId, userId));
    if (!bytes || bytes.length === 0)
        return undefined;
    return JSON.parse(Buffer.from(bytes).toString('utf8'));
}
async function putAccessRecord(ctx, docId, userId, permission) {
    const record = { docId, userId, permission };
    await ctx.stub.putState(accessKey(ctx, docId, userId), Buffer.from(JSON.stringify(record)));
}
async function deleteAccessRecord(ctx, docId, userId) {
    await ctx.stub.deleteState(accessKey(ctx, docId, userId));
}
/**
 * Ensures a user is registered on-chain, auto-registering them if not.
 * Used internally by recordDocument() and grantAccess() only — per spec,
 * checkAccess() and revokeAccess() must NOT auto-register.
 */
async function ensureUserRegistered(ctx, userId, role) {
    const existing = await getUserRecord(ctx, userId);
    if (!existing) {
        await putUserRecord(ctx, userId, role);
    }
}
