const AuthApi = require("../../AuthApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try { success(res, AuthApi.listUsers({ config: req.app.locals.config })); } catch (error) { next(error); }
}
function create(req, res, next) {
  try { success(res, AuthApi.createUser({ config: req.app.locals.config, input: req.body || {} }), 201); } catch (error) { next(error); }
}
function update(req, res, next) {
  try { success(res, AuthApi.updateUser({ config: req.app.locals.config, userId: Number(req.params.userId), input: req.body || {} })); } catch (error) { next(error); }
}

module.exports = { create, list, update };

