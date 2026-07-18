const { AppError } = require("../../../../http/errors/AppError");
const { verifyJwt } = require("../../../../infrastructure/security/jwt");
const { updateTraceContext } = require("../../../../infrastructure/observability/traceContext");
const AuthApi = require("../../AuthApi");

function createAuthenticateAdmin() {
  return function authenticateAdmin(req, res, next) {
    try {
      const header = req.get("authorization") || "";
      const match = header.match(/^Bearer\s+(.+)$/i);

      if (!match) {
        throw new AppError({
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
          status: 401,
        });
      }

      let payload;
      try {
        payload = verifyJwt(match[1], {
          secret: req.app.locals.config.security.jwtSecret,
        });
      } catch (error) {
        throw new AppError({
          code: "UNAUTHENTICATED",
          message: "Invalid or expired token.",
          status: 401,
        });
      }

      req.user = AuthApi.getCurrentAdmin({
        config: req.app.locals.config,
        adminId: Number(payload.sub),
      });
      updateTraceContext({ user_id: req.user.id });
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  createAuthenticateAdmin,
};
