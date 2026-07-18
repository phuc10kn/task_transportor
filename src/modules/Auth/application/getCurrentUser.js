const { AppError } = require("../../../http/errors/AppError");
const { createUserRepository } = require("../infrastructure/UserRepository");

function getCurrentUser({ config, userId }) {
  const user = createUserRepository({ config }).findById(userId);
  if (!user || !user.enabled) {
    throw new AppError({ code: "UNAUTHENTICATED", message: "Authentication is required.", status: 401 });
  }
  return user;
}

module.exports = { getCurrentUser };

