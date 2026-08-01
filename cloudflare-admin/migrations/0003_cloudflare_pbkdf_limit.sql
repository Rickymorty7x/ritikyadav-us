-- Cloudflare's production Web Crypto runtime caps PBKDF2 at 100,000
-- iterations. Rebuild the related tables so existing installations retain
-- their owner, sessions, and audit history while accepting that maximum.
PRAGMA defer_foreign_keys = ON;

CREATE TABLE admins_next (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations >= 100000),
  created_at INTEGER NOT NULL,
  password_changed_at INTEGER NOT NULL
);

CREATE TABLE sessions_next (
  id_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins_next(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE TABLE audit_log_next (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES admins_next(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);

INSERT INTO admins_next SELECT * FROM admins;
INSERT INTO sessions_next SELECT * FROM sessions;
INSERT INTO audit_log_next SELECT * FROM audit_log;

DROP TABLE sessions;
DROP TABLE audit_log;
DROP TABLE admins;

ALTER TABLE admins_next RENAME TO admins;
ALTER TABLE sessions_next RENAME TO sessions;
ALTER TABLE audit_log_next RENAME TO audit_log;

CREATE INDEX sessions_admin_idx ON sessions(admin_id, expires_at);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE INDEX audit_log_time_idx ON audit_log(created_at DESC);

PRAGMA defer_foreign_keys = OFF;
