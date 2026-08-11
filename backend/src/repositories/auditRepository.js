'use strict';

const prisma = require('../config/database');

/**
 * Audit repository — all AuditLog table operations.
 */

async function create({ docId, userId, action, metadata }) {
  return prisma.auditLog.create({
    data: {
      docId,
      userId,
      action,
      metadata: metadata || undefined,
    },
  });
}

async function findByDocId(docId) {
  return prisma.auditLog.findMany({
    where: { docId },
    orderBy: { timestamp: 'desc' },
    include: {
      user: { select: { id: true, email: true, fullName: true, role: true } },
    },
  });
}

async function findByUserId(userId) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    include: {
      document: { select: { id: true, docId: true, filename: true } },
    },
  });
}

module.exports = {
  create,
  findByDocId,
  findByUserId,
};
