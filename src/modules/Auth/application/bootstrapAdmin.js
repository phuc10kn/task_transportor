const { AppError } = require("../../../http/errors/AppError");
const { hashPassword } = require("../../../infrastructure/security/passwordHasher");
const { createAdminUserRepository } = require("../infrastructure/AdminUserRepository");

function bootstrapAdmin({ config, email, password, name = "Administrator" }) {
  const adminEmail = email || process.env.ADMIN_EMAIL;
  const adminPassword = password || process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new AppError({
      code: "ADMIN_BOOTSTRAP_CONFIG_REQUIRED",
      message: "ADMIN_EMAIL and ADMIN_PASSWORD are required to bootstrap admin.",
      status: 400,
    });
  }

  const repository = createAdminUserRepository({ config });
  const existing = repository.findByEmail(adminEmail);

  if (existing) {
    return {
      admin: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        enabled: Boolean(existing.enabled),
      },
      created: false,
    };
  }

  const admin = repository.create({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    name,
  });

  return { admin, created: true };
}

module.exports = {
  bootstrapAdmin,
};
