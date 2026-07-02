const { bootstrapAdmin } = require("./application/bootstrapAdmin");
const { getCurrentAdmin } = require("./application/getCurrentAdmin");
const { login } = require("./application/login");

function logout() {
  return { logged_out: true };
}

module.exports = {
  bootstrapAdmin,
  getCurrentAdmin,
  login,
  logout,
};
