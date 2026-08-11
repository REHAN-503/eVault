'use strict';

const request = require('supertest');
const path = require('path');

// Set test env vars BEFORE importing app
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://evault:evault_secret@localhost:5432/evault_test?schema=public';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const app = require('../src/app');
const prisma = require('../src/config/database');

const testEmail = `doctest_${Date.now()}@evault.test`;
let accessToken;
let userId;
let documentId;

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch {
    console.warn('⚠️  Database not reachable — tests will be skipped');
    return;
  }

  // Register and login a test user
  await request(app).post('/api/v1/auth/register').send({
    email: testEmail,
    password: 'TestPass123',
    fullName: 'Document Test User',
    role: 'LAWYER',
  });

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: testEmail,
    password: 'TestPass123',
  });

  accessToken = loginRes.body.data.accessToken;
  userId = loginRes.body.data.user.id;
});

afterAll(async () => {
  try {
    // Clean up: delete audit logs, documents, sessions, then user
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
      await prisma.documentMetadata.deleteMany({ where: { ownerId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  } catch {
    // DB might not be available
  }
  await prisma.$disconnect();
});

describe('Document Flow', () => {
  describe('POST /api/v1/documents/upload', () => {
    it('should upload a document', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('encrypted-content-for-testing'), {
          filename: 'test-contract.pdf',
          contentType: 'application/pdf',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('docId');
      expect(res.body.data).toHaveProperty('cid');
      expect(res.body.data.filename).toBe('test-contract.pdf');

      documentId = res.body.data.id;
    });

    it('should reject upload without auth', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .attach('file', Buffer.from('content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/documents', () => {
    it('should list documents', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('documents');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.documents)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/documents?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('should get document by id', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(documentId);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/v1/documents/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should reject invalid UUID', async () => {
      const res = await request(app)
        .get('/api/v1/documents/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/documents/:id/download', () => {
    it('should download document file', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBeDefined();
      expect(res.headers['content-disposition']).toContain('test-contract.pdf');
    });
  });

  describe('PUT /api/v1/documents/:id', () => {
    it('should update document with new version', async () => {
      const res = await request(app)
        .put(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('updated-encrypted-content'), {
          filename: 'test-contract-v2.pdf',
          contentType: 'application/pdf',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe(2);
    });
  });

  describe('GET /api/v1/documents/:id/history', () => {
    it('should get version history', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/history`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/documents/:id/audit', () => {
    it('should get audit trail', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/audit`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/documents/:id/share', () => {
    it('should share document', async () => {
      // We need another user to share with — use userId itself for mock
      const res = await request(app)
        .post(`/api/v1/documents/${documentId}/share`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId, permission: 'READ' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/documents/:id/revoke', () => {
    it('should revoke access', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${documentId}/revoke`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/documents/:id', () => {
    it('should soft-delete document', async () => {
      const res = await request(app)
        .delete(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for deleted document', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});

describe('CIS Integration', () => {
  describe('POST /api/v1/integration/cis/sync', () => {
    it('should sync with mock CIS', async () => {
      const res = await request(app)
        .post('/api/v1/integration/cis/sync')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          documentId: '00000000-0000-0000-0000-000000000001',
          caseNumber: 'WP-2024-001',
          courtCode: 'SC',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('caseId');
      expect(res.body.data).toHaveProperty('caseRecord');
      expect(res.body.data.status).toBe('SYNCED');
    });

    it('should validate CIS sync input', async () => {
      const res = await request(app)
        .post('/api/v1/integration/cis/sync')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});
