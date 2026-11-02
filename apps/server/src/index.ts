// index.ts — SpeakUp backend (HTTP behind Nginx on 127.0.0.1:8080)

import http from 'node:http';
import { Readable } from 'node:stream';
import 'dotenv/config';

import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { registerRoutes } from './controllers';
import { combineErrorHandlers } from './internal/errorHandlers';
import {
  handleClientErrors,
  handlePathNotFoundErrors,
} from './internal/errorHandlers/handlers';
import httpRequestsRepository from './repositories/http_requests.repository';
import { registerWebsocketForServer } from './ws/server';

// --- App setup ---------------------------------------------------------------

const app = new Hono();

const allowed = new Set<string>([
  'https://speakupfyp.space',
  'https://www.speakupfyp.space',
  'https://speakup-bfy.pages.dev',
  'https://speakup.benntan.com',
  'https://localhost:443',
  'https://192.168.31.151',
  'http://localhost:443',
])

// CORS: apply to all routes (Hono's /api/* only matches one segment, so /api/v1/rooms wouldn't match)
app.use('*', cors({
  origin: (origin) => (origin && allowed.has(origin)) ? origin : '',
  allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization'],
  credentials: true,   // set to false if you don’t use cookies/auth
  maxAge: 86400,
}))

// Track request counts / HTTP status codes for the system-metrics dashboard.
// Uses routePath (the registered pattern, e.g. "/api/v1/rooms/:code/ttl") rather
// than the resolved path, so requests group by endpoint instead of fragmenting
// by every distinct room code. Wrapped so a logging failure (or an error that
// somehow escapes Hono's own onError) never breaks the actual response.
app.use('*', async (c, next) => {
  const start = performance.now();
  try {
    await next();
  } catch (err) {
    try {
      httpRequestsRepository.insertRequest({
        method: c.req.method,
        path: c.req.routePath,
        statusCode: 500,
        durationMs: performance.now() - start,
        timestamp: new Date(),
      });
    } catch {
      // Logging must never be the reason a request fails.
    }
    throw err;
  }
  try {
    httpRequestsRepository.insertRequest({
      method: c.req.method,
      path: c.req.routePath,
      statusCode: c.res.status,
      durationMs: performance.now() - start,
      timestamp: new Date(),
    });
  } catch {
    // Logging must never be the reason a request fails.
  }
});

// Basic routes
app.get('/', (c) => c.text('Hello from secure server!')); // text can stay the same
app.get('/health', (c) => c.json({ ok: true }));

// Register your API routes and error handlers
registerRoutes(app);
app.notFound(handlePathNotFoundErrors);
app.onError(combineErrorHandlers([handleClientErrors]));

// --- HTTP server (no TLS here; Nginx terminates HTTPS) ----------------------

const server = http.createServer(async (req, res) => {
  try {
    const body =
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : Readable.toWeb(req);

    // Internal scheme is http (external https is handled by Nginx)
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers as any,
      body,
      // Node's fetch-compatible streams need duplex for request bodies
      duplex: 'half',
    });

    const response = await app.fetch(request);

    // Relay response
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    // Fallback error handling
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
    // eslint-disable-next-line no-console
    console.error(err);
  }
});

// Attach WebSocket handlers (upgrade happens through Nginx with Upgrade headers)
registerWebsocketForServer(server);

// Bind internally; Nginx proxies from 443 -> 127.0.0.1:8080
const PORT = parseInt(process.env.SERVER_PORT || '8080', 10);
const HOST = process.env.SERVER_HOST_BIND || '127.0.0.1';

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP server on http://${HOST}:${PORT}`);
});
