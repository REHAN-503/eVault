export declare const VALID_ROLES: readonly ['LAWYER', 'JUDGE', 'CLIENT', 'ADMIN'];
export type Role = (typeof VALID_ROLES)[number];
export declare const VALID_PERMISSIONS: readonly ['READ', 'WRITE'];
export type Permission = (typeof VALID_PERMISSIONS)[number];
export declare function assertUuid(value: string, fieldName: string): void;
export declare function assertRole(value: string): asserts value is Role;
export declare function assertPermission(value: string): asserts value is Permission;
export declare function assertNonEmpty(value: string, fieldName: string): void;
