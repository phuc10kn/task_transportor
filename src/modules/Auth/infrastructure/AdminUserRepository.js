const { createConnection } = require("../../../infrastructure/database/connection");

function rowToAdmin(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    enabled: Boolean(row.enabled),
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createAdminUserRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    create({ email, passwordHash, name = null }) {
      return withDb((db) => {
        const result = db
          .prepare(
            `INSERT INTO admin_users (email, password_hash, name)
             VALUES (?, ?, ?)`
          )
          .run(email.toLowerCase(), passwordHash, name);

        return rowToAdmin(
          db.prepare("SELECT * FROM admin_users WHERE id = ?").get(result.lastInsertRowid)
        );
      });
    },

    findByEmail(email) {
      return withDb((db) =>
        db.prepare("SELECT * FROM admin_users WHERE email = ?").get(String(email).toLowerCase())
      );
    },

    findById(id) {
      return withDb((db) => rowToAdmin(db.prepare("SELECT * FROM admin_users WHERE id = ?").get(id)));
    },

    count() {
      return withDb((db) => db.prepare("SELECT COUNT(*) AS total FROM admin_users").get().total);
    },

    touchLogin(id) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE admin_users
             SET last_login_at = datetime('now'), updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(id);

        return rowToAdmin(db.prepare("SELECT * FROM admin_users WHERE id = ?").get(id));
      });
    },
  };
}

module.exports = {
  createAdminUserRepository,
  rowToAdmin,
};
