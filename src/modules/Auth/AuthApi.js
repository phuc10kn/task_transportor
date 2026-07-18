const { bootstrapSystemAdmin } = require("./application/bootstrapSystemAdmin");
const { getCurrentUser } = require("./application/getCurrentUser");
const { login } = require("./application/login");
const { configurePassword, linkGoogleIdentity, loginWithGoogle } = require("./application/googleIdentity");
const { createUser, deleteUser, listUsers, resolveEnabledUserByEmail, resolveEnabledUserById, touchUserLogin, updateOwnProfile, updateUser } = require("./application/users");
const { issueUserSession } = require("./application/session");

function logout() {
  return { logged_out: true };
}

module.exports = {
  bootstrapSystemAdmin,
  configurePassword,
  createUser,
  deleteUser,
  getCurrentUser,
  issueUserSession,
  linkGoogleIdentity,
  listUsers,
  login,
  loginWithGoogle,
  logout,
  resolveEnabledUserByEmail,
  resolveEnabledUserById,
  touchUserLogin,
  updateOwnProfile,
  updateUser,
};
