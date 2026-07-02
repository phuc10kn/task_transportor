const { AppError } = require("../../../http/errors/AppError");
const { signJwt } = require("../../../infrastructure/security/jwt");
const { verifyPassword } = require("../../../infrastructure/security/passwordHasher");
const { createAdminUserRepository, rowToAdmin } = require("../infrastructure/AdminUserRepository");

function login({ config, email, password }) {
  if (!email || !password) {
    throw new AppError({
      code: "AUTH_REQUIRED",
      message: "Email and password are required.",
      status: 400,
    });
  }

  const repository = createAdminUserRepository({ config });
  const row = repository.findByEmail(email);

  if (!row || !row.enabled || !verifyPassword(password, row.password_hash)) {
    throw new AppError({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      status: 401,
    });
  }

  const admin = repository.touchLogin(row.id);
  const token = signJwt(
    {
      sub: String(row.id),
      email: row.email,
      type: "admin",
    },
    {
      secret: config.security.jwtSecret,
      expiresInSeconds: config.security.jwtExpiresInSeconds,
    }
  );

  return {
    token,
    token_type: "Bearer",
    expires_in: config.security.jwtExpiresInSeconds,
    admin: rowToAdmin({ ...row, ...admin }),
  };
}

module.exports = {
  login,
};
