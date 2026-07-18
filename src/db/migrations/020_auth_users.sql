ALTER TABLE admin_users RENAME TO users;

ALTER TABLE users ADD COLUMN system_role TEXT NOT NULL DEFAULT 'user'
  CHECK (system_role IN ('system_admin', 'user'));

UPDATE users SET system_role = 'system_admin';

