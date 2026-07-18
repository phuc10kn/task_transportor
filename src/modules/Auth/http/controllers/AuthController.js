const AuthApi = require("../../AuthApi");
const { success } = require("../../../../http/response/envelope");
const { AppError } = require("../../../../http/errors/AppError");

function login(req, res, next) {
  try {
    const result = AuthApi.login({
      config: req.app.locals.config,
      email: req.body.email,
      password: req.body.password,
    });

    success(res, result);
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  try {
    success(res, AuthApi.logout());
  } catch (error) {
    next(error);
  }
}

function me(req, res, next) {
  try {
    success(res, { user: req.user });
  } catch (error) {
    next(error);
  }
}

async function google(req, res, next) {
  try {
    const config = req.app.locals.config;
    if (!config.auth.google.enabled || !req.app.locals.googleVerifier) {
      throw new AppError({ code: "GOOGLE_LOGIN_DISABLED", message: "Google login is not available.", status: 404 });
    }
    if (!req.is("application/json") || req.get("origin") !== config.auth.google.publicOrigin) {
      throw new AppError({ code: "GOOGLE_LOGIN_REJECTED", message: "Google login could not be completed.", status: 403 });
    }
    let identity;
    try { identity = await req.app.locals.googleVerifier.verify(req.body && req.body.credential); }
    catch (_) { identity = null; }
    const user = identity && identity.email_verified
      ? AuthApi.resolveEnabledUserByEmail({ config, email: identity.email })
      : null;
    if (!user) {
      throw new AppError({ code: "GOOGLE_LOGIN_REJECTED", message: "Google login could not be completed.", status: 401 });
    }
    success(res, AuthApi.issueUserSession({ config, user: AuthApi.touchUserLogin({ config, userId: user.id }) }));
  } catch (error) { next(error); }
}

function googleConfig(req, res) {
  success(res, { enabled: req.app.locals.config.auth.google.enabled, client_id: req.app.locals.config.auth.google.clientId || null });
}

module.exports = {
  login,
  google,
  googleConfig,
  logout,
  me,
};
