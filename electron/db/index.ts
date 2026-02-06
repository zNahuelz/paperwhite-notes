import { createRequire } from 'node:module';
import { app } from 'electron';
import path from 'node:path';
import { runMigrations } from './migrate';
import type { Database as DatabaseType } from 'better-sqlite3';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

let db: DatabaseType;

export function initDatabase(): DatabaseType {
  if (!app.isReady()) {
    throw new Error('[DB] initDatabase() called before app ready');
  }

  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'paperwhite-notes.db');

  db = new Database(dbPath);

  /**
   * DEFAULT (Rollback) : App freezes when the db is trying to read and write at the same time.
   * WAL (Concurrency) : Read doesn't block writing.
   */
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
}

export function getDatabase(): DatabaseType {
  if (!db) throw new Error('[DB] Database not initialized');
  return db;
}
