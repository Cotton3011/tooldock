CREATE TABLE vtubers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  reading TEXT NOT NULL,
  normalized_reading TEXT NOT NULL,
  x_url TEXT,
  youtube_url TEXT,
  twitch_url TEXT,
  registration_number INTEGER UNIQUE,
  slug TEXT UNIQUE,
  seo_eligible INTEGER NOT NULL DEFAULT 0 CHECK (seo_eligible IN (0, 1)),
  report_count INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  hidden_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vtubers_reading ON vtubers(normalized_reading);
CREATE INDEX idx_vtubers_visible ON vtubers(hidden, normalized_name);
CREATE UNIQUE INDEX idx_vtubers_x_url ON vtubers(x_url) WHERE x_url IS NOT NULL;
CREATE UNIQUE INDEX idx_vtubers_youtube_url ON vtubers(youtube_url) WHERE youtube_url IS NOT NULL;

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vtuber_id INTEGER NOT NULL REFERENCES vtubers(id),
  reason TEXT NOT NULL,
  detail TEXT,
  reporter_hash TEXT NOT NULL,
  browser_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  UNIQUE(vtuber_id, reporter_hash),
  UNIQUE(vtuber_id, browser_hash)
);
CREATE INDEX idx_reports_rate ON reports(reporter_hash, created_at);
CREATE INDEX idx_reports_expiry ON reports(expires_at);

CREATE TABLE abuse_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  actor_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_abuse_events_rate ON abuse_events(action, actor_hash, created_at);
