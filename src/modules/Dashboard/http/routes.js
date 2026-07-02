const express = require("express");

const DashboardController = require("./controllers/DashboardController");

function createDashboardRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/dashboard/summary", DashboardController.summary);
  router.get("/dashboard/alerts", DashboardController.alerts);

  return router;
}

module.exports = {
  createDashboardRouter,
};
