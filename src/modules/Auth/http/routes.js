const express = require("express");

const AuthController = require("./controllers/AuthController");
const UsersController = require("./controllers/UsersController");
const { createAuthenticateUser } = require("./middleware/authenticate");
const { requireSystemAdmin } = require("./middleware/requireSystemAdmin");

function createAuthRouter() {
  const router = express.Router();
  const authenticate = createAuthenticateUser();

  router.get("/google/config", AuthController.googleConfig);
  router.post("/google", AuthController.google);
  router.post("/login", AuthController.login);
  router.post("/logout", authenticate, AuthController.logout);
  router.get("/me", authenticate, AuthController.me);

  return router;
}

function createUsersRouter() {
  const router = express.Router();
  router.use(createAuthenticateUser(), requireSystemAdmin);
  router.get("/", UsersController.list);
  router.post("/", UsersController.create);
  router.patch("/:userId", UsersController.update);
  return router;
}

module.exports = {
  createAuthRouter,
  createUsersRouter,
};
