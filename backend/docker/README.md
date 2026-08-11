# docker/ — Auxiliary Docker Files

This directory is reserved for auxiliary Docker configuration files:
- PostgreSQL init scripts
- `docker-compose.override.yml` for local dev overrides
- Non-trivial `.dockerignore` content

The primary `Dockerfile` and `docker-compose.yml` live at the repository root
(Member 5 expects them there per T21).

Do NOT duplicate the root Dockerfile here.
