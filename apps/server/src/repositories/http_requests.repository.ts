import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// Shares the same SQLite file as events.repository.ts (and the same
// ANALYTICS_DB_PATH), just a different table — for the system-metrics
// dashboard (request counts / HTTP status codes) rather than participation.
const dbPath =
  process.env.ANALYTICS_DB_PATH || path.join(process.cwd(), 'data', 'analytics.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS http_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    timestamp TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_http_requests_timestamp ON http_requests(timestamp);
  CREATE INDEX IF NOT EXISTS idx_http_requests_status ON http_requests(status_code);
`);

const insertStmt = db.prepare(`
  INSERT INTO http_requests (method, path, status_code, duration_ms, timestamp)
  VALUES (@method, @path, @statusCode, @durationMs, @timestamp)
`);

export default {
  insertRequest(entry: {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    timestamp: Date;
  }): void {
    insertStmt.run({
      method: entry.method,
      path: entry.path,
      statusCode: entry.statusCode,
      durationMs: entry.durationMs,
      timestamp: entry.timestamp.toISOString(),
    });
  },
};
