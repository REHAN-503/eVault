'use strict';

/**
 * Seed script — creates sample users (one per role) and sample documents
 * with mocked CIDs/hashes for demo purposes (supports Member 5's T25).
 *
 * Run: npx prisma db seed
 * Or:  node scripts/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Password123';

async function main() {
  console.log('🌱 Seeding database...\n');

  // ---- Users (one per role) ----
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@evault.in' },
      update: { status: 'APPROVED' },
      create: {
        email: 'admin@evault.in',
        passwordHash,
        role: 'ADMIN',
        fullName: 'Admin User',
        status: 'APPROVED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'lawyer@evault.in' },
      update: { status: 'APPROVED' },
      create: {
        email: 'lawyer@evault.in',
        passwordHash,
        role: 'LAWYER',
        fullName: 'Adv. Priya Sharma',
        status: 'APPROVED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'judge@evault.in' },
      update: { status: 'APPROVED' },
      create: {
        email: 'judge@evault.in',
        passwordHash,
        role: 'JUDGE',
        fullName: 'Hon. Justice Rajesh Kumar',
        status: 'APPROVED',
      },
    }),
    prisma.user.upsert({
      where: { email: 'client@evault.in' },
      update: { status: 'APPROVED' },
      create: {
        email: 'client@evault.in',
        passwordHash,
        role: 'CLIENT',
        fullName: 'Amit Patel',
        status: 'APPROVED',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  users.forEach((u) => console.log(`   ${u.role}: ${u.email} (password: ${DEFAULT_PASSWORD})`));

  // ---- Sample Documents ----
  const lawyer = users.find((u) => u.role === 'LAWYER');
  const client = users.find((u) => u.role === 'CLIENT');

  const sampleDocs = [
    {
      docId: uuidv4(),
      cid: `bafybeig${crypto.randomBytes(23).toString('hex')}`,
      currentHash: crypto.randomBytes(32).toString('hex'),
      ownerId: lawyer.id,
      filename: 'contract_agreement_2024.pdf',
      mimetype: 'application/pdf',
      sizeBytes: 245760,
    },
    {
      docId: uuidv4(),
      cid: `bafybeig${crypto.randomBytes(23).toString('hex')}`,
      currentHash: crypto.randomBytes(32).toString('hex'),
      ownerId: lawyer.id,
      filename: 'court_order_SC_2024.pdf',
      mimetype: 'application/pdf',
      sizeBytes: 512000,
    },
    {
      docId: uuidv4(),
      cid: `bafybeig${crypto.randomBytes(23).toString('hex')}`,
      currentHash: crypto.randomBytes(32).toString('hex'),
      ownerId: client.id,
      filename: 'affidavit_signed.pdf',
      mimetype: 'application/pdf',
      sizeBytes: 184320,
    },
    {
      docId: uuidv4(),
      cid: `bafybeig${crypto.randomBytes(23).toString('hex')}`,
      currentHash: crypto.randomBytes(32).toString('hex'),
      ownerId: client.id,
      filename: 'property_deed_scan.pdf',
      mimetype: 'application/pdf',
      sizeBytes: 1048576,
      version: 2,
    },
  ];

  const createdDocs = [];
  for (const doc of sampleDocs) {
    const created = await prisma.documentMetadata.upsert({
      where: { docId: doc.docId },
      update: {},
      create: doc,
    });
    createdDocs.push(created);
  }

  console.log(`\n✅ Created ${createdDocs.length} sample documents`);
  createdDocs.forEach((d) => console.log(`   📄 ${d.filename} (owner: ${d.ownerId})`));

  // ---- Sample Audit Logs ----
  const auditEntries = [
    {
      docId: createdDocs[0].id,
      userId: lawyer.id,
      action: 'UPLOAD',
      metadata: { filename: createdDocs[0].filename },
    },
    {
      docId: createdDocs[1].id,
      userId: lawyer.id,
      action: 'UPLOAD',
      metadata: { filename: createdDocs[1].filename },
    },
    {
      docId: createdDocs[0].id,
      userId: lawyer.id,
      action: 'SHARE',
      metadata: { sharedWith: client.id, permission: 'READ' },
    },
    {
      docId: createdDocs[2].id,
      userId: client.id,
      action: 'UPLOAD',
      metadata: { filename: createdDocs[2].filename },
    },
    {
      docId: createdDocs[3].id,
      userId: client.id,
      action: 'UPLOAD',
      metadata: { filename: createdDocs[3].filename },
    },
    {
      docId: createdDocs[3].id,
      userId: client.id,
      action: 'UPDATE',
      metadata: { previousVersion: 1, newVersion: 2 },
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }

  console.log(`\n✅ Created ${auditEntries.length} audit log entries`);
  console.log('\n🎉 Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
