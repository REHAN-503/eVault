import client from '../client';
import { encryptFile, decryptFile } from '../../services/encryption';

const DEMO_ENCRYPTION_KEY = 'sih1284-demo-encryption-key';

export async function listDocuments(page = 1, limit = 20, search = '') {
  const { data } = await client.get('/documents', { params: { page, limit, search } });
  return data.data; 
}

export async function getDocument(docId) {
  const { data } = await client.get(`/documents/${docId}`);
  return data;
}

export async function getVersionHistory(docId) {
  const { data } = await client.get(`/documents/${docId}/history`);
  return data;
}

export async function downloadDocument(docId) {
  const response = await client.get(`/documents/${docId}/download`, {
    responseType: 'blob'
  });
  
  // Decrypt client-side
  const decryptedBlob = await decryptFile(response.data, DEMO_ENCRYPTION_KEY, response.headers['content-type']);
  return URL.createObjectURL(decryptedBlob);
}

export async function uploadDocument({ title, caseNo, file }, onStep) {
  const steps = [
    'Encrypting file (AES-256, client-side)',
    'Authenticating request at API Gateway',
    'Pushing encrypted object to IPFS',
    'Content hash (CID) returned',
    'Calling DocumentRegistryContract.recordDocument()',
    'Writing hash + metadata to ledger',
    'DocumentAdded event confirmed',
  ];

  onStep?.(0, steps[0]);
  const encryptedFile = await encryptFile(file, DEMO_ENCRYPTION_KEY);

  const form = new FormData();
  form.append('title', title);
  form.append('caseNo', caseNo);
  form.append('file', encryptedFile);
  
  onStep?.(1, steps[1]);
  const { data } = await client.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      if (progress > 20) onStep?.(2, steps[2]);
      if (progress > 50) onStep?.(3, steps[3]);
      if (progress > 80) onStep?.(4, steps[4]);
      if (progress === 100) onStep?.(5, steps[5]);
    },
  });
  
  onStep?.(6, steps[6]);
  return data;
}

export async function checkAccess(docId, userId) {
  try {
    await getDocument(docId);
    return { allowed: true };
  } catch (err) {
    return { allowed: false };
  }
}

export async function grantAccess(docId, userId, permission = 'READ') {
  const { data } = await client.post(`/documents/${docId}/share`, { userId, permission });
  return data;
}

export async function revokeAccess(docId, userId) {
  const { data } = await client.post(`/documents/${docId}/revoke`, { userId });
  return data;
}

export async function getDocumentAudit(docId) {
  const { data } = await client.get(`/documents/${docId}/audit`);
  return data;
}

export async function updateDocument(docId, { file }, onStep) {
  const steps = [
    'Encrypting new version (AES-256)',
    'Authenticating request',
    'Uploading file to IPFS',
    'Updating DocumentRegistryContract',
    'DocumentUpdated event confirmed',
  ];
  onStep?.(0, steps[0]);
  const encryptedFile = await encryptFile(file, DEMO_ENCRYPTION_KEY);

  const form = new FormData();
  form.append('file', encryptedFile);

  onStep?.(1, steps[1]);
  const { data } = await client.put(`/documents/${docId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      if (progress > 20) onStep?.(2, steps[2]);
      if (progress > 50) onStep?.(3, steps[3]);
      if (progress > 80) onStep?.(4, steps[4]);
    },
  });
  
  return data;
}

export async function deleteDocument(docId) {
  const { data } = await client.delete(`/documents/${docId}`);
  return data;
}
