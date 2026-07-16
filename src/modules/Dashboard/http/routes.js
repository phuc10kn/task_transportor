const express = require("express");

const DashboardController = require("./controllers/DashboardController");

function createDashboardRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId/dashboard", requireProjectWorkspace);
  router.get("/projects/:projectId/dashboard/summary", DashboardController.summary);
  router.get("/projects/:projectId/dashboard/alerts", DashboardController.alerts);

  return router;
}

module.exports = {
  createDashboardRouter,
};
