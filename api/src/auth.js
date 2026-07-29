import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "./db.js";

const SESSION_DAYS = 14;

export function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function createUser({ username, password, displayName }) {
  const passwordHash = bcrypt.hashSync(password, 12);
  const info = db
    .prepare(
      "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)"
    )
    .run(username, passwordHash, displayName);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function createSession(userId) {
  const token = nanoid(48);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, expires);
  return { token, expiresAt: expires };
}

export function destroySession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getSessionUser(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token);
  return row || null;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies?.session || "";
  const user = getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = user;
  req.token = token;
  next();
}
