CREATE TABLE analytics_daily (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  last_seen_at INTEGER NOT NULL,
  PRIMARY KEY (day, path)
);
CREATE INDEX analytics_daily_day_idx ON analytics_daily(day DESC);

CREATE TABLE analytics_visitors (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (day, visitor_hash)
);
CREATE INDEX analytics_visitors_day_idx ON analytics_visitors(day DESC);

CREATE TABLE security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  occurrence_count INTEGER NOT NULL DEFAULT 1 CHECK (occurrence_count > 0),
  bucket INTEGER NOT NULL,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  acknowledged_at INTEGER,
  UNIQUE (kind, ip_hash, bucket)
);
CREATE INDEX security_events_unread_idx ON security_events(acknowledged_at, last_seen_at DESC);
CREATE INDEX security_events_time_idx ON security_events(last_seen_at DESC);
