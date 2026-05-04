import Database from 'better-sqlite3';
import path from 'path';

// This utility ensures we use the same db connection in development
// and resolves the path correctly whether running via `npm run dev` or built.
let db;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Ensure tables exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        id TEXT PRIMARY KEY,
        word TEXT NOT NULL,
        englishDef TEXT NOT NULL,
        chineseTrans TEXT NOT NULL,
        category TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id TEXT NOT NULL,
        learn_count INTEGER DEFAULT 0,
        UNIQUE(word_id),
        FOREIGN KEY(word_id) REFERENCES words(id)
      );
    `);
  }
  return db;
}
