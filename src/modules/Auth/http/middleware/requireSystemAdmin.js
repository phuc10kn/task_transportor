const { AppError } = require("../../../../http/errors/AppError");

function requireSystemAdmin(req, res, next) {
  if (!req.user || req.user.system_role !== "system_admin") {
    return next(new AppError({ code: "FORBIDDEN", message: "System administrator access is required.", status: 403 }));
  }
  next();
}

module.exports = { requireSystemAdmin };

