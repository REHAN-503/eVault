import { mockDelay, getDocuments, getAuditLog, getUsers } from './data';

export async function getSystemStatus() {
  await mockDelay(400);
  return {
    status: 'ok',
    services: {
      database: 'connected',
      blockchain: 'operational',
      storage: 'operational'
    },
    version: '1.0.0 (Mock Mode)',
    uptime: 'Demo Session'
  };
}

export async function getSystemInfo() {
  await mockDelay(400);
  const docs = getDocuments();
  const verifiedCount = docs.filter(d => d.status === 'verified').length;
  return {
    metrics: {
      totalDocuments: docs.length,
      verifiedToday: verifiedCount,
      activeCases: 2,
      registeredUsers: getUsers().length,
      auditEvents: getAuditLog().length
    },
    environment: 'development'
  };
}

export async function listUsers() {
  await mockDelay(200);
  return getUsers();
}
