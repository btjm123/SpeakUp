import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// Persisted alongside the ephemeral in-memory analytics so sessions survive
// a server restart and can be queried (e.g. from Grafana) across sessions,
// filtered by room_code ("session") and username.
const dbPath =
  process.env.ANALYTICS_DB_PATH || path.join(process.cwd(), 'data', 'analytics.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT NOT NULL,
    username TEXT NOT NULL,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    priority INTEGER,
    duration_ms INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_events_room ON events(room_code);
  CREATE INDEX IF NOT EXISTS idx_events_username ON events(username);
  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
`);

const insertStmt = db.prepare(`
  INSERT INTO events (room_code, username, event_type, timestamp, priority, duration_ms)
  VALUES (@roomCode, @username, @eventType, @timestamp, @priority, @durationMs)
`);

type PersistableEvent = {
  username: string;
  eventType: string;
  timestamp: Date;
  priority?: number;
  duration?: number;
};

export default {
  insertEvent(roomCode: string, event: PersistableEvent): void {
    insertStmt.run({
      roomCode,
      username: event.username,
      eventType: event.eventType,
      timestamp: event.timestamp.toISOString(),
      priority: event.priority ?? null,
      durationMs: event.duration ?? null,
    });
  },
};
