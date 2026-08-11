'use strict';

const prisma = require('../config/database');

/**
 * Session repository — all Session table operations.
 * Handles refresh token tracking for JWT rotation.
 */

async function create({ userId, refreshTokenHash, expiresAt }) {
  return prisma.session.create({
    data: { userId, refreshTokenHash, expiresAt },
  });
}

async function findByTokenHash(refreshTokenHash) {
  return prisma.session.findFirst({
    where: {
      refreshTokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

async function revokeByTokenHash(refreshTokenHash) {
  return prisma.session.updateMany({
    where: { refreshTokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function revokeAllForUser(userId) {
  return prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function deleteExpired() {
  return prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

module.exports = {
  create,
  findByTokenHash,
  revokeByTokenHash,
  revokeAllForUser,
  deleteExpired,
};
