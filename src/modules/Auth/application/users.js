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
function resolveEnabledUserById({ config, userId }) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const user = createUserRepository({ config }).findById(id);
  return user && user.enabled ? user : null;
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
function updateOwnProfile({ config, userId, input }) {
  if (!input || !Object.prototype.hasOwnProperty.call(input, "name") || typeof input.name !== "string") {
    throw new AppError({ code: "PROFILE_NAME_REQUIRED", message: "Name is required.", status: 422 });
  }
  const name = input.name.trim();
  if (name.length > 120) {
    throw new AppError({ code: "PROFILE_NAME_TOO_LONG", message: "Name must be 120 characters or fewer.", status: 422 });
  }
  const result = createUserRepository({ config }).update(userId, { name: name || null });
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  return result;
}
function deleteUser({ config, actorUserId, userId }) {
  if (Number(actorUserId) === Number(userId)) {
    throw new AppError({ code: "CANNOT_DELETE_SELF", message: "You cannot delete your own user account.", status: 409 });
  }
  let result;
  try {
    result = createUserRepository({ config }).remove(userId);
  } catch (error) {
    if (/Project owner cannot be removed|FOREIGN KEY constraint failed/.test(String(error.message))) {
      throw new AppError({
        code: "USER_DELETE_BLOCKED",
        message: "This user owns one or more Projects. Resolve Project ownership before deleting the user.",
        status: 409,
      });
    }
    throw error;
  }
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  if (result.lastSystemAdmin) throw new AppError({ code: "LAST_SYSTEM_ADMIN", message: "The last enabled system admin cannot be deleted.", status: 409 });
  return { id: result.id, deleted: true };
}
function updateUser({ config, userId, input }) {
  if (input.system_role !== undefined) assertRole(input.system_role);
  const result = createUserRepository({ config }).update(userId, { name: input.name, systemRole: input.system_role });
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  if (result.lastSystemAdmin) throw new AppError({ code: "LAST_SYSTEM_ADMIN", message: "The last enabled system admin cannot be demoted.", status: 409 });
  return result;
}

module.exports = { createUser, deleteUser, listUsers, resolveEnabledUserByEmail, resolveEnabledUserById, touchUserLogin, updateOwnProfile, updateUser };
