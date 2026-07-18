const { bootstrapSystemAdmin } = require("./application/bootstrapSystemAdmin");
const { getCurrentUser } = require("./application/getCurrentUser");
const { login } = require("./application/login");
const { createUser, listUsers, resolveEnabledUserByEmail, touchUserLogin, updateUser } = require("./application/users");
const { issueUserSession } = require("./application/session");

function logout() {
  return { logged_out: true };
}

module.exports = {
  bootstrapSystemAdmin,
  createUser,
  getCurrentUser,
  issueUserSession,
  listUsers,
  login,
  logout,
  resolveEnabledUserByEmail,
  touchUserLogin,
  updateUser,
};
