const { createConnection } = require("../../../infrastructure/database/connection");

const DISABLED_PASSWORD_HASH = "disabled$google";
const USER_SELECT = `
  SELECT users.*,
    EXISTS(
      SELECT 1 FROM user_identities identity
      WHERE identity.user_id = users.id AND identity.provider = 'google'
    ) AS google_linked,
    (
      SELECT identity.provider_email FROM user_identities identity
      WHERE identity.user_id = users.id AND identity.provider = 'google'
      LIMIT 1
    ) AS google_email
  FROM users`;

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    system_role: row.system_role,
    enabled: Boolean(row.enabled),
    has_password: Boolean(row.password_configured),
    google_linked: Boolean(row.google_linked),
    google_email: row.google_email || null,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createUserRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });
    try { return callback(db); } finally { db.close(); }
  }

  function selectById(db, id) {
    return db.prepare(`${USER_SELECT} WHERE users.id = ?`).get(id);
  }

  return {
    create({ email, passwordHash, name = null, systemRole = "user" }) {
      return withDb((db) => {
        const result = db.prepare(
          `INSERT INTO users (email, password_hash, password_configured, name, system_role)
           VALUES (?, ?, 1, ?, ?)`
        ).run(String(email).trim().toLowerCase(), passwordHash, name, systemRole);
        return rowToUser(selectById(db, result.lastInsertRowid));
      });
    },
    createFromGoogle({ email, name = null, providerSubject }) {
      return withDb((db) => db.transaction(() => {
        const normalizedEmail = String(email).trim().toLowerCase();
        const result = db.prepare(
          `INSERT INTO users (email, password_hash, password_configured, name, system_role)
           VALUES (?, ?, 0, ?, 'user')`
        ).run(normalizedEmail, DISABLED_PASSWORD_HASH, name);
        db.prepare(
          `INSERT INTO user_identities (user_id, provider, provider_subject, provider_email)
           VALUES (?, 'google', ?, ?)`
        ).run(result.lastInsertRowid, providerSubject, normalizedEmail);
        return rowToUser(selectById(db, result.lastInsertRowid));
      })());
    },
    findByEmail(email) {
      return withDb((db) => db.prepare(`${USER_SELECT} WHERE users.email = ?`)
        .get(String(email || "").trim().toLowerCase()));
    },
    findByGoogleSubject(providerSubject) {
      return withDb((db) => db.prepare(
        `${USER_SELECT}
         WHERE users.id = (
           SELECT identity.user_id FROM user_identities identity
           WHERE identity.provider = 'google' AND identity.provider_subject = ?
         )`
      ).get(providerSubject));
    },
    findById(id) {
      return withDb((db) => rowToUser(selectById(db, id)));
    },
    list() {
      return withDb((db) => db.prepare(`${USER_SELECT} ORDER BY users.email ASC`).all().map(rowToUser));
    },
    remove(id) {
      return withDb((db) => db.transaction(() => {
        const current = selectById(db, id);
        if (!current) return null;
        if (current.enabled && current.system_role === "system_admin") {
          const total = db.prepare("SELECT COUNT(*) AS total FROM users WHERE enabled = 1 AND system_role = 'system_admin'").get().total;
          if (total <= 1) return { lastSystemAdmin: true };
        }
        db.prepare("DELETE FROM users WHERE id = ?").run(id);
        return rowToUser(current);
      })());
    },
    touchLogin(id) {
      return withDb((db) => {
        db.prepare(`UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(id);
        return rowToUser(selectById(db, id));
      });
    },
    linkGoogle({ userId, providerSubject, providerEmail }) {
      return withDb((db) => db.transaction(() => {
        const current = selectById(db, userId);
        if (!current) return null;
        const linked = db.prepare(
          `SELECT user_id, provider_subject FROM user_identities
           WHERE provider = 'google' AND (user_id = ? OR provider_subject = ?)`
        ).all(userId, providerSubject);
        const subjectOwner = linked.find((identity) => identity.provider_subject === providerSubject);
        if (subjectOwner && subjectOwner.user_id !== userId) return { subjectConflict: true };
        const userIdentity = linked.find((identity) => identity.user_id === userId);
        if (userIdentity && userIdentity.provider_subject !== providerSubject) return { userConflict: true };
        if (!userIdentity) {
          db.prepare(
            `INSERT INTO user_identities (user_id, provider, provider_subject, provider_email)
             VALUES (?, 'google', ?, ?)`
          ).run(userId, providerSubject, String(providerEmail).trim().toLowerCase());
        }
        return rowToUser(selectById(db, userId));
      })());
    },
    configurePassword(userId, passwordHash) {
      return withDb((db) => db.transaction(() => {
        const current = db.prepare("SELECT id, password_configured FROM users WHERE id = ?").get(userId);
        if (!current) return null;
        if (current.password_configured) return { alreadyConfigured: true };
        db.prepare(
          `UPDATE users
           SET password_hash = ?, password_configured = 1, updated_at = datetime('now')
           WHERE id = ?`
        ).run(passwordHash, userId);
        return rowToUser(selectById(db, userId));
      })());
    },
    update(id, { name, systemRole }) {
      return withDb((db) => {
        const transaction = db.transaction(() => {
          const current = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
          if (!current) return null;
          const nextRole = systemRole === undefined ? current.system_role : systemRole;
          if (current.system_role === "system_admin" && nextRole !== "system_admin") {
            const total = db.prepare("SELECT COUNT(*) AS total FROM users WHERE enabled = 1 AND system_role = 'system_admin'").get().total;
            if (total <= 1) return { lastSystemAdmin: true };
          }
          db.prepare(`UPDATE users SET name = ?, system_role = ?, updated_at = datetime('now') WHERE id = ?`)
            .run(name === undefined ? current.name : name, nextRole, id);
          return rowToUser(selectById(db, id));
        });
        return transaction();
      });
    },
  };
}

module.exports = { createUserRepository, rowToUser };
