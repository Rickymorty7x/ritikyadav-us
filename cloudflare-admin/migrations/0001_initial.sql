PRAGMA foreign_keys = ON;

CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations >= 100000),
  created_at INTEGER NOT NULL,
  password_changed_at INTEGER NOT NULL
);

CREATE TABLE gate_tokens (
  id_hash TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  browser_hash TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  used_at INTEGER
);
CREATE INDEX gate_tokens_expiry_idx ON gate_tokens(expires_at);
CREATE INDEX gate_tokens_ip_idx ON gate_tokens(ip_hash, created_at);

CREATE TABLE sessions (
  id_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE INDEX sessions_admin_idx ON sessions(admin_id, expires_at);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  username_hash TEXT NOT NULL,
  success INTEGER NOT NULL CHECK (success IN (0, 1)),
  created_at INTEGER NOT NULL
);
CREATE INDEX login_attempts_limit_idx ON login_attempts(ip_hash, username_hash, created_at);

CREATE TABLE content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('post', 'project', 'blog', 'opinion', 'music', 'page')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE(type, slug)
);
CREATE INDEX content_public_idx ON content(type, status, published_at, sort_order);
CREATE INDEX content_updated_idx ON content(updated_at);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX audit_log_time_idx ON audit_log(created_at DESC);
