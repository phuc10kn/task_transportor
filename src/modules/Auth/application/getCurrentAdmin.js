const { AppError } = require("../../../http/errors/AppError");
const { createAdminUserRepository } = require("../infrastructure/AdminUserRepository");

function getCurrentAdmin({ config, adminId }) {
  const repository = createAdminUserRepository({ config });
  const admin = repository.findById(adminId);

  if (!admin || !admin.enabled) {
    throw new AppError({
      code: "UNAUTHENTICATED",
      message: "Authentication is required.",
      status: 401,
    });
  }

  return admin;
}

module.exports = {
  getCurrentAdmin,
};
