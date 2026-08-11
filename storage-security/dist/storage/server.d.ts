import http from 'http';
/**
 * Lightweight HTTP server exposing storage endpoints for containerization (Docker)
 * and inter-service HTTP communication for Member 2 (Backend Gateway Lead).
 */
export declare function createStorageServer(): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
//# sourceMappingURL=server.d.ts.map