-- SIH1284 PostgreSQL Database Migration - 001_initial_schema.down.sql

DROP TABLE IF EXISTS document_metadata CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
