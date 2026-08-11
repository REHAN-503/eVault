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
exports.AuditLogContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const validation_1 = require("./validation");
let AuditLogContract = class AuditLogContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('AuditLogContract');
    }
    auditKey(ctx, docId, txId) {
        return ctx.stub.createCompositeKey('Audit', [docId, txId]);
    }
    async logAction(ctx, docId, userId, action) {
        (0, validation_1.assertUuid)(docId, 'docId');
        (0, validation_1.assertUuid)(userId, 'userId');
        (0, validation_1.assertNonEmpty)(action, 'action');
        const txId = ctx.stub.getTxID();
        const txTimestamp = ctx.stub.getTxTimestamp();
        const seconds = txTimestamp?.seconds
            ? Number(txTimestamp.seconds.low ?? txTimestamp.seconds)
            : Math.floor(Date.now() / 1000);
        const entry = {
            docId,
            userId,
            action,
            timestamp: new Date(seconds * 1000).toISOString(),
        };
        await ctx.stub.putState(this.auditKey(ctx, docId, txId), Buffer.from(JSON.stringify(entry)));
        return JSON.stringify({ docId, userId, action, txId });
    }
    /**
     * Returns the full audit trail for a document, ordered oldest-first.
     */
    async getAuditTrail(ctx, docId) {
        (0, validation_1.assertUuid)(docId, 'docId');
        const entries = [];
        for await (const kv of ctx.stub.getStateByPartialCompositeKey('Audit', [docId])) {
            if (kv && kv.value && kv.value.length > 0) {
                entries.push(JSON.parse(Buffer.from(kv.value).toString('utf8')));
            }
        }
        entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        return JSON.stringify(entries);
    }
};
exports.AuditLogContract = AuditLogContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditLogContract.prototype, "logAction", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], AuditLogContract.prototype, "getAuditTrail", null);
exports.AuditLogContract = AuditLogContract = __decorate([
    (0, fabric_contract_api_1.Info)({
        title: 'AuditLogContract',
        description: 'Records a tamper-evident audit trail of actions on documents',
    }),
    __metadata("design:paramtypes", [])
], AuditLogContract);
