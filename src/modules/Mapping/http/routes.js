const express = require("express");

const MappingRulesController = require("./controllers/MappingRulesController");

function createMappingRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId", requireProjectWorkspace);
  router.get("/projects/:projectId/mapping-settings", MappingRulesController.settings);
  router.get("/projects/:projectId/mapping-rules", MappingRulesController.list);
  router.post("/projects/:projectId/mapping-rules", MappingRulesController.create);
  router.get("/projects/:projectId/mapping-rules/:ruleId", MappingRulesController.show);
  router.patch("/projects/:projectId/mapping-rules/:ruleId", MappingRulesController.update);
  router.delete("/projects/:projectId/mapping-rules/:ruleId", MappingRulesController.remove);
  router.post("/projects/:projectId/mapping-rules/:ruleId/approve", MappingRulesController.approve);
  router.post("/projects/:projectId/mapping-rules/:ruleId/reject", MappingRulesController.reject);

  return router;
}

module.exports = {
  createMappingRouter,
};
