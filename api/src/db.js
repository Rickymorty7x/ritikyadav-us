import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dbPath = process.env.DB_PATH || path.join(dataDir, "app.db");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    handle TEXT NOT NULL,
    text TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    image_url TEXT,
    likes INTEGER NOT NULL DEFAULT 0,
    fire INTEGER NOT NULL DEFAULT 0,
    idea INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const postCols = db.prepare("PRAGMA table_info(posts)").all().map((c) => c.name);
if (!postCols.includes("image_url")) {
  db.exec("ALTER TABLE posts ADD COLUMN image_url TEXT");
}

export function rowToPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    author: row.author,
    handle: row.handle,
    time: formatTime(row.created_at),
    text: row.text,
    tags: JSON.parse(row.tags || "[]"),
    imageUrl: row.image_url || null,
    reactions: {
      like: row.likes,
      fire: row.fire,
      idea: row.idea,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    published: !!row.published,
  };
}

function formatTime(iso) {
  try {
    return new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
  } catch {
    return iso;
  }
}
