import { USE_MOCK } from './client';
import * as liveDocs from './live/documents';
import * as mockDocs from './mock/documents';

const docs = USE_MOCK ? mockDocs : liveDocs;

export const listDocuments = docs.listDocuments;
export const getDocument = docs.getDocument;
export const getVersionHistory = docs.getVersionHistory;
export const downloadDocument = docs.downloadDocument;
export const uploadDocument = docs.uploadDocument;
export const updateDocument = docs.updateDocument;
export const deleteDocument = docs.deleteDocument;
export const checkAccess = docs.checkAccess;
export const grantAccess = docs.grantAccess;
export const revokeAccess = docs.revokeAccess;
export const getDocumentAudit = docs.getDocumentAudit;
