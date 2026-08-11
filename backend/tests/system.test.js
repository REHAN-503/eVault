const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

describe('System Endpoints', () => {
  let adminToken;
  let lawyerToken;

  beforeAll(async () => {
    try {
      await prisma.$connect();
    } catch {
      console.warn('⚠️  Database not reachable — tests will be skipped');
      return;
    }

    // Register ADMIN
    await request(app).post('/api/v1/auth/register').send({
      email: 'admin_sys@test.com',
      password: 'TestPass123',
      fullName: 'Admin Sys',
      role: 'ADMIN',
    });
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin_sys@test.com',
      password: 'TestPass123',
    });
    adminToken = adminRes.body.data.accessToken;

    // Register LAWYER
    await request(app).post('/api/v1/auth/register').send({
      email: 'lawyer_sys@test.com',
      password: 'TestPass123',
      fullName: 'Lawyer Sys',
      role: 'LAWYER',
    });
    const lawyerRes = await request(app).post('/api/v1/auth/login').send({
      email: 'lawyer_sys@test.com',
      password: 'TestPass123',
    });
    lawyerToken = lawyerRes.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { in: ['admin_sys@test.com', 'lawyer_sys@test.com'] } },
      });
    } catch (err) {
      console.warn('Cleanup failed (possibly DB not running)');
    }
    await prisma.$disconnect();
  });

  describe('GET /api/v1/system/status', () => {
    it('should return system status with 200 OK', async () => {
      const res = await request(app).get('/api/v1/system/status');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
    });
  });

  describe('GET /api/v1/system/info', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/v1/system/info');
      expect(res.statusCode).toBe(401);
    });

    it('should return 403 if not ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/system/info')
        .set('Authorization', `Bearer ${lawyerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should return system info for ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/system/info')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.environment).toBeDefined();
    });
  });

  describe('GET /api/v1/system/version', () => {
    it('should return API version with 200 OK', async () => {
      const res = await request(app).get('/api/v1/system/version');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBeDefined();
    });
  });
});
