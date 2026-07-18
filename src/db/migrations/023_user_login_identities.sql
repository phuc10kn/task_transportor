ALTER TABLE users ADD COLUMN password_configured INTEGER NOT NULL DEFAULT 1
  CHECK (password_configured IN (0, 1));

CREATE TABLE user_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google')),
  provider_subject TEXT NOT NULL,
  provider_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (provider, provider_subject),
  UNIQUE (user_id, provider),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_identities_user_id ON user_identities(user_id);
