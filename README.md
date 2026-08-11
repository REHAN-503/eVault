# eVault

Blockchain-backed legal records registry built with React/Vite, Node.js, PostgreSQL, Hyperledger Fabric and Docker.

## Requirements

- Windows 10/11
- WSL2 with Ubuntu
- Docker Desktop
- Docker Desktop WSL2 integration enabled

## Quick Start

From WSL:

    cd ~/eVault
    docker compose up -d --build

Check containers:

    docker compose ps

## Access

Frontend: http://localhost:8080

Backend: http://localhost:3000

Health: http://localhost:3000/health

API Docs: http://localhost:3000/api-docs

## Admin

Email: admin@evault.in

Password: Admin@123456

Admin panel: http://localhost:8080/admin

## Useful Commands

Start:

    docker compose up -d

Rebuild:

    docker compose up -d --build

Stop:

    docker compose down

Logs:

    docker compose logs -f

Backend logs:

    docker compose logs -f backend

Frontend logs:

    docker compose logs -f frontend

## Project Structure

    eVault/
    ├── backend/
    ├── frontend/
    ├── chaincode/
    ├── fabric/
    ├── gateway/
    ├── storage-security/
    ├── docker/
    ├── scripts/
    └── docker-compose.yml

## Security

This project is intended for local testing/demo purposes. Change default passwords and secrets before production use.
