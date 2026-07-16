const express = require("express");

const AnomaliesController = require("./controllers/AnomaliesController");

function createAnomalyRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId", requireProjectWorkspace);
  router.get("/projects/:projectId/anomalies", AnomaliesController.list);
  router.post("/projects/:projectId/anomalies", AnomaliesController.create);
  router.get("/projects/:projectId/anomalies/:anomalyId", AnomaliesController.show);
  router.post("/projects/:projectId/anomalies/:anomalyId/ignore", AnomaliesController.ignore);
  router.post("/projects/:projectId/anomalies/:anomalyId/resolve", AnomaliesController.resolve);

  return router;
}

module.exports = {
  createAnomalyRouter,
};
