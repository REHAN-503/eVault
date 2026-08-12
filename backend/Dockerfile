FROM node:20-alpine

WORKDIR /app

# Native build tools for packages such as bcrypt
RUN apk add --no-cache python3 make g++

# =========================================================
# Local eVault packages
# =========================================================

COPY gateway /gateway
# =========================================================
# Backend dependencies
# =========================================================

COPY backend/package.json backend/package-lock.json* ./

RUN npm install --omit=dev --package-lock=false

# =========================================================
# Prisma
# =========================================================

COPY backend/prisma ./prisma

RUN npx prisma generate

# =========================================================
# Backend source
# =========================================================

COPY backend/src ./src
COPY backend/scripts ./scripts

# Runtime directories
RUN mkdir -p /app/uploads /app/storage_vault && chown -R node:node /app/uploads /app/storage_vault

# The Fabric Admin identity is mounted read-only at runtime.
# The node user is UID 1000 on the official Node image,
# matching the normal WSL user that owns the Fabric files.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
