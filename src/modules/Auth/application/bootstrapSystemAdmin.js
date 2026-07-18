const { AppError } = require("../../../http/errors/AppError");
const { hashPassword } = require("../../../infrastructure/security/passwordHasher");
const { createUserRepository, rowToUser } = require("../infrastructure/UserRepository");

function bootstrapSystemAdmin({ config, email, password, name = "Administrator" }) {
  const userEmail = email || process.env.ADMIN_EMAIL;
  const userPassword = password || process.env.ADMIN_PASSWORD;
  if (!userEmail || !userPassword) {
    throw new AppError({ code: "ADMIN_BOOTSTRAP_CONFIG_REQUIRED", message: "ADMIN_EMAIL and ADMIN_PASSWORD are required to bootstrap system admin.", status: 400 });
  }
  const repository = createUserRepository({ config });
  const existing = repository.findByEmail(userEmail);
  if (existing) return { user: rowToUser(existing), created: false };
  return { user: repository.create({ email: userEmail, passwordHash: hashPassword(userPassword), name, systemRole: "system_admin" }), created: true };
}

module.exports = { bootstrapSystemAdmin };

