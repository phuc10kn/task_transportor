CREATE TEMP TABLE team_backfill_guard (
  valid INTEGER NOT NULL CHECK (valid = 1)
);

INSERT INTO team_backfill_guard (valid)
SELECT CASE
  WHEN EXISTS (SELECT 1 FROM projects)
   AND NOT EXISTS (SELECT 1 FROM users WHERE enabled = 1)
  THEN 0 ELSE 1
END;

DROP TABLE team_backfill_guard;

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE team_members (
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('lead', 'member')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE projects ADD COLUMN team_id INTEGER REFERENCES teams(id) ON DELETE RESTRICT;
ALTER TABLE projects ADD COLUMN owner_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT;

INSERT INTO teams (id, name)
SELECT id, name || ' Team' FROM projects;

UPDATE projects
SET team_id = id,
    owner_user_id = (SELECT MIN(id) FROM users WHERE enabled = 1);

INSERT INTO team_members (team_id, user_id, role)
SELECT projects.team_id, users.id, 'lead'
FROM projects
CROSS JOIN users
WHERE users.enabled = 1;

CREATE UNIQUE INDEX projects_team_id_unique ON projects(team_id);
CREATE INDEX team_members_user_id_index ON team_members(user_id);

CREATE TRIGGER projects_require_team_owner_insert
BEFORE INSERT ON projects
WHEN NEW.team_id IS NULL OR NEW.owner_user_id IS NULL
BEGIN
  SELECT RAISE(ABORT, 'Project team and owner are required');
END;

CREATE TRIGGER projects_require_owner_lead_insert
BEFORE INSERT ON projects
WHEN NOT EXISTS (
  SELECT 1 FROM team_members
  WHERE team_id = NEW.team_id AND user_id = NEW.owner_user_id AND role = 'lead'
)
BEGIN
  SELECT RAISE(ABORT, 'Project owner must be team lead');
END;

CREATE TRIGGER projects_require_owner_lead_update
BEFORE UPDATE OF team_id, owner_user_id ON projects
WHEN NOT EXISTS (
  SELECT 1 FROM team_members
  WHERE team_id = NEW.team_id AND user_id = NEW.owner_user_id AND role = 'lead'
)
BEGIN
  SELECT RAISE(ABORT, 'Project owner must be team lead');
END;

CREATE TRIGGER team_members_protect_owner_delete
BEFORE DELETE ON team_members
WHEN EXISTS (
  SELECT 1 FROM projects
  WHERE team_id = OLD.team_id AND owner_user_id = OLD.user_id
)
BEGIN
  SELECT RAISE(ABORT, 'Project owner cannot be removed');
END;

CREATE TRIGGER team_members_protect_owner_role
BEFORE UPDATE OF role ON team_members
WHEN NEW.role <> 'lead' AND EXISTS (
  SELECT 1 FROM projects
  WHERE team_id = OLD.team_id AND owner_user_id = OLD.user_id
)
BEGIN
  SELECT RAISE(ABORT, 'Project owner must remain team lead');
END;

