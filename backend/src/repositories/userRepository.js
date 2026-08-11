'use strict';

const prisma = require('../config/database');

/**
 * User repository — all User table operations.
 * This is the ONLY module that imports the Prisma client for User queries.
 */

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findByIdWithPassword(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function create({ email, passwordHash, role, fullName }) {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      fullName,
      status: 'PENDING',
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      createdAt: true,
    },
  });
}


async function updateStatus(id, status) {
  return prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function existsByEmail(email) {
  const count = await prisma.user.count({ where: { email } });
  return count > 0;
}

async function findAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  existsByEmail,
  findAll,
  updateStatus,
};
