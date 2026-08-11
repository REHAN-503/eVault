'use strict';

const prisma = require('../config/database');

/**
 * Document repository — all DocumentMetadata table operations.
 */

async function create(data) {
  return prisma.documentMetadata.create({ data });
}

async function findById(id) {
  return prisma.documentMetadata.findUnique({
    where: { id },
    include: { owner: { select: { id: true, email: true, fullName: true, role: true } } },
  });
}

async function findByDocId(docId) {
  return prisma.documentMetadata.findUnique({
    where: { docId },
    include: { owner: { select: { id: true, email: true, fullName: true, role: true } } },
  });
}

async function findByOwner(ownerId, { page, limit, search }) {
  const skip = (page - 1) * limit;
  const where = {
    ownerId,
    isDeleted: false,
    ...(search
      ? { filename: { contains: search, mode: 'insensitive' } }
      : {}),
  };

  const [documents, total] = await Promise.all([
    prisma.documentMetadata.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, email: true, fullName: true, role: true } } },
    }),
    prisma.documentMetadata.count({ where }),
  ]);

  return { documents, total };
}

async function findAll({ page, limit, search }) {
  const skip = (page - 1) * limit;
  const where = {
    isDeleted: false,
    ...(search
      ? { filename: { contains: search, mode: 'insensitive' } }
      : {}),
  };

  const [documents, total] = await Promise.all([
    prisma.documentMetadata.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, email: true, fullName: true, role: true } } },
    }),
    prisma.documentMetadata.count({ where }),
  ]);

  return { documents, total };
}

async function update(id, data) {
  return prisma.documentMetadata.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, email: true, fullName: true, role: true } } },
  });
}

async function softDelete(id) {
  return prisma.documentMetadata.update({
    where: { id },
    data: { isDeleted: true },
  });
}

module.exports = {
  create,
  findById,
  findByDocId,
  findByOwner,
  findAll,
  update,
  softDelete,
};
