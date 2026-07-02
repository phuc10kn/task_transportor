const AuthApi = require("../../AuthApi");
const { success } = require("../../../../http/response/envelope");

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
    success(res, { admin: req.user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  me,
};
