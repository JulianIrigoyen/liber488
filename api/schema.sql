-- Liber 488 — core schema.

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  tier         TEXT NOT NULL DEFAULT 'free',   -- free | adept | magus
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER
);

-- Magic-link tokens. Single use, short lived.
CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_login_tokens_expiry ON login_tokens(expires_at);

-- One row per AI call. Doubles as the quota ledger and the spend audit.
CREATE TABLE IF NOT EXISTS ai_usage (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  oracle        TEXT NOT NULL,                 -- iching | tarot | astral | news
  day           TEXT NOT NULL,                 -- YYYY-MM-DD, UTC
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_quota ON ai_usage(user_id, day);

-- Readings are kept only when the user asks to save one.
CREATE TABLE IF NOT EXISTS readings (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  oracle     TEXT NOT NULL,
  question   TEXT NOT NULL,
  payload    TEXT NOT NULL,                    -- JSON: cast values, method, hexagrams
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_user ON readings(user_id, created_at DESC);
