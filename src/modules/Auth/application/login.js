const { AppError } = require("../../../http/errors/AppError");
const { verifyPassword } = require("../../../infrastructure/security/passwordHasher");
const { createUserRepository } = require("../infrastructure/UserRepository");
const { issueUserSession } = require("./session");

function login({ config, email, password }) {
  if (!email || !password) {
    throw new AppError({
      code: "AUTH_REQUIRED",
      message: "Email and password are required.",
      status: 400,
    });
  }

  const repository = createUserRepository({ config });
  const row = repository.findByEmail(email);

  if (!row || !row.enabled || !row.password_configured || !verifyPassword(password, row.password_hash)) {
    throw new AppError({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      status: 401,
    });
  }

  return issueUserSession({ config, user: repository.touchLogin(row.id) });
}

module.exports = {
  login,
};
