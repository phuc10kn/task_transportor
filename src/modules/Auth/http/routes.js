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
  router.post("/google/link", authenticate, AuthController.linkGoogle);
  router.post("/login", AuthController.login);
  router.post("/logout", authenticate, AuthController.logout);
  router.post("/password", authenticate, AuthController.configurePassword);
  router.get("/me", authenticate, AuthController.me);
  router.patch("/me", authenticate, AuthController.updateMe);

  return router;
}

function createUsersRouter() {
  const router = express.Router();
  router.use(createAuthenticateUser(), requireSystemAdmin);
  router.get("/", UsersController.list);
  router.post("/", UsersController.create);
  router.patch("/:userId", UsersController.update);
  router.delete("/:userId", UsersController.remove);
  return router;
}

module.exports = {
  createAuthRouter,
  createUsersRouter,
};
