import Database from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import { runMigrations } from './migrate';

let db: Database.Database;

export function initDatabase(): Database.Database {
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

export function getDatabase(): Database.Database {
  if (!db) throw new Error('[DB] Database not initialized');
  return db;
}
