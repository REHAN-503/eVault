export type UserRole = 'lawyer' | 'judge' | 'court_staff' | 'client' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  public_key_pem?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
}

export interface DocumentMetadataRecord {
  id: string;
  title: string;
  description?: string;
  doc_hash: string; // SHA-256 (0x...)
  storage_cid: string; // IPFS CID
  owner_id: string;
  mime_type: string;
  file_size_bytes: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}
