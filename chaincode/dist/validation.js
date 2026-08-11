"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_PERMISSIONS = exports.VALID_ROLES = void 0;
exports.assertUuid = assertUuid;
exports.assertRole = assertRole;
exports.assertPermission = assertPermission;
exports.assertNonEmpty = assertNonEmpty;
const errors_1 = require("./errors");
// Matches evault-backend's Prisma role enum exactly (case-sensitive).
exports.VALID_ROLES = ['LAWYER', 'JUDGE', 'CLIENT', 'ADMIN'];
exports.VALID_PERMISSIONS = ['READ', 'WRITE'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function assertUuid(value, fieldName) {
    if (!value || !UUID_RE.test(value)) {
        throw (0, errors_1.badRequest)(`${fieldName} must be a valid UUID, got: ${value}`);
    }
}
function assertRole(value) {
    if (!exports.VALID_ROLES.includes(value)) {
        throw (0, errors_1.badRequest)(`role must be one of ${exports.VALID_ROLES.join(', ')}, got: ${value}`);
    }
}
function assertPermission(value) {
    if (!exports.VALID_PERMISSIONS.includes(value)) {
        throw (0, errors_1.badRequest)(`permission must be one of ${exports.VALID_PERMISSIONS.join(', ')}, got: ${value}`);
    }
}
function assertNonEmpty(value, fieldName) {
    if (!value || value.trim().length === 0) {
        throw (0, errors_1.badRequest)(`${fieldName} must not be empty`);
    }
}
