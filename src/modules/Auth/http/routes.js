const express = require("express");

const AuthController = require("./controllers/AuthController");
const { createAuthenticateAdmin } = require("./middleware/authenticate");

function createAuthRouter() {
  const router = express.Router();
  const authenticate = createAuthenticateAdmin();

  router.post("/login", AuthController.login);
  router.post("/logout", authenticate, AuthController.logout);
  router.get("/me", authenticate, AuthController.me);

  return router;
}

module.exports = {
  createAuthRouter,
};
