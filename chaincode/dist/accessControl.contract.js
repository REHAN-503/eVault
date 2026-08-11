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
exports.AccessControlContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const errors_1 = require("./errors");
const ledgerHelpers_1 = require("./ledgerHelpers");
const validation_1 = require("./validation");
let AccessControlContract = class AccessControlContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('AccessControlContract');
    }
    async registerUser(ctx, id, role) {
        (0, validation_1.assertUuid)(id, 'id');
        (0, validation_1.assertRole)(role);
        const existing = await (0, ledgerHelpers_1.getUserRecord)(ctx, id);
        if (existing) {
            throw (0, errors_1.conflict)(`User already registered: ${id}`);
        }
        await (0, ledgerHelpers_1.putUserRecord)(ctx, id, role);
        return JSON.stringify({
            userId: id,
            role,
            txId: ctx.stub.getTxID(),
        });
    }
    async grantAccess(ctx, docId, userId, permission) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertUuid)(userId, 'userId');
        (0, validation_1.assertPermission)(permission);
        const doc = await (0, ledgerHelpers_1.getDocumentRecord)(ctx, docId);
        if (!doc) {
            throw (0, errors_1.notFound)(`Document not found: ${docId}`);
        }
        const existing = await (0, ledgerHelpers_1.getAccessRecord)(ctx, docId, userId);
        if (existing && existing.permission === permission) {
            throw (0, errors_1.conflict)(`User ${userId} already has ${permission} access to document ${docId}`);
        }
        await (0, ledgerHelpers_1.putAccessRecord)(ctx, docId, userId, permission);
        ctx.stub.setEvent('AccessGranted', Buffer.from(JSON.stringify({ docId, userId, permission })));
        return JSON.stringify({
            docId,
            userId,
            permission,
            txId: ctx.stub.getTxID(),
        });
    }
    async revokeAccess(ctx, docId, userId) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertUuid)(userId, 'userId');
        const existing = await (0, ledgerHelpers_1.getAccessRecord)(ctx, docId, userId);
        if (!existing) {
            throw (0, errors_1.notFound)(`No existing access grant for user ${userId} on document ${docId}`);
        }
        await (0, ledgerHelpers_1.deleteAccessRecord)(ctx, docId, userId);
        ctx.stub.setEvent('AccessRevoked', Buffer.from(JSON.stringify({ docId, userId })));
        return JSON.stringify({ docId, userId, txId: ctx.stub.getTxID() });
    }
    async checkAccess(ctx, docId, userId) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertUuid)(userId, 'userId');
        const doc = await (0, ledgerHelpers_1.getDocumentRecord)(ctx, docId);
        if (doc && doc.ownerId === userId) {
            // Owners implicitly have access to their own documents.
            return true;
        }
        const access = await (0, ledgerHelpers_1.getAccessRecord)(ctx, docId, userId);
        return !!access;
    }
};
exports.AccessControlContract = AccessControlContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], AccessControlContract.prototype, "registerUser", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], AccessControlContract.prototype, "grantAccess", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], AccessControlContract.prototype, "revokeAccess", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], AccessControlContract.prototype, "checkAccess", null);
exports.AccessControlContract = AccessControlContract = __decorate([
    (0, fabric_contract_api_1.Info)({
        title: 'AccessControlContract',
        description: 'Manages user registration and per-document access permissions',
    }),
    __metadata("design:paramtypes", [])
], AccessControlContract);
