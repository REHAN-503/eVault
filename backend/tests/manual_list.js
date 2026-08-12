const { PrismaClient } = require('@prisma/client');

const documentService = require('../src/services/document/document.service');

const prisma = new PrismaClient();

async function test() {
  const lawyer = await prisma.user.findFirst({ where: { email: 'lawyer@evault.in' } });
  const { documents } = await documentService.listDocuments(lawyer.id, lawyer.role, {
    page: 1,
    limit: 10,
  });

  console.log('Documents from DB:', documents.length);
  if (documents.length > 0) {
    console.log('Owner ID type in DB:', typeof documents[0].ownerId, documents[0].ownerId);
    console.log('Lawyer ID type:', typeof lawyer.id, lawyer.id);
  }

  process.exit(0);
}
test().catch(console.error);
