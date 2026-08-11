"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.AuditLogContract = exports.DocumentRegistryContract = exports.AccessControlContract = void 0;
const accessControl_contract_1 = require("./accessControl.contract");
Object.defineProperty(exports, "AccessControlContract", { enumerable: true, get: function () { return accessControl_contract_1.AccessControlContract; } });
const documentRegistry_contract_1 = require("./documentRegistry.contract");
Object.defineProperty(exports, "DocumentRegistryContract", { enumerable: true, get: function () { return documentRegistry_contract_1.DocumentRegistryContract; } });
const auditLog_contract_1 = require("./auditLog.contract");
Object.defineProperty(exports, "AuditLogContract", { enumerable: true, get: function () { return auditLog_contract_1.AuditLogContract; } });
exports.contracts = [
    accessControl_contract_1.AccessControlContract,
    documentRegistry_contract_1.DocumentRegistryContract,
    auditLog_contract_1.AuditLogContract,
];
