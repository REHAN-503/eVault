"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRegistryContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const errors_1 = require("./errors");
const ledgerHelpers_1 = require("./ledgerHelpers");
const validation_1 = require("./validation");
let DocumentRegistryContract = class DocumentRegistryContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('DocumentRegistryContract');
    }
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
    async recordDocument(ctx, docId, hash, metadataJSON, ownerId, ownerRole) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertNonEmpty)(hash, 'hash');
        (0, validation_1.assertUuid)(ownerId, 'ownerId');
        (0, validation_1.assertRole)(ownerRole);
        const existing = await (0, ledgerHelpers_1.getDocumentRecord)(ctx, docId);
        if (existing) {
            throw (0, errors_1.conflict)(`Document already recorded: ${docId}`);
        }
        let metadata;
        try {
            metadata = JSON.parse(metadataJSON);
        }
        catch {
            throw (0, errors_1.badRequest)('metadata must be valid JSON');
        }
        await (0, ledgerHelpers_1.ensureUserRegistered)(ctx, ownerId, ownerRole);
        const record = {
            docId,
            hash,
            metadata: { ...metadata, version: metadata.version ?? 1 },
            ownerId,
        };
        await (0, ledgerHelpers_1.putDocumentRecord)(ctx, record);
        ctx.stub.setEvent('DocumentAdded', Buffer.from(JSON.stringify({ docId, hash, ownerId })));
        return JSON.stringify({ docId, hash, txId: ctx.stub.getTxID() });
    }
    async updateDocument(ctx, docId, newHash, metadataJSON) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertNonEmpty)(newHash, 'newHash');
        const existing = await (0, ledgerHelpers_1.getDocumentRecord)(ctx, docId);
        if (!existing) {
            throw (0, errors_1.notFound)(`Document not found: ${docId}`);
        }
        let metadata;
        try {
            metadata = JSON.parse(metadataJSON);
        }
        catch {
            throw (0, errors_1.badRequest)('metadata must be valid JSON');
        }
        const previousVersion = existing.metadata.version ?? 1;
        const record = {
            ...existing,
            hash: newHash,
            metadata: { ...metadata, version: metadata.version ?? previousVersion + 1 },
        };
        await (0, ledgerHelpers_1.putDocumentRecord)(ctx, record);
        return JSON.stringify({ docId, hash: newHash, txId: ctx.stub.getTxID() });
    }
    async getDocument(ctx, docId) {
        (0, validation_1.assertUuid)(docId, 'docId');
        const record = await (0, ledgerHelpers_1.getDocumentRecord)(ctx, docId);
        if (!record) {
            throw (0, errors_1.notFound)(`Document not found: ${docId}`);
        }
        return JSON.stringify({ hash: record.hash, metadata: record.metadata });
    }
    /**
     * Returns the full, real version history for a document by reading the
     * ledger's own transaction history for its key — NOT a manually
     * maintained array. Every putState() call against this key (from
     * recordDocument and each updateDocument) is a separate immutable ledger
     * entry, so this reflects the true on-chain history.
     */
    async getVersionHistory(ctx, docId) {
        (0, validation_1.assertUuid)(docId, 'docId');
        const key = (0, ledgerHelpers_1.documentKey)(ctx, docId);
        const history = [];
        for await (const entry of ctx.stub.getHistoryForKey(key)) {
            if (entry && entry.value && entry.value.length > 0) {
                const parsed = JSON.parse(Buffer.from(entry.value).toString('utf8'));
                const rawSeconds = entry.timestamp?.seconds;
                const seconds = rawSeconds
                    ? Number(rawSeconds.low ?? rawSeconds)
                    : 0;
                history.push({
                    hash: parsed.hash,
                    metadata: parsed.metadata,
                    timestamp: new Date(seconds * 1000).toISOString(),
                });
            }
        }
        if (history.length === 0) {
            throw (0, errors_1.notFound)(`Document not found: ${docId}`);
        }
        return JSON.stringify(history);
    }
};
exports.DocumentRegistryContract = DocumentRegistryContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentRegistryContract.prototype, "recordDocument", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentRegistryContract.prototype, "updateDocument", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], DocumentRegistryContract.prototype, "getDocument", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], DocumentRegistryContract.prototype, "getVersionHistory", null);
exports.DocumentRegistryContract = DocumentRegistryContract = __decorate([
    (0, fabric_contract_api_1.Info)({
        title: 'DocumentRegistryContract',
        description: 'Anchors document content hashes and version history on the ledger',
    }),
    __metadata("design:paramtypes", [])
], DocumentRegistryContract);
