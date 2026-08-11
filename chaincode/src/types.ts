import { Permission, Role } from './validation';

export interface UserRecord {
  userId: string;
  role: Role;
}

export interface DocumentMetadata {
  filename?: string;
  mimetype?: string;
  sizeBytes?: number;
  version?: number;
  [key: string]: unknown;
}

export interface DocumentRecord {
  docId: string;
  hash: string;
  metadata: DocumentMetadata;
  ownerId: string;
}

export interface AccessRecord {
  docId: string;
  userId: string;
  permission: Permission;
}

export interface AuditEntry {
  docId: string;
  userId: string;
  action: string;
  timestamp: string;
}
