import http from 'http';
import { CONFIG } from '../config.js';
import { storageService } from './storage.service.js';

/**
 * Lightweight HTTP server exposing storage endpoints for containerization (Docker)
 * and inter-service HTTP communication for Member 2 (Backend Gateway Lead).
 */
export function createStorageServer() {
  return http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // Health check endpoint
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'UP',
          service: 'SIH1284 Off-Chain Storage Service',
          driver: CONFIG.STORAGE_DRIVER,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Upload endpoint: POST /upload
    if (req.method === 'POST' && url.pathname === '/upload') {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks);
          if (body.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Empty file payload' }));
            return;
          }

          const result = await storageService.uploadFile(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Retrieve endpoint: GET /retrieve/:cid or GET /retrieve?cid=...
    if (req.method === 'GET' && url.pathname.startsWith('/retrieve')) {
      const cidParam = url.searchParams.get('cid') || url.pathname.replace('/retrieve/', '').trim();

      if (!cidParam) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing CID parameter' }));
        return;
      }

      try {
        const encryptedBuffer = await storageService.retrieveFile(cidParam);
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': encryptedBuffer.length,
          'X-Storage-CID': cidParam,
        });
        res.end(encryptedBuffer);
      } catch (err: any) {
        res.writeHead(444, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });
}

// Start standalone HTTP server if executed directly
if (process.argv[1] && process.argv[1].includes('server')) {
  const server = createStorageServer();
  server.listen(CONFIG.STORAGE_SERVICE_PORT, () => {
    console.log(
      `[SIH1284 Storage Service] Running on port ${CONFIG.STORAGE_SERVICE_PORT} (Driver: ${CONFIG.STORAGE_DRIVER})`
    );
  });
}
