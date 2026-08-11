import { getDocuments, setDocuments, getAuditLog, setAuditLog, getUsers, mockDelay } from './data';
import { getCurrentUser } from './auth';
import { pushNotification } from './notifications';

const UPLOAD_STEPS = [
  'Encrypting file (AES-256, client-side)',
  'Authenticating request at API Gateway',
  'Pushing encrypted object to IPFS',
  'Content hash (CID) returned',
  'Calling DocumentRegistryContract.recordDocument()',
  'Writing hash + metadata to ledger',
  'DocumentAdded event confirmed',
];

export async function listDocuments(page = 1, limit = 20, search = '') {
  await mockDelay(500);
  return getDocuments();
}

export async function getDocument(docId) {
  await mockDelay(350);
  const doc = getDocuments().find((d) => d.docId === docId);
  const user = await getCurrentUser();

  if (doc && user?.role === 'client') {
    const sharedWithMe = (doc.sharedWith || []).includes(user.id);
    if (!sharedWithMe) {
      throw new Error('Access Denied. You do not have permission to view this legal record.');
    }
  }

  return doc || null;
}

export async function getVersionHistory(docId) {
  await mockDelay(350);
  const doc = getDocuments().find((d) => d.docId === docId);
  if (!doc) return [];
  return Array.from({ length: doc.version }, (_, i) => ({
    version: i + 1,
    hash: doc.hash.slice(0, -1) + i,
    updatedAt: doc.updatedAt,
    updatedBy: doc.ownerName,
  })).reverse();
}

export async function downloadDocument(docId) {
  await mockDelay(600);
  const doc = getDocuments().find((d) => d.docId === docId);
  const content = `MOCK DOWNLOAD\n\nTitle: ${doc?.title}\nCase: ${doc?.caseNo}\nHash: ${doc?.hash}`;
  const blob = new Blob([content], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

export async function uploadDocument({ title, caseNo, file }, onStep) {
  for (let i = 0; i < UPLOAD_STEPS.length; i++) {
    onStep?.(i, UPLOAD_STEPS[i]);
    await mockDelay(420);
  }

  const user = await getCurrentUser();
  const docs = getDocuments();
  const docId = `DOC-${Math.floor(80000 + Math.random() * 9000)}`;

  const doc = {
    docId,
    title,
    caseNo,
    ownerId: user?.id || 'usr_101',
    ownerName: user?.name || 'You',
    hash: '0x' + Array.from({ length: 62 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    cid: 'bafybei' + Array.from({ length: 50 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join(''),
    status: 'verified',
    size: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '—',
    version: 1,
    updatedAt: new Date().toISOString(),
    sharedWith: [],
  };

  setDocuments([doc, ...docs]);

  const audit = getAuditLog();
  setAuditLog([{
    id: `evt_${Date.now()}`,
    docId: doc.docId,
    userId: doc.ownerId,
    userName: doc.ownerName,
    action: 'DocumentAdded',
    timestamp: doc.updatedAt,
  }, ...audit]);

  pushNotification({
    userId: null,
    type: 'Document',
    title: 'New Document Registered',
    desc: `Document ${docId} has been successfully secured on the registry.`
  });

  return doc;
}

export async function checkAccess(docId, userId) {
  await mockDelay(250);
  const doc = getDocuments().find((d) => d.docId === docId);
  if (!doc) return { allowed: false };
  if (doc.status === 'flagged') return { allowed: false };
  return { allowed: true };
}

export async function grantAccess(docId, userId, permission = 'READ') {
  await mockDelay(400);
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.docId === docId);
  if (idx !== -1) {
    const shared = docs[idx].sharedWith || [];
    if (!shared.includes(userId)) {
      docs[idx] = { ...docs[idx], sharedWith: [...shared, userId] };
      setDocuments([...docs]);
    }
  }

  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  const audit = getAuditLog();
  setAuditLog([{
    id: `evt_${Date.now()}`,
    docId,
    userId,
    userName: target?.name || userId,
    action: `SHARE (${permission}) → ${userId}`,
    timestamp: new Date().toISOString(),
  }, ...audit]);

  pushNotification({
    userId,
    type: 'Access',
    title: 'Access Granted',
    desc: `You have been granted ${permission} access to document ${docId}.`
  });

  return { ok: true };
}

export async function revokeAccess(docId, userId) {
  await mockDelay(400);
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.docId === docId);
  if (idx !== -1) {
    docs[idx] = {
      ...docs[idx],
      sharedWith: (docs[idx].sharedWith || []).filter((id) => id !== userId),
    };
    setDocuments([...docs]);
  }

  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  const audit = getAuditLog();
  setAuditLog([{
    id: `evt_${Date.now()}`,
    docId,
    userId,
    userName: target?.name || userId,
    action: `REVOKE → ${userId}`,
    timestamp: new Date().toISOString(),
  }, ...audit]);
  return { ok: true };
}

export async function getDocumentAudit(docId) {
  await mockDelay(300);
  return getAuditLog().filter((a) => a.docId === docId);
}

export async function updateDocument(docId, { file }, onStep) {
  const steps = [
    'Encrypting new version (AES-256)',
    'Authenticating request',
    'Uploading file to IPFS',
    'Updating DocumentRegistryContract',
    'DocumentUpdated event confirmed',
  ];
  for (let i = 0; i < steps.length; i++) {
    onStep?.(i, steps[i]);
    await mockDelay(400);
  }

  const docs = getDocuments();
  const docIndex = docs.findIndex((d) => d.docId === docId);
  if (docIndex === -1) throw new Error('Document not found');

  const doc = { ...docs[docIndex] };
  doc.version += 1;
  doc.updatedAt = new Date().toISOString();
  doc.hash = '0x' + Array.from({ length: 62 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  if (file) doc.size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  docs[docIndex] = doc;
  setDocuments([...docs]);

  const audit = getAuditLog();
  setAuditLog([{
    id: `evt_${Date.now()}`,
    docId: doc.docId,
    userId: doc.ownerId,
    userName: doc.ownerName,
    action: `DocumentUpdated (v${doc.version})`,
    timestamp: doc.updatedAt,
  }, ...audit]);

  return doc;
}

export async function deleteDocument(docId) {
  await mockDelay(600);
  const docs = getDocuments();
  setDocuments(docs.filter((d) => d.docId !== docId));
  return { ok: true };
}
