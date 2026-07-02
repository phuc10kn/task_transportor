const express = require("express");

const AnomaliesController = require("./controllers/AnomaliesController");

function createAnomalyRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/anomalies", AnomaliesController.list);
  router.post("/anomalies", AnomaliesController.create);
  router.get("/anomalies/:anomalyId", AnomaliesController.show);
  router.post("/anomalies/:anomalyId/ignore", AnomaliesController.ignore);
  router.post("/anomalies/:anomalyId/resolve", AnomaliesController.resolve);

  return router;
}

module.exports = {
  createAnomalyRouter,
};
