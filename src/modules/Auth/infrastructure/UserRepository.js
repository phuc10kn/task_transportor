const { createConnection } = require("../../../infrastructure/database/connection");

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    system_role: row.system_role,
    enabled: Boolean(row.enabled),
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

  return {
    create({ email, passwordHash, name = null, systemRole = "user" }) {
      return withDb((db) => {
        const result = db.prepare(
          `INSERT INTO users (email, password_hash, name, system_role)
           VALUES (?, ?, ?, ?)`
        ).run(String(email).trim().toLowerCase(), passwordHash, name, systemRole);
        return rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid));
      });
    },
    findByEmail(email) {
      return withDb((db) => db.prepare("SELECT * FROM users WHERE email = ?")
        .get(String(email || "").trim().toLowerCase()));
    },
    findById(id) {
      return withDb((db) => rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id)));
    },
    list() {
      return withDb((db) => db.prepare("SELECT * FROM users ORDER BY email ASC").all().map(rowToUser));
    },
    touchLogin(id) {
      return withDb((db) => {
        db.prepare(`UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(id);
        return rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
      });
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
          return rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
        });
        return transaction();
      });
    },
  };
}

module.exports = { createUserRepository, rowToUser };

