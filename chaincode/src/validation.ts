import { badRequest } from './errors';

// Matches evault-backend's Prisma role enum exactly (case-sensitive).
export const VALID_ROLES = ['LAWYER', 'JUDGE', 'CLIENT', 'ADMIN'] as const;
export type Role = (typeof VALID_ROLES)[number];

export const VALID_PERMISSIONS = ['READ', 'WRITE'] as const;
export type Permission = (typeof VALID_PERMISSIONS)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, fieldName: string): void {
  if (!value || !UUID_RE.test(value)) {
    throw badRequest(`${fieldName} must be a valid UUID, got: ${value}`);
  }
}

export function assertRole(value: string): asserts value is Role {
  if (!VALID_ROLES.includes(value as Role)) {
    throw badRequest(
      `role must be one of ${VALID_ROLES.join(', ')}, got: ${value}`
    );
  }
}

export function assertPermission(value: string): asserts value is Permission {
  if (!VALID_PERMISSIONS.includes(value as Permission)) {
    throw badRequest(
      `permission must be one of ${VALID_PERMISSIONS.join(', ')}, got: ${value}`
    );
  }
}

export function assertNonEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw badRequest(`${fieldName} must not be empty`);
  }
}
