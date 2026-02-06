import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations(db: Database.Database) {
  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  ).run();

  const applied = new Set(
    db
      .prepare(`SELECT name FROM schema_migrations`)
      .all()
      .map((r: any) => r.name)
  );

  const migrationsDir = app.isPackaged
    ? path.join(process.resourcesPath, 'schema')
    : path.join(__dirname, 'schema');

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql') || applied.has(file)) continue;

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    if (!sql) {
      console.error(`[DB] Migration file ${file} is empty or unreadable at ${fullPath}`);
      continue;
    }

    const migrationTransaction = db.transaction(() => {
      db.exec(sql);
      db.prepare(`INSERT INTO schema_migrations (name) VALUES (?)`).run(file);
    });

    try {
      migrationTransaction();
    } catch (err) {
      throw err;
    }
  }
}
