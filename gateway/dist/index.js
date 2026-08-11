"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = void 0;
exports.registerUser = registerUser;
exports.grantAccess = grantAccess;
exports.revokeAccess = revokeAccess;
exports.checkAccess = checkAccess;
exports.recordDocument = recordDocument;
exports.updateDocument = updateDocument;
exports.getDocument = getDocument;
exports.getVersionHistory = getVersionHistory;
exports.logAction = logAction;
exports.getAuditTrail = getAuditTrail;
const connection_1 = require("./connection");
const errors_1 = require("./errors");
/**
 * Drop-in replacement for evault-backend's mock blockchain.service.js.
 * Same 8 function names, same parameter order, same return shapes —
 * see docs/CONTRACTS.md / docs/TEAM_API_CONTRACT.md in evault-backend.
 *
 * Internally, each function submits/evaluates a transaction against the
 * real Hyperledger Fabric network (via @hyperledger/fabric-gateway),
 * targeting one of the three deployed contracts: AccessControlContract,
 * DocumentRegistryContract, AuditLogContract — all part of the single
 * 'evaultcc' chaincode on the 'evaultchannel' channel.
 */
function decode(bytes) {
    return Buffer.from(bytes).toString('utf8');
}
async function submit(contractName, fn, ...args) {
    try {
        const contract = await (0, connection_1.getContract)(contractName);
        const result = await contract.submitTransaction(fn, ...args);
        return decode(result);
    }
    catch (err) {
        throw (0, errors_1.translateChaincodeError)(err);
    }
}
async function evaluate(contractName, fn, ...args) {
    try {
        const contract = await (0, connection_1.getContract)(contractName);
        const result = await contract.evaluateTransaction(fn, ...args);
        return decode(result);
    }
    catch (err) {
        throw (0, errors_1.translateChaincodeError)(err);
    }
}
// ---- AccessControlContract ----
async function registerUser(id, role) {
    const raw = await submit('AccessControlContract', 'registerUser', id, role);
    return JSON.parse(raw);
}
async function grantAccess(docId, userId, permission) {
    const raw = await submit('AccessControlContract', 'grantAccess', docId, userId, permission);
    return JSON.parse(raw);
}
async function revokeAccess(docId, userId) {
    const raw = await submit('AccessControlContract', 'revokeAccess', docId, userId);
    return JSON.parse(raw);
}
async function checkAccess(docId, userId) {
    const raw = await evaluate('AccessControlContract', 'checkAccess', docId, userId);
    return raw === 'true';
}
// ---- DocumentRegistryContract ----
async function recordDocument(docId, hash, metadata, ownerId, ownerRole) {
    const raw = await submit('DocumentRegistryContract', 'recordDocument', docId, hash, JSON.stringify(metadata), ownerId, ownerRole);
    return JSON.parse(raw);
}
async function updateDocument(docId, newHash, metadata) {
    const raw = await submit('DocumentRegistryContract', 'updateDocument', docId, newHash, JSON.stringify(metadata));
    return JSON.parse(raw);
}
async function getDocument(docId) {
    const raw = await evaluate('DocumentRegistryContract', 'getDocument', docId);
    return JSON.parse(raw);
}
async function getVersionHistory(docId) {
    const raw = await evaluate('DocumentRegistryContract', 'getVersionHistory', docId);
    return JSON.parse(raw);
}
// ---- AuditLogContract (bonus, not in the original 8 but useful) ----
async function logAction(docId, userId, action) {
    const raw = await submit('AuditLogContract', 'logAction', docId, userId, action);
    return JSON.parse(raw);
}
async function getAuditTrail(docId) {
    const raw = await evaluate('AuditLogContract', 'getAuditTrail', docId);
    return JSON.parse(raw);
}
var connection_2 = require("./connection");
Object.defineProperty(exports, "closeConnection", { enumerable: true, get: function () { return connection_2.closeConnection; } });
