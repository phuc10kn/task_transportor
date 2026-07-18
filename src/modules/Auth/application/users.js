const { AppError } = require("../../../http/errors/AppError");
const { hashPassword } = require("../../../infrastructure/security/passwordHasher");
const { createUserRepository, rowToUser } = require("../infrastructure/UserRepository");

function normalizedEmail(value) { return String(value || "").trim().toLowerCase(); }
function assertRole(role) {
  if (!["system_admin", "user"].includes(role)) throw new AppError({ code: "INVALID_SYSTEM_ROLE", message: "System role must be system_admin or user.", status: 422 });
}
function resolveEnabledUserByEmail({ config, email }) {
  const row = createUserRepository({ config }).findByEmail(normalizedEmail(email));
  return row && row.enabled ? rowToUser(row) : null;
}
function listUsers({ config }) { return createUserRepository({ config }).list(); }
function touchUserLogin({ config, userId }) { return createUserRepository({ config }).touchLogin(userId); }
function createUser({ config, input }) {
  const email = normalizedEmail(input.email);
  const password = String(input.password || "");
  const role = input.system_role || "user";
  if (!email || !email.includes("@") || password.length < 8) throw new AppError({ code: "USER_INPUT_REQUIRED", message: "A valid email and password of at least 8 characters are required.", status: 422 });
  assertRole(role);
  try { return createUserRepository({ config }).create({ email, passwordHash: hashPassword(password), name: input.name || null, systemRole: role }); }
  catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new AppError({ code: "USER_EMAIL_EXISTS", message: "A user with this email already exists.", status: 409 });
    throw error;
  }
}
function updateUser({ config, userId, input }) {
  if (input.system_role !== undefined) assertRole(input.system_role);
  const result = createUserRepository({ config }).update(userId, { name: input.name, systemRole: input.system_role });
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  if (result.lastSystemAdmin) throw new AppError({ code: "LAST_SYSTEM_ADMIN", message: "The last enabled system admin cannot be demoted.", status: 409 });
  return result;
}

module.exports = { createUser, listUsers, resolveEnabledUserByEmail, touchUserLogin, updateUser };
