const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const hash = await bcrypt.hash('password123', 12);
  await prisma.user.updateMany({ where: { email: 'lawyer@evault.in' }, data: { passwordHash: hash } });

  const loginRes = await request(app).post('/api/v1/auth/login').send({ email: 'lawyer@evault.in', password: 'password123' });
  const token = loginRes.body.data.accessToken;
  const user = loginRes.body.data.user;
  
  console.log("Logged in user:", user);
  
  const meRes = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
  const meUser = meRes.body.data;
  
  console.log("Me user:", meUser);
  
  const docRes = await request(app).get('/api/v1/documents').set('Authorization', `Bearer ${token}`);
  const docs = docRes.body.data.documents;
  
  console.log("Docs length:", docs.length);
  if (docs.length > 0) {
    console.log("First doc ownerId:", docs[0].ownerId);
    console.log("Match?", docs[0].ownerId === user.id);
  }
}
test().catch(console.error);
