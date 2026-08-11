# syntax=docker/dockerfile:1
FROM node:lts AS builder
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
RUN npm ci && npm run package

FROM node:lts AS production
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64 /tini
RUN chmod +x /tini
WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package.json ./
COPY --chown=node:node --from=builder /usr/src/app/npm-shrinkwrap.json ./
COPY --chown=node:node docker/docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
RUN chmod +x /usr/src/app/docker-entrypoint.sh
RUN npm ci --omit=dev && npm cache clean --force

ARG CC_SERVER_PORT=9999
ENV CHAINCODE_SERVER_ADDRESS 0.0.0.0:${CC_SERVER_PORT}
EXPOSE ${CC_SERVER_PORT}

USER node
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
