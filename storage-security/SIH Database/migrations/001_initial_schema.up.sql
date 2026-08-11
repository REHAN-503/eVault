-- SIH1284 PostgreSQL Database Schema Migration - 001_initial_schema.up.sql
-- NON-SENSITIVE Document Metadata, Users, and Sessions ONLY
-- NO raw documents or plain text encryption keys are stored in this database.

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY, -- User identifier (UUID or wallet address)
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('lawyer', 'judge', 'court_staff', 'client', 'admin')),
    public_key_pem TEXT, -- RSA/ECC Public Key for identity verification
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of session JWT/token
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 3. DOCUMENT METADATA TABLE (NON-SENSITIVE)
CREATE TABLE IF NOT EXISTS document_metadata (
    id VARCHAR(64) PRIMARY KEY, -- Unique Document ID (docId)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    doc_hash VARCHAR(66) NOT NULL, -- SHA-256 hash of original file (0x...) for on-chain verification
    storage_cid VARCHAR(255) NOT NULL, -- IPFS CID / Off-Chain Storage Identifier
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    mime_type VARCHAR(100) DEFAULT 'application/pdf' NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON document_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_hash ON document_metadata(doc_hash);
CREATE INDEX IF NOT EXISTS idx_documents_storage_cid ON document_metadata(storage_cid);
