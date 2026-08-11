'use strict';

/**
 * Domain enum: Role
 *
 * Mirrors the Prisma `Role` enum so validators and services
 * can reference roles without importing the Prisma client.
 */
const Role = Object.freeze({
  LAWYER: 'LAWYER',
  JUDGE: 'JUDGE',
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
});

/** Array of all valid role values */
const ROLES = Object.values(Role);

module.exports = { Role, ROLES };
